import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { verifyCryptomusWebhookSignature } from "@/lib/cryptomus";

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

    const tx = await prisma.cryptomusTransaction.findUnique({
      where: { order_id },
    });

    if (!tx) {
      return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 });
    }

    const currentStatus = tx.payment_status;
    const newStatus = status ? String(status).toLowerCase() : "paid";

    await prisma.cryptomusTransaction.update({
      where: { order_id },
      data: {
        payment_status: newStatus,
        txid: txid ? String(txid) : tx.txid,
        raw_response: JSON.stringify(body),
      },
    });

    let newBalance: number | null = null;
    let userUuid: string | null = null;
    let username: string = "";

    // If payment is paid and wasn't already paid, credit user's balance!
    if ((newStatus === "paid" || newStatus === "paid_over") && currentStatus !== "paid" && currentStatus !== "paid_over") {
      if (tx.user_id) {
        const depositAmount = payment_amount ? parseFloat(payment_amount) : Number(tx.amount);
        const updatedUser = await prisma.user.update({
          where: { id: tx.user_id },
          data: {
            balance: {
              increment: depositAmount,
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
