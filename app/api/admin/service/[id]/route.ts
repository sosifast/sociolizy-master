import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCacheTag } from "@/lib/server-cache";

function getServiceWhere(identifier: string) {
  const isNumeric = !isNaN(parseInt(identifier)) && /^\d+$/.test(identifier);
  return isNumeric ? { id: parseInt(identifier, 10) } : { uuid: identifier };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const where = getServiceWhere(id);
    const service = await prisma.service.findUnique({
      where,
      include: {
        category: {
          include: {
            platform: true,
          },
        },
        api_provider: {
          select: {
            id: true,
            uuid: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ success: false, message: "Layanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error server";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const where = getServiceWhere(id);
    const body = await request.json();
    const {
      id_category,
      id_api_provider,
      service_name,
      slug,
      service_id,
      min,
      max,
      desc,
      rate_api,
      rate_sale,
    } = body;

    const updated = await prisma.service.update({
      where,
      data: {
        ...(id_category && { id_category: Number(id_category) }),
        ...(id_api_provider !== undefined && {
          id_api_provider: id_api_provider ? Number(id_api_provider) : null,
        }),
        ...(service_name && { service_name: service_name.trim() }),
        ...(slug && { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") }),
        ...(service_id !== undefined && { service_id: String(service_id).trim() }),
        ...(min !== undefined && { min: Number(min) }),
        ...(max !== undefined && { max: Number(max) }),
        ...(desc !== undefined && { desc }),
        ...(rate_api !== undefined && { rate_api: Number(rate_api) }),
        ...(rate_sale !== undefined && { rate_sale: Number(rate_sale) }),
      },
      include: {
        category: {
          include: {
            platform: true,
          },
        },
        api_provider: {
          select: {
            id: true,
            uuid: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    invalidateCacheTag("services", "stats", "categories");

    return NextResponse.json({
      success: true,
      message: "Layanan berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui layanan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const where = getServiceWhere(id);
    await prisma.service.delete({
      where,
    });

    invalidateCacheTag("services", "stats", "categories");

    return NextResponse.json({
      success: true,
      message: "Layanan berhasil dihapus",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus layanan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
