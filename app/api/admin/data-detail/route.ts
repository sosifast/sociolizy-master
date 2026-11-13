import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCacheTag } from "@/lib/server-cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("id_category");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (categoryId && !isNaN(Number(categoryId))) {
      where.id_category = Number(categoryId);
    }

    if (search.trim()) {
      where.OR = [
        { conteks: { contains: search.trim(), mode: "insensitive" } },
        { category: { name: { contains: search.trim(), mode: "insensitive" } } },
      ];
    }

    const [total, dataDetails] = await Promise.all([
      prisma.dataDetail.count({ where }),
      prisma.dataDetail.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              platform: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { id: "desc" },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: dataDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/data-detail error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data detail";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id_category, conteks } = body;

    if (!id_category) {
      return NextResponse.json(
        { success: false, message: "Kategori wajib dipilih" },
        { status: 400 }
      );
    }

    if (!conteks || !conteks.trim()) {
      return NextResponse.json(
        { success: false, message: "Konten konteks (conteks) wajib diisi" },
        { status: 400 }
      );
    }

    const catId = Number(id_category);
    const category = await prisma.category.findUnique({
      where: { id: catId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan di database" },
        { status: 404 }
      );
    }

    const created = await prisma.dataDetail.create({
      data: {
        id_category: catId,
        conteks: conteks.trim(),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    invalidateCacheTag("data-details");

    return NextResponse.json({
      success: true,
      message: "Data detail berhasil disimpan",
      data: created,
    });
  } catch (error) {
    console.error("POST /api/admin/data-detail error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat data detail";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

