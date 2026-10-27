import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const platforms = await prisma.platform.findMany({
      include: {
        _count: {
          select: { categories: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: platforms,
    });
  } catch (error) {
    console.error("GET /api/admin/platform error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data platform";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama platform wajib diisi" },
        { status: 400 }
      );
    }

    const cleanSlug = slug && slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    // Cek apakah slug sudah ada
    const existing = await prisma.platform.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Platform dengan slug '${cleanSlug}' sudah ada` },
        { status: 409 }
      );
    }

    const newPlatform = await prisma.platform.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        icon: icon || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Platform berhasil ditambahkan",
      data: newPlatform,
    });
  } catch (error) {
    console.error("POST /api/admin/platform error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat platform";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
