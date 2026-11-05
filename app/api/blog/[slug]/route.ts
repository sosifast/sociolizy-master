import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug artikel tidak valid" },
        { status: 400 }
      );
    }

    const article = await prisma.blogArticle.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            description: true,
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
    });

    if (!article || article.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, message: "Artikel tidak ditemukan atau belum dipublikasikan" },
        { status: 404 }
      );
    }

    // Increment views asynchronously in the background
    prisma.blogArticle
      .update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => console.error("Error incrementing article views:", err));

    // Fetch related articles (same category, or latest if category has none)
    const relatedArticles = await prisma.blogArticle.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: article.id },
        ...(article.category_id ? { category_id: article.category_id } : {}),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        cover_image: true,
        reading_time: true,
        published_at: true,
        category: {
          select: {
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      take: 3,
      orderBy: { published_at: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...article,
        views: article.views + 1, // reflect the view immediately
      },
      related: relatedArticles,
    });
  } catch (error) {
    console.error("GET /api/blog/[slug] error:", error);
    const message = error instanceof Error ? error.message : "Gagal memuat artikel";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

