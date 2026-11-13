import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDiscoveredRegions, getActiveClusterConfig } from "@/lib/server-db";
import { allocateRollingServerNode } from "@/lib/mongodb";
import { sendRegistrationEmail } from "@/lib/resend";
import { traceUserActivity, extractClientIp } from "@/lib/trace-logger";

/**
 * GET: Retrieve active cluster regions detected in environment
 */
export async function GET() {
  try {
    const regions = getDiscoveredRegions();
    const active = getActiveClusterConfig();

    return NextResponse.json({
      success: true,
      data: {
        defaultRegion: active.group || "SG",
        regions: regions.map((r) => ({
          code: r.code,
          name: r.name,
          flag: r.flag,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/auth/register error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load server cluster regions." },
      { status: 500 }
    );
  }
}

/**
 * POST: Register new user with selected cluster region
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  const ip = extractClientIp(request);
  const userAgent = request.headers.get("user-agent");

  try {
    const body = await request.json().catch(() => ({}));
    const { username, email, password, confirmPassword, server_area, server_region } = body;

    const selectedArea = (server_area || server_region || "SG").toUpperCase().trim();

    // Input validation
    if (!username || !email || !password) {
      traceUserActivity({
        action: "AUTH_REGISTER",
        status: "FAILED",
        status_code: 400,
        username: username || email || null,
        ip,
        user_agent: userAgent,
        endpoint: "/api/auth/register",
        method: "POST",
        error_message: "All required fields must be filled.",
        latency_ms: Date.now() - startTime,
      });

      return NextResponse.json(
        { success: false, message: "All required fields must be filled." },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Invalid email address format." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Check existing username or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: username.trim(), mode: "insensitive" } },
          { email: { equals: email.trim().toLowerCase(), mode: "insensitive" } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === username.trim().toLowerCase()) {
        return NextResponse.json(
          { success: false, message: "Username is already taken. Please choose another." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Email is already registered. Please log in or use another email." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-generate unique API key
    const apiKey = `smm_${crypto.randomBytes(16).toString("hex")}`;

    // Allocate MongoDB server node
    const { assignedNode } = await allocateRollingServerNode(selectedArea);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        balance: 0,
        level: "Member",
        api_key: apiKey,
        server_area: assignedNode,
      },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        level: true,
        balance: true,
        server_area: true,
        create_at: true,
      },
    });

    // Trigger Pusher notification
    try {
      const { pusherServer } = await import("@/lib/pusher");
      await pusherServer.trigger("admin-notifications", "user-registered", {
        id: newUser.id,
        uuid: newUser.uuid,
        username: newUser.username,
        email: newUser.email,
        server_area: newUser.server_area,
        created_at: newUser.create_at,
      });
    } catch (pErr) {
      console.warn("Pusher user-registered trigger warning:", pErr);
    }

    // Send Welcome Email via Resend
    try {
      await sendRegistrationEmail({
        email: newUser.email,
        username: newUser.username,
        serverArea: newUser.server_area,
      });
    } catch (emailErr) {
      console.warn("[Resend] Failed to send registration email:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully! Please sign in.",
      data: newUser,
    });
  } catch (error) {
    console.error("Register Error:", error);
    const message = error instanceof Error ? error.message : "An internal server error occurred.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
