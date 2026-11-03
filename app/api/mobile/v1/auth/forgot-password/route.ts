import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/resend";
import { validateMobileApp } from "@/lib/mobile-auth";

/**
 * POST /api/mobile/v1/auth/forgot-password
 * Request a password reset link/token
 */
export async function POST(request: Request) {
  try {
    const appCheck = await validateMobileApp(request);
    if (!appCheck.valid) {
      return appCheck.errorResponse!;
    }

    const body = await request.json().catch(() => ({}));
    const { identifier } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: "Email atau username wajib diisi" },
        { status: 400 }
      );
    }

    const trimmed = identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: trimmed.toLowerCase(), mode: "insensitive" } },
          { username: { equals: trimmed, mode: "insensitive" } },
        ],
      },
    });

    if (user && user.email) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          reset_token: resetToken,
          reset_token_expiry: expiry,
        },
      });

      try {
        await sendPasswordResetEmail({
          email: user.email,
          username: user.username,
          resetToken,
        });
      } catch (err) {
        console.warn("Resend email failed:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message:
        "Jika akun dengan username atau email tersebut terdaftar, tautan reset password telah dikirim ke email Anda.",
    });
  } catch (error) {
    console.error("POST /api/mobile/v1/auth/forgot-password error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal pada server" },
      { status: 500 }
    );
  }
}

