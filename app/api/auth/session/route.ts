import { NextResponse, connection } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

export async function GET() {
  await connection();

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("user_session")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const session = await verifySessionToken(sessionToken);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: {
          id: session.id,
          username: session.username,
          level: session.level,
          email: session.email,
        },
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("GET /api/auth/session error:", error);
    return NextResponse.json(
      { success: false, authenticated: false, user: null },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}

