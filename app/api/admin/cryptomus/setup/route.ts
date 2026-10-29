import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, invalidateCacheTag, getCacheHeaders } from "@/lib/server-cache";
import { Prisma } from "@/app/generated/prisma/client";

export async function GET() {
  await connection();

  try {
    const setting = await getCachedData(
      "admin:cryptomus:setup",
      async () => {
        let rec = await prisma.cryptomusSetting.findFirst({
          orderBy: { id: "asc" },
        });

        // Jika belum ada record setup, buat dengan nilai default
        if (!rec) {
          rec = await prisma.cryptomusSetting.create({
            data: {
              merchant_id: null,
              payment_key: null,
              payout_key: null,
              webhook_url: "/api/payment/cryptomus/webhook",
              return_url: "/member/history/deposit",
              currency: "USD",
              rate_usd: new Prisma.Decimal(16000),
              min_deposit: new Prisma.Decimal(5),
              max_deposit: new Prisma.Decimal(5000),
              fee_percent: new Prisma.Decimal(0),
              is_active: false,
              is_test_mode: true,
            },
          });
        }
        return rec;
      },
      { ttlSeconds: 60, tags: ["cryptomus_setting"] }
    );

    return NextResponse.json(
      {
        success: true,
        data: setting,
      },
      { headers: getCacheHeaders(30, 60) }
    );
  } catch (error) {
    console.error("GET /api/admin/cryptomus/setup error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil konfigurasi Cryptomus";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connection();

  try {
    const body = await request.json();
    const {
      merchant_id,
      payment_key,
      payout_key,
      webhook_url,
      return_url,
      currency,
      rate_usd,
      min_deposit,
      max_deposit,
      fee_percent,
      is_active,
      is_test_mode,
    } = body;

    let setting = await prisma.cryptomusSetting.findFirst({
      orderBy: { id: "asc" },
    });

    const updatePayload = {
      merchant_id: merchant_id !== undefined ? (merchant_id ? String(merchant_id).trim() : null) : undefined,
      payment_key: payment_key !== undefined ? (payment_key ? String(payment_key).trim() : null) : undefined,
      payout_key: payout_key !== undefined ? (payout_key ? String(payout_key).trim() : null) : undefined,
      webhook_url: webhook_url !== undefined ? (webhook_url ? String(webhook_url).trim() : null) : undefined,
      return_url: return_url !== undefined ? (return_url ? String(return_url).trim() : null) : undefined,
      currency: currency ? String(currency).trim().toUpperCase() : "USD",
      rate_usd: rate_usd !== undefined ? new Prisma.Decimal(rate_usd) : undefined,
      min_deposit: min_deposit !== undefined ? new Prisma.Decimal(min_deposit) : undefined,
      max_deposit: max_deposit !== undefined ? new Prisma.Decimal(max_deposit) : undefined,
      fee_percent: fee_percent !== undefined ? new Prisma.Decimal(fee_percent) : undefined,
      is_active: is_active !== undefined ? Boolean(is_active) : false,
      is_test_mode: is_test_mode !== undefined ? Boolean(is_test_mode) : false,
    };

    if (setting) {
      setting = await prisma.cryptomusSetting.update({
        where: { id: setting.id },
        data: updatePayload,
      });
    } else {
      setting = await prisma.cryptomusSetting.create({
        data: {
          merchant_id: updatePayload.merchant_id || null,
          payment_key: updatePayload.payment_key || null,
          payout_key: updatePayload.payout_key || null,
          webhook_url: updatePayload.webhook_url || "/api/payment/cryptomus/webhook",
          return_url: updatePayload.return_url || "/member/history/deposit",
          currency: updatePayload.currency || "USD",
          rate_usd: updatePayload.rate_usd || new Prisma.Decimal(16000),
          min_deposit: updatePayload.min_deposit || new Prisma.Decimal(5),
          max_deposit: updatePayload.max_deposit || new Prisma.Decimal(5000),
          fee_percent: updatePayload.fee_percent || new Prisma.Decimal(0),
          is_active: updatePayload.is_active || false,
          is_test_mode: updatePayload.is_test_mode !== undefined ? updatePayload.is_test_mode : true,
        },
      });
    }

    invalidateCacheTag("cryptomus_setting");

    return NextResponse.json({
      success: true,
      message: "Konfigurasi Cryptomus berhasil disimpan",
      data: setting,
    });
  } catch (error) {
    console.error("POST /api/admin/cryptomus/setup error:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan konfigurasi Cryptomus";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

