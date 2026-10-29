import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, getCacheHeaders } from "@/lib/server-cache";

export async function GET() {
  try {
    const services = await getCachedData(
      "public:services",
      async () => {
        const rows = await prisma.service.findMany({
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
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
                platform: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    icon: true,
                  },
                },
              },
            },
          },
          orderBy: { id: "asc" },
        });

        // Convert Prisma Decimal to number to ensure safe serialization
        return rows.map((s) => ({
          ...s,
          rate_sale: Number(s.rate_sale || 0),
        }));
      },
      { ttlSeconds: 60, tags: ["services", "public-services"] }
    );

    return NextResponse.json(
      { success: true, data: services },
      { headers: getCacheHeaders(30, 60) }
    );
  } catch (error) {
    console.error("GET /api/services error:", error);
    const message = error instanceof Error ? error.message : "Failed to load services catalog";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

