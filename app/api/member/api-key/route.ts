import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connection } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

/**
 * Generates a 16-character random string consisting of letters and numbers (alphanumeric)
 */
function generate16CharApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomBytes = crypto.randomBytes(16);
  for (let i = 0; i < 16; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return result;
}

/**
 * GET /api/member/api-key
 * Returns member's active API key, generating a 16-char alphanumeric key if not yet present
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
      apiKey = generate16CharApiKey();
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
 * Regenerates or updates a new API key (max 16 characters letters & numbers)
 */
export async function POST(request: Request) {
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

    let customKey: string | undefined;
    try {
      const body = await request.json().catch(() => null);
      if (body?.api_key && typeof body.api_key === "string") {
        customKey = body.api_key.trim();
      }
    } catch {}

    let newApiKey: string;
    if (customKey) {
      // Validate: maximum 16 characters, only letters and numbers
      if (customKey.length > 16 || !/^[A-Za-z0-9]+$/.test(customKey)) {
        return NextResponse.json(
          {
            success: false,
            message: "API Key must be a maximum of 16 alphanumeric characters (letters and numbers only).",
          },
          { status: 400 }
        );
      }
      newApiKey = customKey;
    } else {
      newApiKey = generate16CharApiKey();
    }

    // Ensure uniqueness if collision occurs
    await prisma.user.update({
      where: { uuid: session.uuid },
      data: { api_key: newApiKey },
    });

    return NextResponse.json({
      success: true,
      api_key: newApiKey,
      message: "API Key successfully updated",
    });
  } catch (error) {
    console.error("POST /api/member/api-key error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

