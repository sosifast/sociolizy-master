import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

export async function GET(request: Request) {
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
      select: { id: true, uuid: true, balance: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {
      user_id: user.id,
    };

    if (status && status !== "all") {
      const s = status.toLowerCase();
      if (s === "paid") {
        where.payment_status = { in: ["paid", "paid_over"] };
      } else if (s === "pending") {
        where.payment_status = { in: ["pending", "check", "process", "confirm_check"] };
      } else if (s === "failed" || s === "cancel" || s === "expired") {
        where.payment_status = { in: ["cancel", "failed", "expired", "system_fail"] };
      } else {
        where.payment_status = { equals: status, mode: "insensitive" };
      }
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
        totalPages: Math.ceil(total / limit) || 1,
      },
      user_uuid: user.uuid,
      balance: Number(user.balance || 0),
    });
  } catch (error) {
    console.error("GET /api/member/payment/history error:", error);
    return NextResponse.json({ success: false, message: "Failed to load deposit history" }, { status: 500 });
  }
}
