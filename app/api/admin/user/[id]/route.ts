import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { invalidateCacheTag } from "@/lib/server-cache";
import { getDiscoveredRegions } from "@/lib/server-db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        level: true,
        balance: true,
        api_key: true,
        server_area: true,
        create_at: true,
        update_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    const regions = getDiscoveredRegions().map((r) => ({
      code: r.code,
      name: r.name,
      flag: r.flag,
    }));

    return NextResponse.json({ success: true, data: user, regions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error server";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { username, email, password, level, balance, server_area, server_region, regenerate_api_key } = body;

    const dataToUpdate: any = {};
    if (username) dataToUpdate.username = username.trim();
    if (email) dataToUpdate.email = email.trim().toLowerCase();
    if (level) dataToUpdate.level = level === "Admin" ? "Admin" : "Member";
    if (balance !== undefined) dataToUpdate.balance = Number(balance);
    if (server_area || server_region) dataToUpdate.server_area = String(server_area || server_region).toUpperCase().trim();
    if (password && password.trim().length >= 6) {
      dataToUpdate.password = await bcrypt.hash(password.trim(), 10);
    }
    if (regenerate_api_key) {
      dataToUpdate.api_key = `smm_${crypto.randomBytes(16).toString("hex")}`;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        uuid: true,
        username: true,
        email: true,
        level: true,
        balance: true,
        api_key: true,
        server_area: true,
        create_at: true,
        update_at: true,
      },
    });

    invalidateCacheTag("users", "stats");

    return NextResponse.json({
      success: true,
      message: "Data pengguna berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui pengguna";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    invalidateCacheTag("users", "stats");

    return NextResponse.json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus pengguna";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
