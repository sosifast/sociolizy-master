import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getMerchantGatewaySettings,
  getCryptomusCredentials,
  DEFAULT_SUPPORTED_COINS,
} from "@/lib/merchant-gateway";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = await verifySessionToken(token);
  return user && user.level === "Admin" ? user : null;
}

export async function GET() {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const [settings, cryptomusCreds] = await Promise.all([
      getMerchantGatewaySettings(),
      getCryptomusCredentials(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        adminFeePercent: Number(settings.adminFeePercent),
        adminFeeFixed: Number(settings.adminFeeFixed),
        minWithdrawal: Number(settings.minWithdrawal),
        maxWithdrawal: Number(settings.maxWithdrawal),
        autoWithdrawalEnabled: settings.autoWithdrawalEnabled,
        allowedCoins: settings.allowedCoins,
        availableCoins: DEFAULT_SUPPORTED_COINS,
        cryptomusConfigured: cryptomusCreds.configured,
        cryptomusPayoutConfigured: cryptomusCreds.payoutConfigured,
        isTestMode: cryptomusCreds.isTestMode,
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
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      adminFeePercent,
      adminFeeFixed,
      minWithdrawal,
      maxWithdrawal,
      autoWithdrawalEnabled,
      allowedCoins,
    } = body;

    let settings = await prisma.merchantGatewaySetting.findFirst();

    if (!settings) {
      settings = await prisma.merchantGatewaySetting.create({
        data: {
          adminFeePercent: Number(adminFeePercent ?? 1.0),
          adminFeeFixed: Number(adminFeeFixed ?? 0.1),
          minWithdrawal: Number(minWithdrawal ?? 10.0),
          maxWithdrawal: Number(maxWithdrawal ?? 50000.0),
          autoWithdrawalEnabled: Boolean(autoWithdrawalEnabled ?? true),
          allowedCoins: allowedCoins || DEFAULT_SUPPORTED_COINS.map((c) => `${c.symbol}_${c.network}`),
        },
      });
    } else {
      settings = await prisma.merchantGatewaySetting.update({
        where: { id: settings.id },
        data: {
          adminFeePercent: adminFeePercent !== undefined ? Number(adminFeePercent) : settings.adminFeePercent,
          adminFeeFixed: adminFeeFixed !== undefined ? Number(adminFeeFixed) : settings.adminFeeFixed,
          minWithdrawal: minWithdrawal !== undefined ? Number(minWithdrawal) : settings.minWithdrawal,
          maxWithdrawal: maxWithdrawal !== undefined ? Number(maxWithdrawal) : settings.maxWithdrawal,
          autoWithdrawalEnabled: autoWithdrawalEnabled !== undefined ? Boolean(autoWithdrawalEnabled) : settings.autoWithdrawalEnabled,
          allowedCoins: allowedCoins !== undefined ? allowedCoins : settings.allowedCoins,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan merchant payment gateway berhasil disimpan.",
      data: settings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

