import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";
import { validateMobileApp } from "@/lib/mobile-auth";

/**
 * POST /api/mobile/v1/auth/login
 * Mobile login endpoint authenticated with api_app
 */
export async function POST(request: Request) {
  try {
    // 1. Validate Mobile App Key (api_app)
    const appCheck = await validateMobileApp(request);
    if (!appCheck.valid) {
      return appCheck.errorResponse!;
    }

    const body = await request.json().catch(() => ({}));
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Username/Email dan Password wajib diisi" },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();

    // 2. Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: trimmedIdentifier, mode: "insensitive" } },
          { email: { equals: trimmedIdentifier, mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Username atau Password salah" },
        { status: 401 }
      );
    }

    // 3. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Username atau Password salah" },
        { status: 401 }
      );
    }

    // 4. Generate signed session token for Mobile Bearer Auth
    const token = await createSessionToken({
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      email: user.email,
      level: user.level as "Admin" | "Member",
      server_area: user.server_area || "SG",
    });

    return NextResponse.json({
      success: true,
      message: `Selamat datang kembali, ${user.name || user.username}!`,
      token,
      data: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        name: user.name,
        balance: Number(user.balance),
        level: user.level,
        server_area: user.server_area,
        api_key: user.api_key,
        create_at: user.create_at,
      },
    });
  } catch (error) {
    console.error("POST /api/mobile/v1/auth/login error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}

