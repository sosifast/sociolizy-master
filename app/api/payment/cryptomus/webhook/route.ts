import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { verifyCryptomusWebhookSignature } from "@/lib/cryptomus";
import { sendDepositSuccessEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, status, is_final, txid, payment_amount } = body;

    if (!order_id) {
      return NextResponse.json({ success: false, message: "order_id missing" }, { status: 400 });
    }

    // Retrieve Cryptomus setting for signature verification
    const setting = await prisma.cryptomusSetting.findFirst({
      orderBy: { id: "asc" },
    });

    // Verify webhook signature if payment_key is configured and body contains sign
    if (setting?.payment_key && body.sign) {
      const isValid = verifyCryptomusWebhookSignature(body, setting.payment_key);
      if (!isValid && !setting.is_test_mode) {
        console.warn("[Cryptomus Webhook] Invalid signature rejected for order:", order_id);
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
      }
    }

    const tx = await prisma.cryptomusTransaction.findFirst({
      where: {
        OR: [
          { order_id: String(order_id) },
          ...(body.uuid ? [{ uuid: String(body.uuid) }] : []),
        ],
      },
    });

    if (!tx) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    const newStatus = status ? String(status).toLowerCase() : "paid";

    // Calculate credited fiat amount (USD)
    // payment_amount_usd: USD equivalent calculated by Cryptomus
    // amount: original invoice amount in USD
    // payment_amount: raw coin amount (e.g. 0.0001 BTC)
    const depositFiatAmount = body.payment_amount_usd
      ? parseFloat(String(body.payment_amount_usd))
      : body.amount
      ? parseFloat(String(body.amount))
      : Number(tx.amount);

    let isCreditedNow = false;
    let newBalance: number | null = null;
    let userUuid: string | null = null;
    let username: string = "";
    let userEmail: string | null = null;

    // Use atomic transaction to prevent double-crediting on concurrent webhook retries
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
          txid: txid ? String(txid) : currentTx.txid,
          crypto_amount: body.payment_amount ? String(body.payment_amount) : currentTx.crypto_amount,
          crypto_currency: body.payer_currency ? String(body.payer_currency) : currentTx.crypto_currency,
          raw_response: JSON.stringify(body),
        },
      });

      // Credit balance only if changing to paid/paid_over for the first time
      if (willBePaid && !wasAlreadyPaid && currentTx.user_id) {
        const updatedUser = await txPrisma.user.update({
          where: { id: currentTx.user_id },
          data: {
            balance: {
              increment: depositFiatAmount,
            },
          },
          select: { uuid: true, username: true, email: true, balance: true },
        });

        isCreditedNow = true;
        newBalance = Number(updatedUser.balance);
        userUuid = updatedUser.uuid;
        username = updatedUser.username;
        userEmail = updatedUser.email;
      } else if (currentTx.user_id) {
        const u = await txPrisma.user.findUnique({
          where: { id: currentTx.user_id },
          select: { uuid: true, username: true, email: true, balance: true },
        });
        if (u) {
          userUuid = u.uuid;
          username = u.username;
          userEmail = u.email;
          newBalance = Number(u.balance);
        }
      }
    });

    // Send Deposit Success Email via Resend if just credited
    if (isCreditedNow && userEmail) {
      try {
        await sendDepositSuccessEmail({
          email: userEmail,
          username,
          orderId: tx.order_id,
          amount: depositFiatAmount,
          currency: tx.currency,
          newBalance: newBalance || 0,
          txid: txid ? String(txid) : tx.txid,
        });
      } catch (emailErr) {
        console.warn("[Resend] Failed to send deposit webhook email:", emailErr);
      }
    }

    // Trigger Pusher Realtime Events for Member and Admin
    try {
      const payload = {
        order_id: tx.order_id,
        status: newStatus,
        payment_status: newStatus,
        amount: Number(tx.amount),
        currency: tx.currency,
        txid: txid ? String(txid) : tx.txid,
        username,
        new_balance: newBalance,
      };

      // Broadcast to Admin
      await pusherServer.trigger("admin-notifications", "deposit-status-updated", payload);
      await pusherServer.trigger("admin-deposits", "deposit-status-updated", payload);

      // Broadcast to Member
      if (userUuid) {
        await pusherServer.trigger(`member-${userUuid}`, "deposit-status-updated", payload);
        if (newBalance !== null) {
          await pusherServer.trigger(`member-${userUuid}`, "balance-updated", {
            balance: newBalance,
          });
        }
      }
    } catch (pErr) {
      console.warn("[Pusher] Failed to broadcast webhook deposit update:", pErr);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Cryptomus Webhook Error:", error);
    const message = error instanceof Error ? error.message : "Internal Error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
