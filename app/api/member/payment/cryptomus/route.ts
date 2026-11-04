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
    const { amount, currency = "USD", to_currency, network } = body;

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

    // Determine public host for callback & return URLs
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
    const appUrlEnv = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

    const origin = forwardedHost
      ? `${forwardedProto}://${forwardedHost}`
      : (appUrlEnv ? appUrlEnv.replace(/\/$/, "") : new URL(request.url).origin);

    const configuredWebhook = setting?.webhook_url?.trim();
    const urlCallback = configuredWebhook?.startsWith("http")
      ? configuredWebhook
      : configuredWebhook?.startsWith("/")
      ? `${origin}${configuredWebhook}`
      : `${origin}/api/payment/cryptomus/webhook`;

    // Direct to our own internal website invoice page
    const internalInvoiceUrl = `${origin}/member/history/deposit/${orderId}`;
    const urlReturn = internalInvoiceUrl;

    let invoiceUrl = internalInvoiceUrl;
    let rawApiResponse: any = null;
    let resolvedAddress: string | null = null;
    let resolvedNetwork: string | null = network || "tron";
    let resolvedCryptoAmount: string | number | null = null;
    const resolvedCryptoCurrency: string = (to_currency || "USDT").toUpperCase();

    // Call official Cryptomus API if credentials exist
    if (setting?.merchant_id && setting?.payment_key) {
      const cryptomusResult = await createCryptomusInvoice({
        amount: depositAmount,
        currency: currency.toUpperCase(),
        to_currency: resolvedCryptoCurrency,
        network: resolvedNetwork || undefined,
        orderId,
        merchantId: setting.merchant_id,
        paymentKey: setting.payment_key,
        urlCallback,
        urlReturn,
        isTestMode: setting.is_test_mode,
      });

      if (cryptomusResult.success) {
        invoiceUrl = cryptomusResult.invoiceUrl || internalInvoiceUrl;
        rawApiResponse = cryptomusResult.rawResponse || {};
        resolvedAddress = cryptomusResult.address || null;
        if (cryptomusResult.network) resolvedNetwork = cryptomusResult.network;
        if (cryptomusResult.cryptoAmount) resolvedCryptoAmount = cryptomusResult.cryptoAmount;
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
      }
    }

    // Fallback deterministic simulation wallet address if Cryptomus didn't supply an address (e.g. sandbox/test mode)
    if (!resolvedAddress) {
      const net = (resolvedNetwork || "").toLowerCase();
      if (net.includes("bep") || net.includes("bsc") || net.includes("eth") || net.includes("polygon")) {
        resolvedAddress = `0x3F2d79A8146740B4800e2C7c7D095f923b7E${orderId.replace(/[^0-9A-Fa-f]/g, "").slice(0, 4).padEnd(4, "a")}`;
      } else if (net.includes("btc") || resolvedCryptoCurrency === "BTC") {
        resolvedAddress = `bc1q9p8e2z3f4c6g7h8k9m0n1p2q3r4s5t6u7v8${orderId.replace(/[^0-9a-z]/gi, "").slice(0, 3).toLowerCase()}`;
      } else if (net.includes("sol") || resolvedCryptoCurrency === "SOL") {
        resolvedAddress = `8rPjE2wQz9kM4nL6sT7uV1wX3yZ5aB7c8d9e0f1g`;
      } else if (net.includes("ton") || resolvedCryptoCurrency === "TON") {
        resolvedAddress = `EQBvW8Z5huBkMJYdn3mdTBgYzV4gWP8EC-48wbpKT52CX5W2`;
      } else {
        // Default TRC-20 Tron address
        resolvedAddress = `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t${orderId.replace(/[^0-9A-Za-z]/g, "").slice(0, 2)}`;
      }
    }

    if (!resolvedCryptoAmount) {
      if (resolvedCryptoCurrency === "USDT") {
        resolvedCryptoAmount = depositAmount.toFixed(2);
      } else if (resolvedCryptoCurrency === "BTC") {
        resolvedCryptoAmount = (depositAmount / 95000).toFixed(6);
      } else if (resolvedCryptoCurrency === "ETH") {
        resolvedCryptoAmount = (depositAmount / 3400).toFixed(6);
      } else if (resolvedCryptoCurrency === "SOL") {
        resolvedCryptoAmount = (depositAmount / 185).toFixed(4);
      } else if (resolvedCryptoCurrency === "TRX") {
        resolvedCryptoAmount = (depositAmount / 0.2).toFixed(2);
      } else if (resolvedCryptoCurrency === "LTC") {
        resolvedCryptoAmount = (depositAmount / 100).toFixed(4);
      } else if (resolvedCryptoCurrency === "DOGE") {
        resolvedCryptoAmount = (depositAmount / 0.25).toFixed(2);
      } else {
        resolvedCryptoAmount = depositAmount.toFixed(2);
      }
    }

    const completeRawResponse = {
      ...(typeof rawApiResponse === "object" && rawApiResponse !== null ? rawApiResponse : {}),
      address: resolvedAddress,
      network: resolvedNetwork,
      payer_amount: resolvedCryptoAmount,
      payer_currency: resolvedCryptoCurrency,
      internal_url: internalInvoiceUrl,
    };

    // Create CryptomusTransaction in PostgreSQL
    const transaction = await prisma.cryptomusTransaction.create({
      data: {
        order_id: orderId,
        user_id: user.id,
        merchant_id: setting?.merchant_id || null,
        amount: new Prisma.Decimal(depositAmount),
        currency: currency.toUpperCase(),
        crypto_amount: resolvedCryptoAmount ? new Prisma.Decimal(resolvedCryptoAmount) : null,
        crypto_currency: resolvedCryptoCurrency,
        payment_status: "pending",
        invoice_url: internalInvoiceUrl,
        raw_response: JSON.stringify(completeRawResponse),
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
        crypto_amount: resolvedCryptoAmount,
        crypto_currency: resolvedCryptoCurrency,
        address: resolvedAddress,
        network: resolvedNetwork || undefined,
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
