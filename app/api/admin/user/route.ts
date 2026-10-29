import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDiscoveredRegions } from "@/lib/server-db";
import { allocateRollingServerNode } from "@/lib/mongodb";
import { getCachedData, invalidateCacheTag, getCacheHeaders } from "@/lib/server-cache";

export async function GET() {
  try {
    const payload = await getCachedData(
      "admin:users",
      async () => {
        const users = await prisma.user.findMany({
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
          orderBy: { id: "desc" },
        });

        const regions = getDiscoveredRegions().map((r) => ({
          code: r.code,
          name: r.name,
          flag: r.flag,
        }));

        return { users, regions };
      },
      { ttlSeconds: 45, tags: ["users"] }
    );

    return NextResponse.json(
      {
        success: true,
        data: payload.users,
        regions: payload.regions,
      },
      { headers: getCacheHeaders(20, 45) }
    );
  } catch (error) {
    console.error("GET /api/admin/user error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data pengguna";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password, level, balance } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Username, email, dan password wajib diisi" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Cek duplikasi
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: cleanUsername, mode: "insensitive" } },
          { email: { equals: cleanEmail, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Username atau email sudah terdaftar" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = `smm_${crypto.randomBytes(16).toString("hex")}`;

    const requestedArea = (body.server_area || body.server_region || "SG").toUpperCase().trim();
    const { assignedNode } = await allocateRollingServerNode(requestedArea);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        password: hashedPassword,
        level: level === "Admin" ? "Admin" : "Member",
        balance: Number(balance || 0),
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
        api_key: true,
        server_area: true,
        create_at: true,
        update_at: true,
      },
    });

    invalidateCacheTag("users", "stats");

    return NextResponse.json({
      success: true,
      message: "Pengguna berhasil ditambahkan",
      data: newUser,
    });
  } catch (error) {
    console.error("POST /api/admin/user error:", error);
    const message = error instanceof Error ? error.message : "Gagal menambahkan pengguna";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
