import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCryptomusCredentials, verifyCryptomusSignature } from "@/lib/merchant-gateway";

export async function POST(req: NextRequest) {
  try {
    const creds = await getCryptomusCredentials();
    if (!creds.payoutKey) {
      return NextResponse.json({ state: 1, message: "Payout key not configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ state: 1, message: "Invalid payload" }, { status: 400 });
    }

    const isValid = verifyCryptomusSignature(body, creds.payoutKey);
    if (!isValid) {
      console.warn("Invalid Cryptomus payout webhook signature");
      return NextResponse.json({ state: 1, message: "Invalid signature" }, { status: 400 });
    }

    const { order_id, status: payoutStatus, txid } = body;
    if (!order_id) {
      return NextResponse.json({ state: 0 });
    }

    const withdrawal = await prisma.merchantWithdrawal.findFirst({
      where: {
        OR: [{ uuid: order_id }, { cryptomusPayoutId: order_id }],
      },
    });

    if (!withdrawal) {
      return NextResponse.json({ state: 0 });
    }

    const isPaid = payoutStatus === "paid" || payoutStatus === "completed";
    const isFailed = payoutStatus === "cancel" || payoutStatus === "system_fail" || payoutStatus === "fail";

    if (isPaid && withdrawal.status !== "COMPLETED") {
      await prisma.merchantWithdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "COMPLETED",
          txid: txid || withdrawal.txid,
          processedAt: new Date(),
        },
      });

      // Clear locked balance, update totalWithdrawn
      await prisma.merchantWallet.update({
        where: { userId: withdrawal.userId },
        data: {
          lockedBalance: { decrement: withdrawal.amountUsd },
          totalWithdrawn: { increment: withdrawal.amountUsd },
        },
      });
    } else if (isFailed && withdrawal.status !== "FAILED") {
      await prisma.merchantWithdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "FAILED",
          errorMessage: body?.message || "Payout rejected/failed by network",
        },
      });

      // Revert locked balance back to available balance
      await prisma.merchantWallet.update({
        where: { userId: withdrawal.userId },
        data: {
          balance: { increment: withdrawal.amountUsd },
          lockedBalance: { decrement: withdrawal.amountUsd },
        },
      });
    }

    return NextResponse.json({ state: 0 });
  } catch (err: any) {
    console.error("Cryptomus payout webhook error:", err);
    return NextResponse.json({ state: 1, message: err?.message || "Internal error" }, { status: 500 });
  }
}

