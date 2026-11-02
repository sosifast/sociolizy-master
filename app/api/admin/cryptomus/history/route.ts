import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({
      success: true,
      data: transactions,
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
    const { cookies } = await import("next/headers");
    const { verifySessionToken } = await import("@/lib/auth");
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session || session.level !== "Admin") {
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
    if ((newStatus === "paid" || newStatus === "paid_over") && prevStatus !== "paid") {
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

