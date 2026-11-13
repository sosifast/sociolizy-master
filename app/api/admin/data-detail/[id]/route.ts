import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCacheTag } from "@/lib/server-cache";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const item = await prisma.dataDetail.findUnique({
      where: { id: Number(id) },
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
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Data detail tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("GET /api/admin/data-detail/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data detail";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { id_category, conteks } = body;

    const existing = await prisma.dataDetail.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data detail tidak ditemukan" },
        { status: 404 }
      );
    }

    const dataToUpdate: any = {};

    if (id_category !== undefined) {
      const catId = Number(id_category);
      const category = await prisma.category.findUnique({
        where: { id: catId },
      });
      if (!category) {
        return NextResponse.json(
          { success: false, message: "Kategori tidak ditemukan" },
          { status: 404 }
        );
      }
      dataToUpdate.id_category = catId;
    }

    if (conteks !== undefined) {
      if (!conteks.trim()) {
        return NextResponse.json(
          { success: false, message: "Konten konteks tidak boleh kosong" },
          { status: 400 }
        );
      }
      dataToUpdate.conteks = conteks.trim();
    }

    const updated = await prisma.dataDetail.update({
      where: { id: Number(id) },
      data: dataToUpdate,
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
      message: "Data detail berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/admin/data-detail/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal memperbarui data detail";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const existing = await prisma.dataDetail.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data detail tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.dataDetail.delete({
      where: { id: Number(id) },
    });

    invalidateCacheTag("data-details");

    return NextResponse.json({
      success: true,
      message: "Data detail berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/admin/data-detail/[id] error:", error);
    const message = error instanceof Error ? error.message : "Gagal menghapus data detail";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

