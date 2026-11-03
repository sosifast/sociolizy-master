import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connection } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

/**
 * GET /api/member/api-key
 * Returns member's active API key, generating one if not yet present
 */
export async function GET() {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: { id: true, api_key: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Auto-generate key if missing
    let apiKey = user.api_key;
    if (!apiKey) {
      apiKey = `smm_${crypto.randomBytes(16).toString("hex")}`;
      await prisma.user.update({
        where: { id: user.id },
        data: { api_key: apiKey },
      });
    }

    return NextResponse.json({
      success: true,
      api_key: apiKey,
    });
  } catch (error) {
    console.error("GET /api/member/api-key error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/member/api-key
 * Regenerates a new API key for the member
 */
export async function POST() {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const newApiKey = `smm_${crypto.randomBytes(16).toString("hex")}`;
    await prisma.user.update({
      where: { uuid: session.uuid },
      data: { api_key: newApiKey },
    });

    return NextResponse.json({
      success: true,
      api_key: newApiKey,
      message: "API Key berhasil diperbarui",
    });
  } catch (error) {
    console.error("POST /api/member/api-key error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

