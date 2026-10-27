import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword } = body;

    // Validasi input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Semua kolom wajib diisi" },
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

    // Cek apakah username sudah dipakai
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
        { success: false, message: "Email sudah terdaftar, silakan gunakan email lain atau login" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate API Key unik untuk user
    const apiKey = `smm_${crypto.randomBytes(16).toString("hex")}`;

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        balance: 0,
        level: "Member",
        api_key: apiKey,
      },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        level: true,
        balance: true,
        create_at: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil dibuat! Silakan masuk.",
      data: newUser,
    });
  } catch (error) {
    console.error("Register Error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan internal server";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
