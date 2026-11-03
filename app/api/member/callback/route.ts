import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { sendTestWebhookPing } from "@/lib/webhook-dispatcher";

/**
 * GET /api/member/callback
 * Returns member's default callback/webhook URL
 */
export async function GET() {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: { callback_url: true, api_key: true },
    });

    return NextResponse.json({
      success: true,
      callback_url: user?.callback_url || null,
      has_key: Boolean(user?.api_key),
    });
  } catch (error) {
    console.error("GET /api/member/callback error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/member/callback
 * Updates callback URL or triggers a test ping webhook
 */
export async function POST(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, callback_url } = body;

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: { id: true, api_key: true, callback_url: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // Action: Test Ping Webhook
    if (action === "test") {
      const targetUrl = callback_url || user.callback_url;
      if (!targetUrl || typeof targetUrl !== "string" || !targetUrl.startsWith("http")) {
        return NextResponse.json(
          { success: false, message: "URL Callback tidak valid (harus diawali http:// atau https://)" },
          { status: 400 }
        );
      }

      const pingResult = await sendTestWebhookPing(targetUrl.trim(), user.api_key);
      return NextResponse.json({
        success: pingResult.success,
        statusCode: pingResult.statusCode,
        durationMs: pingResult.durationMs,
        error: pingResult.error,
        message: pingResult.success
          ? `Webhook berhasil diterima (HTTP ${pingResult.statusCode}) dalam ${pingResult.durationMs}ms`
          : `Gagal mengirim webhook: ${pingResult.error}`,
      });
    }

    // Action: Save / Update Callback URL
    const cleanUrl = callback_url && typeof callback_url === "string" ? callback_url.trim() : null;

    if (cleanUrl && !cleanUrl.startsWith("http")) {
      return NextResponse.json(
        { success: false, message: "URL Callback harus diawali dengan http:// atau https://" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { callback_url: cleanUrl },
    });

    return NextResponse.json({
      success: true,
      message: cleanUrl ? "URL Callback default berhasil disimpan" : "URL Callback default dinonaktifkan",
      callback_url: cleanUrl,
    });
  } catch (error) {
    console.error("POST /api/member/callback error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

