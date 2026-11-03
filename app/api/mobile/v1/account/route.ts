import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { authenticateMobileUser } from "@/lib/mobile-auth";

/**
 * GET /api/mobile/v1/account
 * Returns full account and session data
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateMobileUser(request);
    if (!auth.valid) {
      return auth.errorResponse!;
    }

    const { user } = auth;
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET /api/mobile/v1/account error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/mobile/v1/account
 * Update account: name or password
 */
export async function PATCH(request: Request) {
  try {
    const auth = await authenticateMobileUser(request);
    if (!auth.valid) {
      return auth.errorResponse!;
    }

    const { user } = auth;
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { action, name, current_password, new_password, confirm_password } = body;

    // 1. Update Name
    if (action === "update_name" || (name !== undefined && !action)) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "Nama tidak boleh kosong" },
          { status: 400 }
        );
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: name.trim() },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          balance: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Nama berhasil diperbarui",
        data: {
          ...updated,
          balance: Number(updated.balance),
        },
      });
    }

    // 2. Update Password
    if (action === "update_password" || current_password || new_password) {
      if (!current_password || !new_password) {
        return NextResponse.json(
          { success: false, message: "Password saat ini dan password baru wajib diisi" },
          { status: 400 }
        );
      }

      if (new_password.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password baru minimal 6 karakter" },
          { status: 400 }
        );
      }

      if (confirm_password && new_password !== confirm_password) {
        return NextResponse.json(
          { success: false, message: "Konfirmasi password baru tidak cocok" },
          { status: 400 }
        );
      }

      // Check current password from DB
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { password: true },
      });

      if (!dbUser) {
        return NextResponse.json(
          { success: false, message: "Pengguna tidak ditemukan" },
          { status: 404 }
        );
      }

      const isCurrentValid = await bcrypt.compare(current_password, dbUser.password);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, message: "Password saat ini salah" },
          { status: 400 }
        );
      }

      // Hash and update
      const hashed = await bcrypt.hash(new_password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });

      return NextResponse.json({
        success: true,
        message: "Password berhasil diperbarui",
      });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak dikenali. Gunakan update_name atau update_password" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/mobile/v1/account error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal saat memperbarui profil" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/mobile/v1/account
 * Deletes user account (requires password verification for security)
 */
export async function DELETE(request: Request) {
  try {
    const auth = await authenticateMobileUser(request);
    if (!auth.valid) {
      return auth.errorResponse!;
    }

    const { user } = auth;
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { success: false, message: "Konfirmasi password diperlukan untuk menghapus akun" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    });

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, dbUser.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Password yang Anda masukkan salah" },
        { status: 401 }
      );
    }

    // Delete user from PostgreSQL
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({
      success: true,
      message: "Akun Anda telah berhasil dihapus secara permanen.",
    });
  } catch (error) {
    console.error("DELETE /api/mobile/v1/account error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus akun" },
      { status: 500 }
    );
  }
}

