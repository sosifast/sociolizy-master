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
      whereClause.status = status;
    }

    if (search.trim()) {
      whereClause.OR = [
        { uuid: { contains: search.trim(), mode: "insensitive" } },
        { address: { contains: search.trim(), mode: "insensitive" } },
        { txid: { contains: search.trim(), mode: "insensitive" } },
        { user: { username: { contains: search.trim(), mode: "insensitive" } } },
      ];
    }

    const [total, withdrawals, stats] = await Promise.all([
      prisma.merchantWithdrawal.count({ where: whereClause }),
      prisma.merchantWithdrawal.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, username: true, email: true } },
          merchant: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.merchantWithdrawal.aggregate({
        _sum: {
          amountUsd: true,
          feeAdmin: true,
        },
        where: { status: "COMPLETED" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: withdrawals,
      stats: {
        totalWithdrawnUsd: Number(stats._sum.amountUsd || 0),
        totalFeesUsd: Number(stats._sum.feeAdmin || 0),
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

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, action, txid, reason } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "ID penarikan dan aksi (approve/reject) wajib diisi." },
        { status: 400 }
      );
    }

    const withdrawal = await prisma.merchantWithdrawal.findUnique({
      where: { id: Number(id) },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, message: "Data penarikan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (withdrawal.status === "COMPLETED" || withdrawal.status === "REJECTED") {
      return NextResponse.json(
        { success: false, message: `Penarikan sudah berstatus ${withdrawal.status}.` },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Mark as completed
      const updated = await prisma.merchantWithdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "COMPLETED",
          txid: txid ? txid.trim() : withdrawal.txid,
          processedAt: new Date(),
        },
      });

      // Clear locked balance and increment totalWithdrawn in user wallet
      await prisma.merchantWallet.update({
        where: { userId: withdrawal.userId },
        data: {
          lockedBalance: { decrement: withdrawal.amountUsd },
          totalWithdrawn: { increment: withdrawal.amountUsd },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Penarikan berhasil disetujui.",
        data: updated,
      });
    }

    if (action === "reject") {
      // Mark as rejected
      const updated = await prisma.merchantWithdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: "REJECTED",
          errorMessage: reason ? reason.trim() : "Ditolak oleh admin",
        },
      });

      // Revert funds back to user wallet available balance
      await prisma.merchantWallet.update({
        where: { userId: withdrawal.userId },
        data: {
          balance: { increment: withdrawal.amountUsd },
          lockedBalance: { decrement: withdrawal.amountUsd },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Penarikan telah ditolak dan dana dikembalikan ke saldo merchant member.",
        data: updated,
      });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak valid" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

