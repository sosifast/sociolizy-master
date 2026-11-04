import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { getCryptomusPaymentInfo } from "@/lib/cryptomus";
import { sendDepositSuccessEmail } from "@/lib/resend";

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
      select: { id: true, uuid: true, username: true, email: true, balance: true },
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
    const depositFiatAmount = info.amount ? info.amount : Number(tx.amount);
    let isCreditedNow = false;
    let newBalance = Number(user.balance);

    await prisma.$transaction(async (txPrisma) => {
      const currentTx = await txPrisma.cryptomusTransaction.findUnique({
        where: { id: tx.id },
      });
      if (!currentTx) return;

      const currentStatus = currentTx.payment_status.toLowerCase();
      const willBePaid = newStatus === "paid" || newStatus === "paid_over";
      const wasAlreadyPaid = currentStatus === "paid" || currentStatus === "paid_over";

      await txPrisma.cryptomusTransaction.update({
        where: { id: currentTx.id },
        data: {
          payment_status: newStatus,
          txid: info.txid ? String(info.txid) : currentTx.txid,
          crypto_amount: info.cryptoAmount !== undefined ? String(info.cryptoAmount) : currentTx.crypto_amount,
          raw_response: JSON.stringify(info.raw),
        },
      });

      if (willBePaid && !wasAlreadyPaid) {
        const updatedUser = await txPrisma.user.update({
          where: { id: user.id },
          data: {
            balance: { increment: depositFiatAmount },
          },
          select: { balance: true },
        });
        newBalance = Number(updatedUser.balance);
        isCreditedNow = true;
      }
    });

    // Send Deposit Success Email via Resend if just credited
    if (isCreditedNow && user.email) {
      try {
        await sendDepositSuccessEmail({
          email: user.email,
          username: user.username,
          orderId: tx.order_id,
          amount: depositFiatAmount,
          currency: tx.currency,
          newBalance,
          txid: info.txid ? String(info.txid) : tx.txid,
        });
      } catch (emailErr) {
        console.warn("[Resend] Failed to send deposit sync email:", emailErr);
      }
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

