import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, props: RouteParams) {
  try {
    const { slug } = await props.params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    const page = await prisma.customPage.findUnique({
      where: { slug },
    });

    if (!page || page.status !== "PUBLISHED") {
      return NextResponse.json(
        { success: false, message: "Page not found or not published" },
        { status: 404 }
      );
    }

    // Increment views asynchronously
    prisma.customPage
      .update({
        where: { id: page.id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => console.error("Failed to increment views:", err));

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error: any) {
    console.error("GET /api/page-builder/[slug] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch page" },
      { status: 500 }
    );
  }
}

