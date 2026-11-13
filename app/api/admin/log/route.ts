import { NextResponse } from "next/server";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import { getTraceLogs, getTraceLogStats, recordTrace } from "@/lib/trace-logger";

export async function GET(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(sessionCookie);

    if (!session || session.level !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const [result, stats] = await Promise.all([
      getTraceLogs({
        type,
        status,
        search,
        page,
        limit,
        startDate,
        endDate,
      }),
      getTraceLogStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: result.logs,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      stats,
    });
  } catch (error: any) {
    console.error("GET /api/admin/log error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch trace logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(sessionCookie);

    if (!session || session.level !== "Admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { action = "TEST_TRACE", type = "user", message = "Manual test trace generated from Admin Console" } = body;

    await recordTrace({
      type: ["user", "smm", "merchant", "mobile"].includes(type) ? type : "user",
      action,
      status: "SUCCESS",
      status_code: 200,
      user_id: session.id,
      username: session.username,
      endpoint: "/api/admin/log",
      method: "POST",
      request_payload: { trigger: "admin_manual_test", timestamp: new Date().toISOString() },
      response_payload: { message: "Test trace recorded successfully" },
      latency_ms: 5,
      metadata: { admin_test: true, note: message },
    });

    return NextResponse.json({
      success: true,
      message: "Test trace log successfully created in MongoDB with 7-day TTL rotation.",
    });
  } catch (error: any) {
    console.error("POST /api/admin/log error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to create trace log" },
      { status: 500 }
    );
  }
}

