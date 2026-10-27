import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serviceId = parseInt(id);

    if (isNaN(serviceId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        category: {
          include: {
            platform: true,
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
    const serviceId = parseInt(id);

    if (isNaN(serviceId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

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

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        ...(id_category && { id_category: Number(id_category) }),
        ...(service_name && { service_name: service_name.trim() }),
        ...(slug && { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") }),
        ...(service_id !== undefined && { service_id: String(service_id).trim() }),
        ...(min !== undefined && { min: Number(min) }),
        ...(max !== undefined && { max: Number(max) }),
        ...(desc !== undefined && { desc }),
        ...(rate_api !== undefined && { rate_api: Number(rate_api) }),
        ...(rate_sale !== undefined && { rate_sale: Number(rate_sale) }),
      },
    });

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
    const serviceId = parseInt(id);

    if (isNaN(serviceId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    await prisma.service.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      success: true,
      message: "Layanan berhasil dihapus",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus layanan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
