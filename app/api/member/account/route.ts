import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connection } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";

/**
 * GET /api/member/account
 * Returns profile details for the authenticated user
 */
export async function GET() {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        name: true,
        balance: true,
        level: true,
        api_key: true,
        server_area: true,
        create_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        name: user.name || "",
        balance: Number(user.balance),
        level: user.level,
        api_key: user.api_key || "",
        server_area: user.server_area,
        created_at: user.create_at.toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/member/account error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load account details" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/member/account
 * Updates profile name or password. Username and email are blocked from changes.
 */
export async function PATCH(request: Request) {
  await connection();

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("user_session")?.value;
    const session = await verifySessionToken(token);

    if (!session?.uuid) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { uuid: session.uuid },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { action } = body;

    // 1. Update Name
    if (action === "update_name") {
      const { name } = body;
      const cleanName = typeof name === "string" ? name.trim() : "";

      const updated = await prisma.user.update({
        where: { uuid: session.uuid },
        data: { name: cleanName },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Name updated successfully",
        data: updated,
      });
    }

    // 2. Update Password
    if (action === "update_password") {
      const { current_password, new_password, confirm_password } = body;

      if (!current_password || !new_password) {
        return NextResponse.json(
          { success: false, message: "Please provide current and new password." },
          { status: 400 }
        );
      }

      if (new_password.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      if (confirm_password !== undefined && new_password !== confirm_password) {
        return NextResponse.json(
          { success: false, message: "New password and confirmation do not match." },
          { status: 400 }
        );
      }

      const isCurrentValid = await bcrypt.compare(current_password, user.password);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, message: "Incorrect current password." },
          { status: 400 }
        );
      }

      const hashedNewPassword = await bcrypt.hash(new_password, 10);
      await prisma.user.update({
        where: { uuid: session.uuid },
        data: {
          password: hashedNewPassword,
          mobile_session_version: { increment: 1 },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Password changed successfully",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action specified" },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/member/account error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update account" },
      { status: 500 }
    );
  }
}
