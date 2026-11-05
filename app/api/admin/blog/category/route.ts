import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { invalidateCacheTag } from "@/lib/server-cache";
import { generateSlug } from "@/lib/blog-utils";

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = await verifySessionToken(token);
  return user && user.level === "Admin" ? user : null;
}

export async function GET() {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const categories = await prisma.blogCategory.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("GET /api/admin/blog/category error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil kategori blog";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const body = await req.json();
    const { name, slug: customSlug, description, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const cleanSlug = customSlug && customSlug.trim()
      ? generateSlug(customSlug)
      : generateSlug(name);

    if (!cleanSlug) {
      return NextResponse.json(
        { success: false, message: "Slug kategori tidak valid" },
        { status: 400 }
      );
    }

    // Check duplicate slug
    const existing = await prisma.blogCategory.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Slug kategori sudah digunakan, silakan pilih slug lain" },
        { status: 400 }
      );
    }

    const category = await prisma.blogCategory.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        description: description ? description.trim() : null,
        color: color || "emerald",
      },
    });

    invalidateCacheTag("blog", "categories");

    return NextResponse.json({
      success: true,
      data: category,
      message: "Kategori berhasil dibuat",
    });
  } catch (error) {
    console.error("POST /api/admin/blog/category error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat kategori";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

