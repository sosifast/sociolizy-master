import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        platform: true,
        _count: {
          select: { services: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("GET /api/admin/category error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data kategori";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_platform, name, slug, description, icon } = body;

    if (!id_platform) {
      return NextResponse.json(
        { success: false, message: "Platform induk wajib dipilih" },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const platformId = Number(id_platform);
    const platformExists = await prisma.platform.findUnique({
      where: { id: platformId },
    });

    if (!platformExists) {
      return NextResponse.json(
        { success: false, message: "Platform yang dipilih tidak ditemukan" },
        { status: 404 }
      );
    }

    const cleanSlug = slug && slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const existingSlug = await prisma.category.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: `Kategori dengan slug '${cleanSlug}' sudah ada` },
        { status: 409 }
      );
    }

    const newCategory = await prisma.category.create({
      data: {
        id_platform: platformId,
        name: name.trim(),
        slug: cleanSlug,
        description: description || null,
        icon: icon || null,
      },
      include: {
        platform: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: newCategory,
    });
  } catch (error) {
    console.error("POST /api/admin/category error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat kategori";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
