import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { isCryptomusEditDisabled } from "@/lib/cryptomus-status";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const session = await verifySessionToken(token);
  return session && session.level === "Admin";
}

/**
 * GET /api/admin/cryptomus/history/[id]
 * Fetch single Cryptomus transaction by ID with associated user details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();

  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const txId = parseInt(id, 10);

    const tx = isNaN(txId)
      ? await prisma.cryptomusTransaction.findUnique({ where: { order_id: id } })
      : await prisma.cryptomusTransaction.findFirst({
          where: { OR: [{ id: txId }, { order_id: id }] },
        });

    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    let user = null;
    if (tx.user_id) {
      user = await prisma.user.findUnique({
        where: { id: tx.user_id },
        select: {
          id: true,
          uuid: true,
          username: true,
          email: true,
          name: true,
          balance: true,
          server_area: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tx,
        amount: Number(tx.amount),
        crypto_amount: tx.crypto_amount ? Number(tx.crypto_amount) : null,
        user: user
          ? {
              ...user,
              balance: Number(user.balance),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/cryptomus/history/[id] error:", error);
    const message = error instanceof Error ? error.message : "Error server";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

/**
 * PUT / PATCH /api/admin/cryptomus/history/[id]
 * Update transaction fields (status, amount, crypto, txid, invoice_url)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();

  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const txId = parseInt(id, 10);

    const tx = isNaN(txId)
      ? await prisma.cryptomusTransaction.findUnique({ where: { order_id: id } })
      : await prisma.cryptomusTransaction.findFirst({
          where: { OR: [{ id: txId }, { order_id: id }] },
        });

    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    // Periksa apakah status transaksi saat ini terkunci (cancel, error, fail, selesai, finish, paid, paid_over)
    if (isCryptomusEditDisabled(tx.payment_status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Transaksi dengan status "${tx.payment_status}" sudah final dan tidak dapat diedit kembali.`,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      amount,
      currency,
      crypto_amount,
      crypto_currency,
      payment_status,
      txid,
      invoice_url,
      user_id,
      credit_balance = true,
    } = body;

    const prevStatus = tx.payment_status.toLowerCase();
    const newStatus = payment_status ? String(payment_status).trim().toLowerCase() : prevStatus;
    const parsedAmount = amount !== undefined ? Number(amount) : Number(tx.amount);

    // Update transaction
    const updateData: any = {};
    if (payment_status !== undefined) updateData.payment_status = newStatus;
    if (amount !== undefined) updateData.amount = parsedAmount;
    if (currency !== undefined) updateData.currency = String(currency).trim().toUpperCase();
    if (crypto_amount !== undefined) updateData.crypto_amount = crypto_amount ? Number(crypto_amount) : null;
    if (crypto_currency !== undefined) updateData.crypto_currency = crypto_currency ? String(crypto_currency).trim().toUpperCase() : null;
    if (txid !== undefined) updateData.txid = txid ? String(txid).trim() : null;
    if (invoice_url !== undefined) updateData.invoice_url = invoice_url ? String(invoice_url).trim() : null;
    if (user_id !== undefined) updateData.user_id = user_id ? parseInt(user_id, 10) : null;

    const updatedTx = await prisma.cryptomusTransaction.update({
      where: { id: tx.id },
      data: updateData,
    });

    const targetUserId = updateData.user_id !== undefined ? updateData.user_id : tx.user_id;

    // Credit user balance if transitioning to paid/paid_over and credit_balance is true
    let newBalance: number | null = null;
    let userUuid: string | null = null;
    let username: string = "";

    if (
      credit_balance &&
      (newStatus === "paid" || newStatus === "paid_over") &&
      prevStatus !== "paid" &&
      prevStatus !== "paid_over"
    ) {
      if (targetUserId) {
        const updatedUser = await prisma.user.update({
          where: { id: targetUserId },
          data: {
            balance: {
              increment: parsedAmount,
            },
          },
          select: { uuid: true, username: true, balance: true },
        });

        newBalance = Number(updatedUser.balance);
        userUuid = updatedUser.uuid;
        username = updatedUser.username;
      }
    } else if (targetUserId) {
      const u = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { uuid: true, username: true, balance: true },
      });
      if (u) {
        userUuid = u.uuid;
        username = u.username;
        newBalance = Number(u.balance);
      }
    }

    // Trigger Pusher notifications
    try {
      const { pusherServer } = await import("@/lib/pusher");
      const payload = {
        order_id: updatedTx.order_id,
        status: newStatus,
        amount: Number(updatedTx.amount),
        username,
        new_balance: newBalance,
      };

      await pusherServer.trigger("admin-notifications", "deposit-status-updated", payload);
      await pusherServer.trigger("admin-deposits", "deposit-status-updated", payload);

      if (userUuid) {
        await pusherServer.trigger(`member-${userUuid}`, "deposit-status-updated", payload);
        if (newBalance !== null) {
          await pusherServer.trigger(`member-${userUuid}`, "balance-updated", {
            balance: newBalance,
          });
        }
      }
    } catch (pErr) {
      console.warn("[Pusher] Failed to broadcast manual deposit status update:", pErr);
    }

    return NextResponse.json({
      success: true,
      message: `Transaksi deposit ${updatedTx.order_id} berhasil diperbarui`,
      data: {
        ...updatedTx,
        amount: Number(updatedTx.amount),
        crypto_amount: updatedTx.crypto_amount ? Number(updatedTx.crypto_amount) : null,
        newBalance,
      },
    });
  } catch (error) {
    console.error("PUT /api/admin/cryptomus/history/[id] error:", error);
    const message = error instanceof Error ? error.message : "Error server";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/cryptomus/history/[id]
 * Deletes transaction record
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();

  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const { id } = await params;
    const txId = parseInt(id, 10);

    const tx = isNaN(txId)
      ? await prisma.cryptomusTransaction.findUnique({ where: { order_id: id } })
      : await prisma.cryptomusTransaction.findFirst({
          where: { OR: [{ id: txId }, { order_id: id }] },
        });

    if (!tx) {
      return NextResponse.json(
        { success: false, message: "Transaksi tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.cryptomusTransaction.delete({
      where: { id: tx.id },
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi deposit ${tx.order_id} berhasil dihapus`,
    });
  } catch (error) {
    console.error("DELETE /api/admin/cryptomus/history/[id] error:", error);
    const message = error instanceof Error ? error.message : "Error server";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

