import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, getCacheHeaders } from "@/lib/server-cache";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const categorySlug = searchParams.get("category") || "";
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";
    const featured = searchParams.get("featured") === "true";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "9")));
    const skip = (page - 1) * limit;

    const cacheKey = `public:blog:list:${categorySlug}:${search}:${tag}:${featured}:${page}:${limit}`;

    const data = await getCachedData(
      cacheKey,
      async () => {
        // Base where condition for published articles
        const where: any = {
          status: "PUBLISHED",
        };

        if (featured) {
          where.is_featured = true;
        }

        if (categorySlug && categorySlug !== "all") {
          where.category = {
            slug: categorySlug,
          };
        }

        if (tag) {
          where.tags = {
            contains: tag,
            mode: "insensitive",
          };
        }

        if (search.trim()) {
          where.OR = [
            { title: { contains: search.trim(), mode: "insensitive" } },
            { excerpt: { contains: search.trim(), mode: "insensitive" } },
            { tags: { contains: search.trim(), mode: "insensitive" } },
          ];
        }

        const [articles, total, categories, featuredArticle] = await Promise.all([
          prisma.blogArticle.findMany({
            where,
            select: {
              id: true,
              uuid: true,
              title: true,
              slug: true,
              excerpt: true,
              cover_image: true,
              author_name: true,
              status: true,
              views: true,
              reading_time: true,
              tags: true,
              is_featured: true,
              published_at: true,
              create_at: true,
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                },
              },
            },
            orderBy: [{ is_featured: "desc" }, { published_at: "desc" }],
            skip,
            take: limit,
          }),

          prisma.blogArticle.count({ where }),

          prisma.blogCategory.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              color: true,
              _count: {
                select: {
                  articles: {
                    where: { status: "PUBLISHED" },
                  },
                },
              },
            },
            orderBy: { name: "asc" },
          }),

          // Find one highlighted featured article (if on page 1 and no specific search)
          page === 1 && !search && (!categorySlug || categorySlug === "all")
            ? prisma.blogArticle.findFirst({
                where: {
                  status: "PUBLISHED",
                  is_featured: true,
                },
                select: {
                  id: true,
                  uuid: true,
                  title: true,
                  slug: true,
                  excerpt: true,
                  cover_image: true,
                  author_name: true,
                  views: true,
                  reading_time: true,
                  tags: true,
                  published_at: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      color: true,
                    },
                  },
                },
                orderBy: { published_at: "desc" },
              })
            : null,
        ]);

        return {
          articles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit) || 1,
          },
          categories,
          featuredArticle,
        };
      },
      { ttlSeconds: 60, tags: ["blog", "categories"] }
    );

    return NextResponse.json(
      {
        success: true,
        ...data,
      },
      { headers: getCacheHeaders(30, 60) }
    );
  } catch (error) {
    console.error("GET /api/blog error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil daftar artikel";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
