import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, invalidateCacheTag, getCacheHeaders } from "@/lib/server-cache";

export async function GET() {
  try {
    const providers = await getCachedData(
      "admin:providers",
      async () => {
        return prisma.apiProvider.findMany({
          orderBy: { id: "desc" },
        });
      },
      { ttlSeconds: 60, tags: ["providers"] }
    );

    return NextResponse.json(
      {
        success: true,
        data: providers,
      },
      { headers: getCacheHeaders(30, 60) }
    );
  } catch (error) {
    console.error("GET /api/admin/provider error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil data provider";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, slug, url, api_key, balance } = body;

    if (!name || !api_key) {
      return NextResponse.json(
        { success: false, message: "Nama provider dan API Key wajib diisi" },
        { status: 400 }
      );
    }

    const cleanSlug = slug && slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, "-")
      : name.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    const existingSlug = await prisma.apiProvider.findUnique({
      where: { slug: cleanSlug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { success: false, message: `Provider dengan slug '${cleanSlug}' sudah ada` },
        { status: 409 }
      );
    }

    const newProvider = await prisma.apiProvider.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        url: (url || "").trim(),
        api_key: api_key.trim(),
        balance: Number(balance || 0),
      },
    });

    invalidateCacheTag("providers", "stats");

    return NextResponse.json({
      success: true,
      message: "API Provider berhasil didaftarkan",
      data: newProvider,
    });
  } catch (error) {
    console.error("POST /api/admin/provider error:", error);
    const message = error instanceof Error ? error.message : "Gagal menambahkan provider";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
