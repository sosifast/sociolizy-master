import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { pusherServer } from "@/lib/pusher";

function generateDepositOrderId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `DEP-${dateStr}-${rand}`;
}

export async function POST(request: Request) {
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

    // Check minimum deposit setting
    const setting = await prisma.cryptomusSetting.findFirst({
      orderBy: { id: "asc" },
    });

    const minDeposit = Number(setting?.min_deposit || 1);
    const maxDeposit = Number(setting?.max_deposit || 10000);

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

    // Create CryptomusTransaction in PostgreSQL
    const transaction = await prisma.cryptomusTransaction.create({
      data: {
        order_id: orderId,
        user_id: user.id,
        amount: new Prisma.Decimal(depositAmount),
        currency: currency.toUpperCase(),
        payment_status: "pending",
        invoice_url: `https://pay.cryptomus.com/pay/${orderId}`,
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
        create_at: transaction.create_at,
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

