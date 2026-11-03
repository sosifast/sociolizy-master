import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateMobileUser } from "@/lib/mobile-auth";

/**
 * GET /api/mobile/v1/history/deposit
 * Fetches deposit transactions from PostgreSQL CryptomusTransaction
 * Fields: status, jumlah, waktu, invoice, detail
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateMobileUser(request);
    if (!auth.valid) {
      return auth.errorResponse!;
    }

    const { user } = auth;
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const status = searchParams.get("status")?.trim().toLowerCase();

    // Build filter
    const where: any = { user_id: user.id };

    if (status && status !== "all") {
      if (status === "paid") {
        where.payment_status = { in: ["paid", "paid_over"] };
      } else if (status === "pending") {
        where.payment_status = { in: ["pending", "check", "process", "confirm_check"] };
      } else if (status === "failed" || status === "cancel") {
        where.payment_status = { in: ["cancel", "fail", "system_fail", "wrong_amount", "expired"] };
      } else {
        where.payment_status = status;
      }
    }

    const [total, transactions] = await Promise.all([
      prisma.cryptomusTransaction.count({ where }),
      prisma.cryptomusTransaction.findMany({
        where,
        orderBy: { create_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formatted = transactions.map((t) => ({
      id: t.id,
      invoice: t.order_id,
      status: t.payment_status,
      jumlah: Number(t.amount),
      currency: t.currency,
      crypto_amount: t.crypto_amount ? Number(t.crypto_amount) : null,
      crypto_currency: t.crypto_currency,
      waktu: t.create_at,
      detail: {
        txid: t.txid,
        invoice_url: t.invoice_url,
        updated_at: t.update_at,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      current_balance: user.balance,
    });
  } catch (error) {
    console.error("GET /api/mobile/v1/history/deposit error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil riwayat deposit" },
      { status: 500 }
    );
  }
}

