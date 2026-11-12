import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateMerchantWallet } from "@/lib/merchant-gateway";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Ensures wallet exists (Requirement A.1)
    const wallet = await getOrCreateMerchantWallet(user.id);

    // Get count of merchants and websites
    const merchantCount = await prisma.merchantAccount.count({
      where: { userId: user.id },
    });

    const websiteCount = await prisma.merchantWebsite.count({
      where: { merchant: { userId: user.id } },
    });

    // Recent 5 transactions
    const recentTransactions = await prisma.merchantTransaction.findMany({
      where: { merchant: { userId: user.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        merchant: { select: { name: true } },
        website: { select: { name: true } },
      },
    });

    // Recent 5 withdrawals
    const recentWithdrawals = await prisma.merchantWithdrawal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          balance: Number(wallet.balance),
          lockedBalance: Number(wallet.lockedBalance),
          totalEarned: Number(wallet.totalEarned),
          totalWithdrawn: Number(wallet.totalWithdrawn),
          currency: wallet.currency,
        },
        merchantCount,
        websiteCount,
        recentTransactions,
        recentWithdrawals,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

