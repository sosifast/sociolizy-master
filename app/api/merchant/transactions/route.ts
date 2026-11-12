import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const user = await verifySessionToken(token);

    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const merchantId = searchParams.get("merchantId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "15")));
    const skip = (page - 1) * limit;

    const whereClause: any = {
      merchant: { userId: user.id },
    };

    if (status !== "ALL") {
      whereClause.paymentStatus = status;
    }

    if (merchantId) {
      whereClause.merchantId = Number(merchantId);
    }

    if (search.trim()) {
      whereClause.OR = [
        { uuid: { contains: search.trim(), mode: "insensitive" } },
        { orderId: { contains: search.trim(), mode: "insensitive" } },
        { txid: { contains: search.trim(), mode: "insensitive" } },
        { description: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [total, transactions] = await Promise.all([
      prisma.merchantTransaction.count({ where: whereClause }),
      prisma.merchantTransaction.findMany({
        where: whereClause,
        include: {
          merchant: { select: { id: true, name: true } },
          website: { select: { id: true, name: true, domain: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
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
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

