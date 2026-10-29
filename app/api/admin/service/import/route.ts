import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCacheTag } from "@/lib/server-cache";

function slugify(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "layanan"
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider_id, services, update_existing = false } = body;

    let resolvedProviderId: number | null = null;
    if (provider_id) {
      const isNum = !isNaN(parseInt(String(provider_id))) && /^\d+$/.test(String(provider_id));
      if (isNum) {
        resolvedProviderId = parseInt(String(provider_id), 10);
      } else {
        const prov = await prisma.apiProvider.findUnique({
          where: { uuid: String(provider_id) },
          select: { id: true },
        });
        if (prov) resolvedProviderId = prov.id;
      }
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar layanan yang akan diimpor tidak boleh kosong" },
        { status: 400 }
      );
    }

    // 1. Validasi semua kategori yang digunakan
    const categoryIds = Array.from(
      new Set(services.map((s: any) => Number(s.id_category)).filter(Boolean))
    );

    if (categoryIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tujuan wajib ditentukan untuk layanan yang diimpor" },
        { status: 400 }
      );
    }

    const validCategories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const validCategorySet = new Set(validCategories.map((c) => c.id));

    // 2. Cek service_id yang sudah ada di database
    const incomingServiceIds = services.map((s: any) => String(s.service_id).trim());
    const existingServices = await prisma.service.findMany({
      where: { service_id: { in: incomingServiceIds } },
    });

    const existingServiceMap = new Map<string, (typeof existingServices)[0]>();
    for (const s of existingServices) {
      existingServiceMap.set(String(s.service_id), s);
    }

    // Ambil semua slug yang ada di DB untuk menghindari tabrakan
    const allDbSlugs = await prisma.service.findMany({
      select: { slug: true },
    });
    const usedSlugs = new Set<string>(allDbSlugs.map((s) => s.slug));

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const item of services) {
      const sId = String(item.service_id || "").trim();
      const sName = String(item.service_name || "").trim();
      const catId = Number(item.id_category);

      if (!sId || !sName) {
        errors.push(`Layanan tanpa ID atau nama dilewati`);
        skippedCount++;
        continue;
      }

      if (!validCategorySet.has(catId)) {
        errors.push(`Layanan "${sName}" (ID: ${sId}): Kategori ID ${catId} tidak ditemukan`);
        skippedCount++;
        continue;
      }

      const rateApi = Number(item.rate_api ?? 0);
      const rateSale = Number(item.rate_sale ?? 0);
      const min = Math.max(0, parseInt(String(item.min ?? 0), 10) || 0);
      const max = Math.max(0, parseInt(String(item.max ?? 0), 10) || 0);
      const desc = item.desc ? String(item.desc) : null;

      const existing = existingServiceMap.get(sId);

      if (existing) {
        if (update_existing) {
          try {
            await prisma.service.update({
              where: { id: existing.id },
              data: {
                service_name: sName,
                id_category: catId,
                id_api_provider: resolvedProviderId !== null ? resolvedProviderId : undefined,
                rate_api: rateApi,
                rate_sale: rateSale,
                min,
                max,
                desc: desc || existing.desc,
              },
            });
            updatedCount++;
          } catch (err: any) {
            errors.push(`Gagal memperbarui "${sName}" (ID: ${sId}): ${err.message}`);
          }
        } else {
          skippedCount++;
        }
      } else {
        // Buat slug unik
        let baseSlug = slugify(sName);
        let candidateSlug = baseSlug;
        let suffix = 1;

        while (usedSlugs.has(candidateSlug)) {
          candidateSlug = `${baseSlug}-${sId}${suffix > 1 ? `-${suffix}` : ""}`;
          suffix++;
        }
        usedSlugs.add(candidateSlug);

        try {
          await prisma.service.create({
            data: {
              service_id: sId,
              service_name: sName,
              slug: candidateSlug,
              id_category: catId,
              id_api_provider: resolvedProviderId,
              min,
              max,
              desc,
              rate_api: rateApi,
              rate_sale: rateSale,
            },
          });
          createdCount++;
        } catch (err: any) {
          errors.push(`Gagal menambahkan "${sName}" (ID: ${sId}): ${err.message}`);
        }
      }
    }

    const summaryMsg = `Proses impor selesai: ${createdCount} layanan baru ditambahkan${
      updatedCount > 0 ? `, ${updatedCount} diperbarui` : ""
    }${skippedCount > 0 ? `, ${skippedCount} dilewati (sudah ada)` : ""}.`;

    invalidateCacheTag("services", "categories", "platforms", "stats");

    return NextResponse.json({
      success: true,
      message: summaryMsg,
      data: {
        created_count: createdCount,
        updated_count: updatedCount,
        skipped_count: skippedCount,
        errors,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/service/import error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan server saat menyimpan layanan",
      },
      { status: 500 }
    );
  }
}
