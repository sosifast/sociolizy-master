import { NextRequest, NextResponse } from "next/server";
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

export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdminAuth();
    if (!admin) {
      return NextResponse.json({ success: false, message: "Akses ditolak" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const categoryId = searchParams.get("category_id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (categoryId && categoryId !== "ALL") {
      const parsedCatId = parseInt(categoryId);
      if (!isNaN(parsedCatId)) {
        where.category_id = parsedCatId;
      }
    }

    if (search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { slug: { contains: search.trim(), mode: "insensitive" } },
        { tags: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [articles, total, stats] = await Promise.all([
      prisma.blogArticle.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
            },
          },
          author: {
            select: {
              id: true,
              username: true,
              name: true,
            },
          },
        },
        orderBy: [{ is_featured: "desc" }, { id: "desc" }],
        skip,
        take: limit,
      }),

      prisma.blogArticle.count({ where }),

      // Quick summary stats for admin dashboard
      Promise.all([
        prisma.blogArticle.count(),
        prisma.blogArticle.count({ where: { status: "PUBLISHED" } }),
        prisma.blogArticle.count({ where: { status: "DRAFT" } }),
        prisma.blogArticle.aggregate({ _sum: { views: true } }),
      ]),
    ]);

    const [totalAll, publishedCount, draftCount, viewsAggregate] = stats;

    return NextResponse.json({
      success: true,
      data: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        total: totalAll,
        published: publishedCount,
        draft: draftCount,
        totalViews: viewsAggregate._sum.views || 0,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/blog/article error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil daftar artikel";
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
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      cover_image,
      category_id,
      status = "PUBLISHED",
      reading_time,
      meta_title,
      meta_description,
      tags,
      is_featured = false,
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

    if (!cleanSlug) {
      return NextResponse.json({ success: false, message: "Slug artikel tidak valid" }, { status: 400 });
    }

    // Check unique slug
    const existing = await prisma.blogArticle.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Slug artikel sudah digunakan, silakan gunakan slug lain" },
        { status: 400 }
      );
    }

    // Auto-calculate reading time if not provided or 0
    const computedReadingTime =
      reading_time && Number(reading_time) > 0
        ? Number(reading_time)
        : calculateReadingTime(content);

    // Auto-generate excerpt if not provided
    const finalExcerpt = excerpt && excerpt.trim()
      ? excerpt.trim()
      : stripMarkdown(content, 180);

    const article = await prisma.blogArticle.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        excerpt: finalExcerpt,
        content: content.trim(),
        cover_image: cover_image ? cover_image.trim() : null,
        category_id: category_id ? Number(category_id) : null,
        author_id: admin.id,
        author_name: author_name && author_name.trim() ? author_name.trim() : "Sociolizy Team",
        status: status || "PUBLISHED",
        reading_time: computedReadingTime,
        meta_title: meta_title && meta_title.trim() ? meta_title.trim() : title.trim(),
        meta_description: meta_description && meta_description.trim() ? meta_description.trim() : finalExcerpt,
        tags: tags ? tags.trim() : null,
        is_featured: Boolean(is_featured),
        published_at: status === "PUBLISHED" ? new Date() : null,
      },
    });

    invalidateCacheTag("blog", "categories");

    return NextResponse.json({
      success: true,
      data: article,
      message: "Artikel berhasil dibuat",
    });
  } catch (error) {
    console.error("POST /api/admin/blog/article error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat artikel";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
