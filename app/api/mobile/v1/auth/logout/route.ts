import { NextResponse } from "next/server";
import { validateMobileApp } from "@/lib/mobile-auth";

/**
 * POST /api/mobile/v1/auth/logout
 * Logs out mobile user and instructs client to drop token
 */
export async function POST(request: Request) {
  try {
    const appCheck = await validateMobileApp(request);
    if (!appCheck.valid) {
      return appCheck.errorResponse!;
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

