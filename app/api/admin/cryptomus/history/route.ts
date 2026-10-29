import { NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "all") {
      where.payment_status = status;
    }

    if (search) {
      where.OR = [
        { order_id: { contains: search, mode: "insensitive" } },
        { txid: { contains: search, mode: "insensitive" } },
        { crypto_currency: { contains: search, mode: "insensitive" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.cryptomusTransaction.findMany({
        where,
        orderBy: { create_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.cryptomusTransaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/cryptomus/history error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat riwayat transaksi Cryptomus" },
      { status: 500 }
    );
  }
}

