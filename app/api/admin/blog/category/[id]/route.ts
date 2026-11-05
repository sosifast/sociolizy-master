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

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { id } = await context.params;
    const catId = parseInt(id);

    if (isNaN(catId)) {
      return NextResponse.json({ success: false, message: "ID Kategori tidak valid" }, { status: 400 });
    }

    const category = await prisma.blogCategory.findUnique({
      where: { id: catId },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ success: false, message: "Kategori tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("GET /api/admin/blog/category/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data kategori";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { id } = await context.params;
    const catId = parseInt(id);

    if (isNaN(catId)) {
      return NextResponse.json({ success: false, message: "ID Kategori tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { name, slug: customSlug, description, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, message: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const cleanSlug = customSlug && customSlug.trim()
      ? generateSlug(customSlug)
      : generateSlug(name);

    // Check duplicate slug for different ID
    const duplicate = await prisma.blogCategory.findFirst({
      where: {
        slug: cleanSlug,
        id: { not: catId },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Slug kategori sudah digunakan oleh kategori lain" },
        { status: 400 }
      );
    }

    const updated = await prisma.blogCategory.update({
      where: { id: catId },
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
      data: updated,
      message: "Kategori berhasil diperbarui",
    });
  } catch (error) {
    console.error("PUT /api/admin/blog/category/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal memperbarui kategori";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { id } = await context.params;
    const catId = parseInt(id);

    if (isNaN(catId)) {
      return NextResponse.json({ success: false, message: "ID Kategori tidak valid" }, { status: 400 });
    }

    // Set category_id of articles to null before deleting
    await prisma.blogArticle.updateMany({
      where: { category_id: catId },
      data: { category_id: null },
    });

    await prisma.blogCategory.delete({
      where: { id: catId },
    });

    invalidateCacheTag("blog", "categories");

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/admin/blog/category/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghapus kategori";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

