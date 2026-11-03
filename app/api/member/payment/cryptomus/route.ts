import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { pusherServer } from "@/lib/pusher";
import { createCryptomusInvoice } from "@/lib/cryptomus";

function generateDepositOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `DEP-${dateStr}-${rand}`;
}

/**
 * GET: Retrieve Cryptomus gateway settings, user balance, and pending deposit invoices
 */
export async function GET() {
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

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: { id: true, username: true, balance: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const setting = await prisma.cryptomusSetting.findFirst({
      orderBy: { id: "asc" },
    });

    // Get user's pending deposits from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pendingInvoices = await prisma.cryptomusTransaction.findMany({
      where: {
        user_id: user.id,
        payment_status: { in: ["pending", "check", "process"] },
        create_at: { gte: oneDayAgo },
      },
      orderBy: { create_at: "desc" },
      take: 5,
      select: {
        id: true,
        order_id: true,
        amount: true,
        currency: true,
        payment_status: true,
        invoice_url: true,
        create_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        user: {
          username: user.username,
          balance: Number(user.balance || 0),
        },
        setting: {
          min_deposit: Number(setting?.min_deposit || 5),
          max_deposit: Number(setting?.max_deposit || 5000),
          fee_percent: Number(setting?.fee_percent || 0),
          currency: setting?.currency || "USD",
          rate_usd: Number(setting?.rate_usd || 1),
          is_active: setting?.is_active ?? true,
          is_test_mode: setting?.is_test_mode ?? false,
          has_credentials: Boolean(setting?.merchant_id && setting?.payment_key),
        },
        pending_invoices: pendingInvoices.map((inv) => ({
          id: inv.id,
          order_id: inv.order_id,
          amount: Number(inv.amount),
          currency: inv.currency,
          payment_status: inv.payment_status,
          invoice_url: inv.invoice_url,
          create_at: inv.create_at.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/member/payment/cryptomus error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat informasi gateway deposit." },
      { status: 500 }
    );
  }
}

/**
 * POST: Create a new deposit invoice via Cryptomus
 */
export async function POST(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Silakan login terlebih dahulu untuk deposit." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency = "USD" } = body;

    const depositAmount = parseFloat(String(amount));
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Jumlah deposit harus berupa angka positif." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const orderId = generateDepositOrderId();

    // Check minimum and maximum deposit setting
    const setting = await prisma.cryptomusSetting.findFirst({
      orderBy: { id: "asc" },
    });

    const minDeposit = Number(setting?.min_deposit || 5);
    const maxDeposit = Number(setting?.max_deposit || 5000);

    if (depositAmount < minDeposit) {
      return NextResponse.json(
        { success: false, message: `Deposit minimum adalah $${minDeposit.toFixed(2)}.` },
        { status: 400 }
      );
    }

    if (depositAmount > maxDeposit) {
      return NextResponse.json(
        { success: false, message: `Deposit maksimum adalah $${maxDeposit.toFixed(2)}.` },
        { status: 400 }
      );
    }

    // Determine host for callback & return URLs
    const url = new URL(request.url);
    const origin = url.origin;

    const urlCallback = setting?.webhook_url?.startsWith("http")
      ? setting.webhook_url
      : `${origin}/api/payment/cryptomus/webhook`;

    const urlReturn = setting?.return_url?.startsWith("http")
      ? setting.return_url
      : `${origin}/member/history/deposit`;

    let invoiceUrl = `https://pay.cryptomus.com/pay/${orderId}`;
    let rawApiResponse: any = null;

    // Call official Cryptomus API if credentials exist
    if (setting?.merchant_id && setting?.payment_key) {
      const cryptomusResult = await createCryptomusInvoice({
        amount: depositAmount,
        currency: currency.toUpperCase(),
        orderId,
        merchantId: setting.merchant_id,
        paymentKey: setting.payment_key,
        urlCallback,
        urlReturn,
        isTestMode: setting.is_test_mode,
      });

      if (cryptomusResult.success && cryptomusResult.invoiceUrl) {
        invoiceUrl = cryptomusResult.invoiceUrl;
        rawApiResponse = cryptomusResult.rawResponse;
      } else {
        console.warn("[Cryptomus API] Invoice creation error:", cryptomusResult.error);
        if (!setting.is_test_mode) {
          return NextResponse.json(
            {
              success: false,
              message: cryptomusResult.error || "Gagal menghubungkan ke Cryptomus Gateway.",
            },
            { status: 502 }
          );
        }
        // In test mode, fallback to simulation URL
        invoiceUrl = `${origin}/member/history/deposit?invoice=${orderId}&simulated=true`;
      }
    } else {
      // In sandbox/testing mode when API keys are not configured yet
      invoiceUrl = `${origin}/member/history/deposit?invoice=${orderId}&simulated=true`;
    }

    // Create CryptomusTransaction in PostgreSQL
    const transaction = await prisma.cryptomusTransaction.create({
      data: {
        order_id: orderId,
        user_id: user.id,
        merchant_id: setting?.merchant_id || null,
        amount: new Prisma.Decimal(depositAmount),
        currency: currency.toUpperCase(),
        payment_status: "pending",
        invoice_url: invoiceUrl,
        raw_response: rawApiResponse ? JSON.stringify(rawApiResponse) : null,
      },
    });

    // Realtime Pusher Notifications
    try {
      const depositPayload = {
        order_id: orderId,
        username: user.username,
        amount: depositAmount,
        currency: transaction.currency,
        status: "pending",
        create_at: transaction.create_at.toISOString(),
      };

      // Notify Admin
      await pusherServer.trigger("admin-notifications", "deposit-created", depositPayload);
      await pusherServer.trigger("admin-deposits", "deposit-created", depositPayload);

      // Notify Member
      await pusherServer.trigger(`member-${user.uuid}`, "deposit-created", depositPayload);
    } catch (pErr) {
      console.warn("[Pusher] Failed to broadcast deposit event:", pErr);
    }

    return NextResponse.json({
      success: true,
      message: `Invoice deposit ${orderId} berhasil dibuat!`,
      data: {
        order_id: orderId,
        amount: depositAmount,
        currency: transaction.currency,
        payment_status: transaction.payment_status,
        invoice_url: transaction.invoice_url,
      },
    });
  } catch (error) {
    console.error("POST /api/member/payment/cryptomus error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat invoice deposit.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
