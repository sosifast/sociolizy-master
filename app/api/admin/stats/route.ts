import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, getCacheHeaders } from "@/lib/server-cache";

export async function GET() {
  try {
    const statsData = await getCachedData(
      "admin:stats",
      async () => {
        const [
          usersCount,
          servicesCount,
          platformsCount,
          categoriesCount,
          providers,
          platforms,
          recentUsers,
        ] = await Promise.all([
          prisma.user.count(),
          prisma.service.count(),
          prisma.platform.count(),
          prisma.category.count(),
          prisma.apiProvider.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              balance: true,
            },
            orderBy: { id: "desc" },
          }),
          prisma.platform.findMany({
            select: {
              id: true,
              name: true,
              slug: true,
              _count: {
                select: { categories: true },
              },
            },
            orderBy: { id: "desc" },
            take: 6,
          }),
          prisma.user.findMany({
            take: 5,
            orderBy: { id: "desc" },
            select: {
              id: true,
              username: true,
              email: true,
              level: true,
              balance: true,
              create_at: true,
            },
          }),
        ]);

        const totalProviderBalance = providers.reduce(
          (acc, curr) => acc + Number(curr.balance || 0),
          0
        );

        return {
          usersCount,
          servicesCount,
          platformsCount,
          categoriesCount,
          totalProviderBalance,
          providers,
          platforms,
          recentUsers,
        };
      },
      { ttlSeconds: 30, tags: ["stats"] }
    );

    return NextResponse.json(
      {
        success: true,
        data: statsData,
      },
      { headers: getCacheHeaders(15, 30) }
    );
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil statistik";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
