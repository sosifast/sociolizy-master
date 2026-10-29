import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDiscoveredRegions, getActiveClusterConfig } from "@/lib/server-db";
import { allocateRollingServerNode } from "@/lib/mongodb";

/**
 * GET: Mengambil daftar server region yang aktif dan terdeteksi di .env
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
      { success: false, message: "Gagal memuat pilihan server cluster" },
      { status: 500 }
    );
  }
}

/**
 * POST: Mendaftarkan user baru dengan pilihan server area / region
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, confirmPassword, server_area, server_region } = body;

    // Tentukan server area yang dipilih (fallback ke SG jika kosong)
    const selectedArea = (server_area || server_region || "SG").toUpperCase().trim();

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

    // Alokasikan server node MongoDB secara rolling otomatis berdasarkan wilayah yang dipilih
    // untuk membagi beban transaksi (I/O, cache, storage) secara merata per pengguna
    const { assignedNode } = await allocateRollingServerNode(selectedArea);

    // Buat user baru dengan server node rolling otomatis
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
