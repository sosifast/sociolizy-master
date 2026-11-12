import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getOrCreateMerchantWallet,
  getMerchantGatewaySettings,
  executeMerchantPayout,
  DEFAULT_SUPPORTED_COINS,
} from "@/lib/merchant-gateway";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [wallet, userSetting, globalSetting, withdrawals] = await Promise.all([
      getOrCreateMerchantWallet(user.id),
      prisma.merchantWithdrawalSetting.findUnique({ where: { userId: user.id } }),
      getMerchantGatewaySettings(),
      prisma.merchantWithdrawal.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        balance: Number(wallet.balance),
        lockedBalance: Number(wallet.lockedBalance),
        totalWithdrawn: Number(wallet.totalWithdrawn),
        minWithdrawal: Number(globalSetting.minWithdrawal),
        maxWithdrawal: Number(globalSetting.maxWithdrawal),
        autoWithdrawalGloballyEnabled: globalSetting.autoWithdrawalEnabled,
        setting: userSetting
          ? {
              coin: userSetting.coin,
              network: userSetting.network,
              address: userSetting.address,
              autoWithdraw: userSetting.autoWithdraw,
              threshold: Number(userSetting.threshold),
            }
          : null,
        supportedCoins: DEFAULT_SUPPORTED_COINS,
        history: withdrawals,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // Action 1: SETUP CRYPTO WITHDRAWAL & AUTO-WITHDRAW
    if (action === "setup") {
      const { coin, network, address, autoWithdraw, threshold } = body;

      if (!address || !address.trim()) {
        return NextResponse.json(
          { success: false, message: "Crypto wallet address is required." },
          { status: 400 }
        );
      }

      const globalSetting = await getMerchantGatewaySettings();
      const numThreshold = Math.max(
        Number(threshold || globalSetting.minWithdrawal),
        Number(globalSetting.minWithdrawal)
      );

      const saved = await prisma.merchantWithdrawalSetting.upsert({
        where: { userId: user.id },
        update: {
          coin: (coin || "USDT").toUpperCase(),
          network: (network || "tron").toLowerCase(),
          address: address.trim(),
          autoWithdraw: Boolean(autoWithdraw),
          threshold: numThreshold,
        },
        create: {
          userId: user.id,
          coin: (coin || "USDT").toUpperCase(),
          network: (network || "tron").toLowerCase(),
          address: address.trim(),
          autoWithdraw: Boolean(autoWithdraw),
          threshold: numThreshold,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Crypto withdrawal destination and auto-withdraw settings saved successfully.",
        data: saved,
      });
    }

    // Action 2: REQUEST MANUAL WITHDRAWAL
    if (action === "withdraw") {
      const { amount, coin, network, address } = body;
      const numAmount = Number(amount);

      if (!numAmount || numAmount <= 0) {
        return NextResponse.json(
          { success: false, message: "Withdrawal amount must be greater than 0." },
          { status: 400 }
        );
      }

      if (!address || !address.trim()) {
        return NextResponse.json(
          { success: false, message: "Destination wallet address is required." },
          { status: 400 }
        );
      }

      const result = await executeMerchantPayout({
        userId: user.id,
        amountUsd: numAmount,
        coin: coin || "USDT",
        network: network || "tron",
        address: address.trim(),
        isAuto: false,
      });

      return NextResponse.json({
        success: true,
        message: result.message || "Withdrawal request processed successfully.",
        data: result,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action (use 'setup' or 'withdraw')." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 400 }
    );
  }
}
