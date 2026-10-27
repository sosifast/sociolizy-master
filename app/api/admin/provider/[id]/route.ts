import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const provider = await prisma.apiProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json({ success: false, message: "Provider tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: provider });
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
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    const body = await request.json();
    const { name, slug, url, api_key, balance } = body;

    const updated = await prisma.apiProvider.update({
      where: { id: providerId },
      data: {
        ...(name && { name: name.trim() }),
        ...(slug && { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") }),
        ...(url !== undefined && { url: url.trim() }),
        ...(api_key && { api_key: api_key.trim() }),
        ...(balance !== undefined && { balance: Number(balance) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Provider berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memperbarui provider";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const providerId = parseInt(id);

    if (isNaN(providerId)) {
      return NextResponse.json({ success: false, message: "ID tidak valid" }, { status: 400 });
    }

    await prisma.apiProvider.delete({
      where: { id: providerId },
    });

    return NextResponse.json({
      success: true,
      message: "Provider berhasil dihapus",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus provider";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
