import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";
import { traceUserActivity, extractClientIp } from "@/lib/trace-logger";

export async function POST(request: Request) {
  const startTime = Date.now();
  const ip = extractClientIp(request);
  const userAgent = request.headers.get("user-agent");

  try {
    const body = await request.json().catch(() => ({}));
    const { identifier, password } = body;

    if (!identifier || !password) {
      traceUserActivity({
        action: "AUTH_LOGIN",
        status: "FAILED",
        status_code: 400,
        username: identifier || null,
        ip,
        user_agent: userAgent,
        endpoint: "/api/auth/login",
        method: "POST",
        error_message: "Username/Email and Password are required.",
        latency_ms: Date.now() - startTime,
      });

      return NextResponse.json(
        { success: false, message: "Username/Email and Password are required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdentifier, mode: "insensitive" } },
          { email: { equals: cleanIdentifier.toLowerCase(), mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      traceUserActivity({
        action: "AUTH_LOGIN",
        status: "FAILED",
        status_code: 401,
        username: cleanIdentifier,
        ip,
        user_agent: userAgent,
        endpoint: "/api/auth/login",
        method: "POST",
        error_message: "User not found or invalid credentials.",
        latency_ms: Date.now() - startTime,
      });

      return NextResponse.json(
        { success: false, message: "Invalid username/email or password." },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      traceUserActivity({
        action: "AUTH_LOGIN",
        status: "FAILED",
        status_code: 401,
        user_id: user.id,
        username: user.username,
        ip,
        user_agent: userAgent,
        endpoint: "/api/auth/login",
        method: "POST",
        error_message: "Incorrect password.",
        latency_ms: Date.now() - startTime,
      });

      return NextResponse.json(
        { success: false, message: "Invalid username/email or password." },
        { status: 401 }
      );
    }

    // Determine redirect destination based on role (Admin -> /admin, Member -> /member)
    const redirectUrl = user.level === "Admin" ? "/admin" : "/member";

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name || user.username}!`,
      data: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        level: user.level,
        balance: user.balance,
        server_area: user.server_area,
        redirectUrl,
      },
    });

    // Create encrypted session token HMAC SHA-256
    const sessionToken = await createSessionToken({
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      level: user.level,
      server_area: user.server_area,
    });

    response.cookies.set("user_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    traceUserActivity({
      action: "AUTH_LOGIN",
      status: "SUCCESS",
      status_code: 200,
      user_id: user.id,
      username: user.username,
      ip,
      user_agent: userAgent,
      endpoint: "/api/auth/login",
      method: "POST",
      response_payload: { level: user.level, redirectUrl },
      latency_ms: Date.now() - startTime,
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    const message = error instanceof Error ? error.message : "An internal server error occurred.";

    traceUserActivity({
      action: "AUTH_LOGIN",
      status: "FAILED",
      status_code: 500,
      ip,
      user_agent: userAgent,
      endpoint: "/api/auth/login",
      method: "POST",
      error_message: message,
      latency_ms: Date.now() - startTime,
    });

    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
