import { NextResponse, connection } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/resend";

export async function POST(request: Request) {
  await connection();

  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
      return NextResponse.json(
        { success: false, message: "Please provide your registered email or username." },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();

    // Find user by either email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: cleanInput.toLowerCase(), mode: "insensitive" } },
          { username: { equals: cleanInput, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    // For security reasons, don't disclose whether an account exists or not
    if (!user || !user.email) {
      return NextResponse.json({
        success: true,
        message: "If an account matching that username or email exists, a password reset link has been sent.",
      });
    }

    // Generate secure reset token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_token_expiry: expiry,
      },
    });

    // Send reset email via Resend
    const emailResult = await sendPasswordResetEmail({
      email: user.email,
      username: user.username,
      resetToken,
    });

    if (!emailResult.success) {
      console.warn("[Resend] Failed to send password reset email:", emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: "If an account matching that username or email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

