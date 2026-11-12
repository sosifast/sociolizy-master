import { NextResponse } from "next/server";
import { DEFAULT_SUPPORTED_COINS, getMerchantGatewaySettings } from "@/lib/merchant-gateway";

export async function GET() {
  try {
    const settings = await getMerchantGatewaySettings();
    const allowed = (settings.allowedCoins as string[]) || [];

    const filtered = DEFAULT_SUPPORTED_COINS.filter((c) => {
      if (!allowed.length) return true;
      return allowed.includes(c.symbol) || allowed.includes(`${c.symbol}_${c.network}`);
    });

    return NextResponse.json({
      success: true,
      data: filtered,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Failed to load services" },
      { status: 500 }
    );
  }
}

