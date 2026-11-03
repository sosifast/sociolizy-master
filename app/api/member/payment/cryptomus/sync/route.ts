import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { getCryptomusPaymentInfo } from "@/lib/cryptomus";

export async function POST(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, message: "order_id wajib disertakan." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: { id: true, uuid: true, username: true, balance: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    const tx = await prisma.cryptomusTransaction.findUnique({
      where: { order_id },
    });

    if (!tx || tx.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: "Transaksi tidak ditemukan." },
        { status: 404 }
      );
    }

    // If transaction is already paid, return current status
    if (tx.payment_status === "paid" || tx.payment_status === "paid_over") {
      return NextResponse.json({
        success: true,
        data: {
          order_id: tx.order_id,
          payment_status: tx.payment_status,
          txid: tx.txid,
          balance: Number(user.balance),
        },
      });
    }

    const setting = await prisma.cryptomusSetting.findFirst({
      orderBy: { id: "asc" },
    });

    if (!setting?.merchant_id || !setting?.payment_key) {
      return NextResponse.json(
        { success: false, message: "Cryptomus API key belum dikonfigurasi." },
        { status: 400 }
      );
    }

    const info = await getCryptomusPaymentInfo({
      orderId: tx.order_id,
      merchantId: setting.merchant_id,
      paymentKey: setting.payment_key,
    });

    if (!info.success || !info.status) {
      return NextResponse.json({
        success: false,
        message: info.error || "Gagal mengambil status dari Cryptomus.",
      });
    }

    const newStatus = info.status.toLowerCase();
    const currentStatus = tx.payment_status;

    await prisma.cryptomusTransaction.update({
      where: { order_id: tx.order_id },
      data: {
        payment_status: newStatus,
        txid: info.txid ? String(info.txid) : tx.txid,
        raw_response: JSON.stringify(info.raw),
      },
    });

    let newBalance = Number(user.balance);

    if ((newStatus === "paid" || newStatus === "paid_over") && currentStatus !== "paid" && currentStatus !== "paid_over") {
      const depositAmount = info.amount ? info.amount : Number(tx.amount);
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: depositAmount },
        },
        select: { balance: true },
      });
      newBalance = Number(updatedUser.balance);
    }

    // Trigger Pusher broadcast
    try {
      const payload = {
        order_id: tx.order_id,
        status: newStatus,
        payment_status: newStatus,
        amount: Number(tx.amount),
        currency: tx.currency,
        txid: info.txid ? String(info.txid) : tx.txid,
        username: user.username,
        new_balance: newBalance,
      };

      await pusherServer.trigger(`member-${user.uuid}`, "deposit-status-updated", payload);
      await pusherServer.trigger("admin-notifications", "deposit-status-updated", payload);
      await pusherServer.trigger("admin-deposits", "deposit-status-updated", payload);

      if (newBalance !== Number(user.balance)) {
        await pusherServer.trigger(`member-${user.uuid}`, "balance-updated", {
          balance: newBalance,
        });
      }
    } catch (pErr) {
      console.warn("[Pusher] Sync broadcast error:", pErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        order_id: tx.order_id,
        payment_status: newStatus,
        txid: info.txid || tx.txid,
        balance: newBalance,
      },
    });
  } catch (err: any) {
    console.error("POST /api/member/payment/cryptomus/sync error:", err);
    return NextResponse.json(
      { success: false, message: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

