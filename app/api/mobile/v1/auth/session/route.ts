import { NextResponse } from "next/server";
import { authenticateMobileUser } from "@/lib/mobile-auth";

/**
 * GET /api/mobile/v1/auth/session
 * Verifies mobile user token and returns active profile & balance
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateMobileUser(request);
    if (!auth.valid) {
      return auth.errorResponse!;
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: auth.user,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/mobile/v1/auth/session error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

