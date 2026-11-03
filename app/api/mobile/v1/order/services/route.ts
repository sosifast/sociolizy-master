import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateMobileApp } from "@/lib/mobile-auth";

/**
 * GET /api/mobile/v1/order/services
 * Get services grouped or filtered by platform
 * Query params: platform_id, platform_slug, category_id, search
 */
export async function GET(request: Request) {
  try {
    const appCheck = await validateMobileApp(request);
    if (!appCheck.valid) {
      return appCheck.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const platformId = searchParams.get("platform_id");
    const platformSlug = searchParams.get("platform_slug");
    const categoryId = searchParams.get("category_id");
    const search = searchParams.get("search")?.trim().toLowerCase();

    // Query Platforms with Categories and Services
    const wherePlatform: any = {};
    if (platformId) {
      wherePlatform.id = parseInt(platformId, 10);
    }
    if (platformSlug) {
      wherePlatform.slug = platformSlug;
    }

    const platforms = await prisma.platform.findMany({
      where: wherePlatform,
      orderBy: { id: "asc" },
      include: {
        categories: {
          where: categoryId ? { id: parseInt(categoryId, 10) } : undefined,
          orderBy: { id: "asc" },
          include: {
            services: {
              where: search
                ? {
                    OR: [
                      { service_name: { contains: search, mode: "insensitive" } },
                      { service_id: { contains: search } },
                    ],
                  }
                : undefined,
              orderBy: { id: "asc" },
              select: {
                id: true,
                uuid: true,
                service_id: true,
                service_name: true,
                slug: true,
                min: true,
                max: true,
                desc: true,
                rate_sale: true,
                id_category: true,
              },
            },
          },
        },
      },
    });

    // Format response
    const formatted = platforms
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        icon: p.icon,
        categories: p.categories
          .filter((c) => c.services.length > 0)
          .map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon,
            services: c.services.map((s) => ({
              id: s.id,
              service_id: s.service_id,
              name: s.service_name,
              slug: s.slug,
              min: s.min,
              max: s.max,
              desc: s.desc,
              rate_sale: Number(s.rate_sale),
              category_id: s.id_category,
              category_name: c.name,
              platform_name: p.name,
            })),
          })),
      }))
      .filter((p) => p.categories.length > 0);

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("GET /api/mobile/v1/order/services error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat daftar layanan" },
      { status: 500 }
    );
  }
}

