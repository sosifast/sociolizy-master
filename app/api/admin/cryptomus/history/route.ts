import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const session = await verifySessionToken(token);
  return session && session.level === "Admin";
}

export async function GET(request: Request) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "all") {
      where.payment_status = status;
    }

    if (search) {
      where.OR = [
        { order_id: { contains: search, mode: "insensitive" } },
        { txid: { contains: search, mode: "insensitive" } },
        { crypto_currency: { contains: search, mode: "insensitive" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.cryptomusTransaction.findMany({
        where,
        orderBy: { create_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.cryptomusTransaction.count({ where }),
    ]);

    // Attach user information
    const userIds = Array.from(
      new Set(
        transactions
          .map((t) => t.user_id)
          .filter((id): id is number => typeof id === "number")
      )
    );

    const users =
      userIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, username: true, email: true, name: true, balance: true },
          })
        : [];

    const userMap = new Map(users.map((u) => [u.id, u]));

    const enriched = transactions.map((t) => ({
      ...t,
      amount: Number(t.amount),
      crypto_amount: t.crypto_amount ? Number(t.crypto_amount) : null,
      user: t.user_id ? userMap.get(t.user_id) || null : null,
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/cryptomus/history error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat riwayat transaksi Cryptomus" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  await connection();

  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const body = await request.json();
    const { order_id, payment_status } = body;

    if (!order_id || !payment_status) {
      return NextResponse.json(
        { success: false, message: "order_id dan payment_status wajib diisi" },
        { status: 400 }
      );
    }

    const tx = await prisma.cryptomusTransaction.findUnique({
      where: { order_id },
    });

    if (!tx) {
      return NextResponse.json({ success: false, message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    const prevStatus = tx.payment_status;
    const newStatus = String(payment_status).toLowerCase();

    await prisma.cryptomusTransaction.update({
      where: { order_id },
      data: { payment_status: newStatus },
    });

    let newBalance: number | null = null;
    let userUuid: string | null = null;
    let username: string = "";

    // If marked paid manually, credit user balance
    if ((newStatus === "paid" || newStatus === "paid_over") && prevStatus !== "paid" && prevStatus !== "paid_over") {
      if (tx.user_id) {
        const updatedUser = await prisma.user.update({
          where: { id: tx.user_id },
          data: {
            balance: {
              increment: tx.amount,
            },
          },
          select: { uuid: true, username: true, balance: true },
        });

        newBalance = Number(updatedUser.balance);
        userUuid = updatedUser.uuid;
        username = updatedUser.username;
      }
    } else if (tx.user_id) {
      const u = await prisma.user.findUnique({
        where: { id: tx.user_id },
        select: { uuid: true, username: true, balance: true },
      });
      if (u) {
        userUuid = u.uuid;
        username = u.username;
        newBalance = Number(u.balance);
      }
    }

    // Trigger Pusher
    try {
      const { pusherServer } = await import("@/lib/pusher");
      const payload = {
        order_id: tx.order_id,
        status: newStatus,
        amount: Number(tx.amount),
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
      message: `Status deposit ${order_id} berhasil diubah ke ${newStatus}`,
      data: { order_id, payment_status: newStatus, newBalance },
    });
  } catch (error) {
    console.error("PATCH /api/admin/cryptomus/history error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  await connection();

  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const order_id = searchParams.get("order_id");

    if (!id && !order_id) {
      return NextResponse.json(
        { success: false, message: "ID atau order_id wajib disertakan" },
        { status: 400 }
      );
    }

    const txId = id ? parseInt(id, 10) : undefined;
    const tx = txId && !isNaN(txId)
      ? await prisma.cryptomusTransaction.findUnique({ where: { id: txId } })
      : await prisma.cryptomusTransaction.findUnique({ where: { order_id: order_id || "" } });

    if (!tx) {
      return NextResponse.json({ success: false, message: "Transaksi tidak ditemukan" }, { status: 404 });
    }

    await prisma.cryptomusTransaction.delete({
      where: { id: tx.id },
    });

    return NextResponse.json({
      success: true,
      message: `Transaksi deposit ${tx.order_id} berhasil dihapus`,
    });
  } catch (error) {
    console.error("DELETE /api/admin/cryptomus/history error:", error);
    const message = error instanceof Error ? error.message : "Error server";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
