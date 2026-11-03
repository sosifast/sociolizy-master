import { NextResponse } from "next/server";
import { authenticateMobileUser } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/mobile/v1/auth/logout
 * Logs out mobile user and instructs client to drop token
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticateMobileUser(request);
    if (!auth.valid) {
      return auth.errorResponse!;
    }

    if (
      !auth.user ||
      typeof auth.session?.mobile_session_version !== "number"
    ) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    const revoked = await prisma.user.updateMany({
      where: {
        id: auth.user.id,
        mobile_session_version: auth.session.mobile_session_version,
      },
      data: { mobile_session_version: { increment: 1 } },
    });

    if (revoked.count !== 1) {
      return NextResponse.json(
        { success: false, message: "Sesi tidak valid atau telah berakhir." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Berhasil keluar dari aplikasi.",
    });

    // Also clear cookie if user was using cookies
    response.cookies.delete("user_session");

    return response;
  } catch (error) {
    console.error("POST /api/mobile/v1/auth/logout error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
