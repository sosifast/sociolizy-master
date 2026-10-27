import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        category: {
          include: {
            platform: true,
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("GET /api/admin/service error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data layanan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id_category,
      service_name,
      slug,
      service_id,
      min,
      max,
      desc,
      rate_api,
      rate_sale,
    } = body;

    if (!id_category || !service_name || !service_id) {
      return NextResponse.json(
        { success: false, message: "Kategori, nama layanan, dan Service ID provider wajib diisi" },
        { status: 400 }
      );
    }

    const categoryId = Number(id_category);
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { success: false, message: "Kategori yang dipilih tidak ditemukan" },
        { status: 404 }
      );
    }

    const cleanSlug = slug && slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : service_name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const existingSlug = await prisma.service.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: `Layanan dengan slug '${cleanSlug}' sudah ada` },
        { status: 409 }
      );
    }

    const newService = await prisma.service.create({
      data: {
        id_category: categoryId,
        service_name: service_name.trim(),
        slug: cleanSlug,
        service_id: String(service_id).trim(),
        min: Number(min || 0),
        max: Number(max || 10000),
        desc: desc || null,
        rate_api: Number(rate_api || 0),
        rate_sale: Number(rate_sale || 0),
      },
      include: {
        category: {
          include: {
            platform: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Layanan berhasil ditambahkan",
      data: newService,
    });
  } catch (error) {
    console.error("POST /api/admin/service error:", error);
    const message = error instanceof Error ? error.message : "Gagal menambahkan layanan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
