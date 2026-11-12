import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = await verifySessionToken(token);
  return user && user.level === "Admin" ? user : null;
}

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (status !== "ALL") {
      whereClause.paymentStatus = status;
    }

    if (search.trim()) {
      whereClause.OR = [
        { uuid: { contains: search.trim(), mode: "insensitive" } },
        { orderId: { contains: search.trim(), mode: "insensitive" } },
        { txid: { contains: search.trim(), mode: "insensitive" } },
        { payAddress: { contains: search.trim(), mode: "insensitive" } },
        { merchant: { name: { contains: search.trim(), mode: "insensitive" } } },
        { merchant: { user: { username: { contains: search.trim(), mode: "insensitive" } } } },
      ];
    }

    const [total, transactions, stats] = await Promise.all([
      prisma.merchantTransaction.count({ where: whereClause }),
      prisma.merchantTransaction.findMany({
        where: whereClause,
        include: {
          merchant: {
            include: {
              user: { select: { id: true, username: true, email: true } },
            },
          },
          website: { select: { id: true, name: true, domain: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.merchantTransaction.aggregate({
        _sum: {
          amountUsd: true,
          adminFee: true,
          netAmountUsd: true,
        },
        where: { paymentStatus: "PAID" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: transactions,
      stats: {
        totalVolumeUsd: Number(stats._sum.amountUsd || 0),
        totalAdminFeeUsd: Number(stats._sum.adminFee || 0),
        totalMerchantNetUsd: Number(stats._sum.netAmountUsd || 0),
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

