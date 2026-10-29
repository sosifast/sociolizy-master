import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, getCacheHeaders } from "@/lib/server-cache";

export async function GET() {
  try {
    const data = await getCachedData(
      "member:order:services",
      async () => {
        // Fetch categories with active services
        const categories = await prisma.category.findMany({
          include: {
            platform: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
              },
            },
            services: {
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
                rate_api: true,
                id_category: true,
                id_api_provider: true,
              },
              orderBy: { id: "asc" },
            },
          },
          orderBy: { name: "asc" },
        });

        // Filter out categories with 0 services
        return categories.filter((c) => c.services.length > 0);
      },
      { ttlSeconds: 60, tags: ["services", "categories"] }
    );

    return NextResponse.json(
      { success: true, data },
      { headers: getCacheHeaders(30, 60) }
    );
  } catch (error) {
    console.error("GET /api/member/services error:", error);
    const message = error instanceof Error ? error.message : "Gagal memuat katalog layanan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

