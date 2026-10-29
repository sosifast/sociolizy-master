import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCacheTag } from "@/lib/server-cache";

function getWhereClause(identifier: string) {
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
      return NextResponse.json({ success: false, message: "Identifier tidak valid" }, { status: 400 });
    }

    const where = getWhereClause(id);
    const provider = await prisma.apiProvider.findUnique({
      where,
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
    if (!id) {
      return NextResponse.json({ success: false, message: "Identifier tidak valid" }, { status: 400 });
    }

    const where = getWhereClause(id);
    const body = await request.json();
    const { name, slug, url, api_key, balance } = body;

    const updated = await prisma.apiProvider.update({
      where,
      data: {
        ...(name && { name: name.trim() }),
        ...(slug && { slug: slug.trim().toLowerCase().replace(/\s+/g, "-") }),
        ...(url !== undefined && { url: url.trim() }),
        ...(api_key && { api_key: api_key.trim() }),
        ...(balance !== undefined && { balance: Number(balance) }),
      },
    });

    invalidateCacheTag("providers", "stats", "services");

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
    if (!id) {
      return NextResponse.json({ success: false, message: "Identifier tidak valid" }, { status: 400 });
    }

    const where = getWhereClause(id);
    await prisma.apiProvider.delete({
      where,
    });

    invalidateCacheTag("providers", "services", "stats");

    return NextResponse.json({
      success: true,
      message: "Provider berhasil dihapus",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghapus provider";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
