import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Username/Email dan Password wajib diisi" },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Cari user berdasarkan username atau email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanIdentifier, mode: "insensitive" } },
          { email: { equals: cleanIdentifier.toLowerCase(), mode: "insensitive" } },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Username atau Password salah" },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Username atau Password salah" },
        { status: 401 }
      );
    }

    // Tentukan url pengalihan berdasarkan level (Admin -> /admin, Member -> /member)
    const redirectUrl = user.level === "Admin" ? "/admin" : "/member";

    const response = NextResponse.json({
      success: true,
      message: `Selamat datang kembali, ${user.username}!`,
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

    // Buat token session terenkripsi HMAC SHA-256
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
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
