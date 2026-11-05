import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifySessionToken } from "@/lib/auth";
import { invalidateCacheTag } from "@/lib/server-cache";
import { generateSlug, calculateReadingTime, stripMarkdown } from "@/lib/blog-utils";

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
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, message: "ID Artikel tidak valid" }, { status: 400 });
    }

    const article = await prisma.blogArticle.findUnique({
      where: { id: articleId },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            username: true,
            name: true,
          },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ success: false, message: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("GET /api/admin/blog/article/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data artikel";
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
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, message: "ID Artikel tidak valid" }, { status: 400 });
    }

    const existing = await prisma.blogArticle.findUnique({
      where: { id: articleId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Artikel tidak ditemukan" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      cover_image,
      category_id,
      status,
      reading_time,
      meta_title,
      meta_description,
      tags,
      is_featured,
      author_name,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, message: "Judul artikel wajib diisi" }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, message: "Konten artikel wajib diisi" }, { status: 400 });
    }

    const cleanSlug = customSlug && customSlug.trim()
      ? generateSlug(customSlug)
      : generateSlug(title);

    // Check duplicate slug for another article
    const duplicate = await prisma.blogArticle.findFirst({
      where: {
        slug: cleanSlug,
        id: { not: articleId },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Slug artikel sudah digunakan oleh artikel lain" },
        { status: 400 }
      );
    }

    const computedReadingTime =
      reading_time && Number(reading_time) > 0
        ? Number(reading_time)
        : calculateReadingTime(content);

    const finalExcerpt = excerpt && excerpt.trim()
      ? excerpt.trim()
      : stripMarkdown(content, 180);

    // If publishing now for the first time
    const publishedAt =
      status === "PUBLISHED"
        ? existing.published_at ?? new Date()
        : existing.published_at;

    const updated = await prisma.blogArticle.update({
      where: { id: articleId },
      data: {
        title: title.trim(),
        slug: cleanSlug,
        excerpt: finalExcerpt,
        content: content.trim(),
        cover_image: cover_image ? cover_image.trim() : null,
        category_id: category_id ? Number(category_id) : null,
        status: status || existing.status,
        reading_time: computedReadingTime,
        meta_title: meta_title && meta_title.trim() ? meta_title.trim() : title.trim(),
        meta_description: meta_description && meta_description.trim() ? meta_description.trim() : finalExcerpt,
        tags: tags ? tags.trim() : null,
        is_featured: typeof is_featured === "boolean" ? is_featured : existing.is_featured,
        author_name: author_name && author_name.trim() ? author_name.trim() : existing.author_name,
        published_at: publishedAt,
      },
    });

    invalidateCacheTag("blog", "categories");
    try {
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog");
      revalidatePath(`/blog/${cleanSlug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Artikel berhasil diperbarui",
    });
  } catch (error) {
    console.error("PUT /api/admin/blog/article/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal memperbarui artikel";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { id } = await context.params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, message: "ID Artikel tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (typeof body.status === "string") {
      updateData.status = body.status;
      if (body.status === "PUBLISHED") {
        updateData.published_at = new Date();
      }
    }

    if (typeof body.is_featured === "boolean") {
      updateData.is_featured = body.is_featured;
    }

    const updated = await prisma.blogArticle.update({
      where: { id: articleId },
      data: updateData,
    });

    invalidateCacheTag("blog", "categories");
    try {
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog");
      revalidatePath(`/blog/${updated.slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Status artikel berhasil diperbarui",
    });
  } catch (error) {
    console.error("PATCH /api/admin/blog/article/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal memperbarui status";
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
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json({ success: false, message: "ID Artikel tidak valid" }, { status: 400 });
    }

    await prisma.blogArticle.delete({
      where: { id: articleId },
    });

    invalidateCacheTag("blog", "categories");
    try {
      revalidatePath("/sitemap.xml");
      revalidatePath("/blog");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/admin/blog/article/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghapus artikel";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

