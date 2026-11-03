import { NextResponse, connection } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await connection();

  try {
    const body = await request.json();
    const { token, email, newPassword, confirmPassword } = body;

    if (!token || !email || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    // Verify token and validity window
    const user = await prisma.user.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        reset_token: token,
        reset_token_expiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "The password reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Hash new password and clear token
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        reset_token: null,
        reset_token_expiry: null,
        mobile_session_version: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
