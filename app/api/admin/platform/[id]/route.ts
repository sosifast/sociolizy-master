import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const platformId = parseInt(id);

    if (isNaN(platformId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const platform = await prisma.platform.findUnique({
      where: { id: platformId },
      include: {
        categories: true,
      },
    });

    if (!platform) {
      return NextResponse.json({ success: false, message: "Platform tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: platform });
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
    const platformId = parseInt(id);

    if (isNaN(platformId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { name, slug, icon } = body;

    const updated = await prisma.platform.update({
      where: { id: platformId },
      data: {
        ...(name && { name: name.trim() }),
        ...(slug && { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") }),
        ...(icon !== undefined && { icon }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Platform berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui platform";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const platformId = parseInt(id);

    if (isNaN(platformId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    await prisma.platform.delete({
      where: { id: platformId },
    });

    return NextResponse.json({
      success: true,
      message: "Platform berhasil dihapus beserta seluruh kategorinya",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus platform";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
