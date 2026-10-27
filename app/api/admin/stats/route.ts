import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      data: {
        usersCount,
        servicesCount,
        platformsCount,
        categoriesCount,
        totalProviderBalance,
        providers,
        platforms,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/stats error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil statistik";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
