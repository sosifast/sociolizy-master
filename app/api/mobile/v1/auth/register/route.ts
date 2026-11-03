import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDiscoveredRegions, getActiveClusterConfig } from "@/lib/server-db";
import { allocateRollingServerNode } from "@/lib/mongodb";
import { sendRegistrationEmail } from "@/lib/resend";
import { createSessionToken } from "@/lib/auth";
import { validateMobileApp } from "@/lib/mobile-auth";

/**
 * GET /api/mobile/v1/auth/register
 * Returns available server areas / cluster regions for registration
 */
export async function GET(request: Request) {
  try {
    const appCheck = await validateMobileApp(request);
    if (!appCheck.valid) {
      return appCheck.errorResponse!;
    }

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
    console.error("GET /api/mobile/v1/auth/register error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat pilihan server cluster" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mobile/v1/auth/register
 * Mobile user registration with server_area selection
 */
export async function POST(request: Request) {
  try {
    const appCheck = await validateMobileApp(request);
    if (!appCheck.valid) {
      return appCheck.errorResponse!;
    }

    const body = await request.json().catch(() => ({}));
    const { username, email, password, confirmPassword, server_area, server_region, name } = body;

    const selectedArea = (server_area || server_region || "SG").toUpperCase().trim();

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: "Username minimal 3 karakter" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter" },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Konfirmasi password tidak cocok" },
        { status: 400 }
      );
    }

    // Check duplicate username / email
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
          { success: false, message: "Username sudah digunakan, silakan pilih yang lain" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Email sudah terdaftar, silakan gunakan email lain" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Auto-generate 16-char alphanumeric API Key
    const generatedApiKey = "smm_" + crypto.randomBytes(8).toString("hex");

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        name: name ? String(name).trim() : null,
        password: hashedPassword,
        level: "Member",
        balance: 0,
        api_key: generatedApiKey,
        server_area: selectedArea,
      },
    });

    // Allocate MongoDB server node
    try {
      await allocateRollingServerNode(selectedArea);
    } catch (allocErr) {
      console.warn("Failed to pre-allocate MongoDB server node:", allocErr);
    }

    // Send Welcome Email via Resend
    try {
      await sendRegistrationEmail({
        email: newUser.email,
        username: newUser.username,
        serverArea: newUser.server_area,
      });
    } catch (emailErr) {
      console.warn("Failed to dispatch registration email via Resend:", emailErr);
    }

    // Trigger Pusher notification
    try {
      const { pusherServer } = await import("@/lib/pusher");
      await pusherServer.trigger("admin-notifications", "user-registered", {
        username: newUser.username,
        email: newUser.email,
        server_area: newUser.server_area,
        created_at: newUser.create_at,
      });
    } catch (pusherErr) {
      console.warn("Failed to broadcast user-registered event to Pusher:", pusherErr);
    }

    // Generate token
    const token = await createSessionToken({
      id: newUser.id,
      uuid: newUser.uuid,
      username: newUser.username,
      email: newUser.email,
      level: newUser.level as "Admin" | "Member",
      server_area: newUser.server_area,
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dibuat! Selamat datang di aplikasi.",
      token,
      data: {
        id: newUser.id,
        uuid: newUser.uuid,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        level: newUser.level,
        balance: 0,
        server_area: newUser.server_area,
        api_key: newUser.api_key,
        create_at: newUser.create_at,
      },
    });
  } catch (error) {
    console.error("POST /api/mobile/v1/auth/register error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal saat registrasi" },
      { status: 500 }
    );
  }
}
