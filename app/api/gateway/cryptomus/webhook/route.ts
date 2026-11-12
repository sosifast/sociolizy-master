import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getCryptomusCredentials,
  verifyCryptomusSignature,
  getOrCreateMerchantWallet,
  checkAndTriggerAutoWithdraw,
  dispatchMerchantWebhook,
} from "@/lib/merchant-gateway";

export async function POST(req: NextRequest) {
  try {
    const creds = await getCryptomusCredentials();
    if (!creds.paymentKey) {
      return NextResponse.json({ state: 1, message: "Gateway not configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ state: 1, message: "Invalid payload" }, { status: 400 });
    }

    // Verify signature
    const isValid = verifyCryptomusSignature(body, creds.paymentKey);
    if (!isValid) {
      console.warn("Invalid Cryptomus webhook signature:", body.sign);
      return NextResponse.json({ state: 1, message: "Invalid signature" }, { status: 400 });
    }

    const {
      order_id,
      status: paymentStatus,
      is_final,
      txid,
      payer_amount,
      payer_currency,
      network,
    } = body;

    if (!order_id) {
      return NextResponse.json({ state: 0 });
    }

    // Find the merchant transaction
    const tx = await prisma.merchantTransaction.findFirst({
      where: {
        OR: [{ uuid: order_id }, { cryptomusOrderId: order_id }],
      },
      include: {
        merchant: true,
      },
    });

    if (!tx) {
      // Might be a regular user deposit rather than a merchant payment
      return NextResponse.json({ state: 0, message: "Not a merchant transaction" });
    }

    // Determine final status
    const isPaid = paymentStatus === "paid" || paymentStatus === "paid_over";
    const isFailed = paymentStatus === "cancel" || paymentStatus === "system_fail";

    if (isPaid && tx.paymentStatus !== "PAID") {
      // 1. Update transaction
      const updatedTx = await prisma.merchantTransaction.update({
        where: { id: tx.id },
        data: {
          paymentStatus: "PAID",
          paidAt: new Date(),
          txid: txid || tx.txid,
          cryptoAmount: payer_amount ? parseFloat(payer_amount) : tx.cryptoAmount,
          cryptoCurrency: payer_currency || tx.cryptoCurrency,
          cryptoNetwork: network || tx.cryptoNetwork,
          rawPayload: JSON.stringify(body),
        },
      });

      // 2. Credit Member Merchant Wallet
      const wallet = await getOrCreateMerchantWallet(tx.merchant.userId);
      await prisma.merchantWallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: tx.netAmountUsd },
          totalEarned: { increment: tx.netAmountUsd },
        },
      });

      // 3. Dispatch webhook to Merchant Website
      dispatchMerchantWebhook(updatedTx.id).catch((err) =>
        console.error("Merchant webhook dispatch error:", err)
      );

      // 4. Check & trigger Auto Withdrawal
      checkAndTriggerAutoWithdraw(tx.merchant.userId).catch((err) =>
        console.error("Auto-withdraw error:", err)
      );
    } else if (isFailed && tx.paymentStatus === "PENDING") {
      await prisma.merchantTransaction.update({
        where: { id: tx.id },
        data: {
          paymentStatus: "FAILED",
          rawPayload: JSON.stringify(body),
        },
      });
    }

    return NextResponse.json({ state: 0 });
  } catch (err: any) {
    console.error("Cryptomus webhook handling error:", err);
    return NextResponse.json({ state: 1, message: err?.message || "Internal error" }, { status: 500 });
  }
}

