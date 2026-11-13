import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCacheTag } from "@/lib/server-cache";

// Helper to call Google Gemini API
async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const models = [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-pro-latest",
  ];

  let lastError = "";
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        lastError = json?.error?.message || `HTTP ${response.status} (${model})`;
        continue;
      }

      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && typeof text === "string" && text.trim()) {
        return text.trim();
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  throw new Error(`Gagal memanggil Gemini API: ${lastError}`);
}

// GET: Cek informasi statistik layanan yang deskripsinya kosong untuk kategori/data-detail
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataDetailId = searchParams.get("data_detail_id");
    const categoryId = searchParams.get("id_category");

    // Ambil setting API Key Gemini
    const setting = await prisma.setting.findFirst({
      orderBy: { id: "asc" },
      select: { gemini_api: true },
    });
    const hasApiKey = Boolean(setting?.gemini_api?.trim() || process.env.GEMINI_API_KEY?.trim());

    let targetCatId: number | null = null;
    let dataDetail = null;

    if (dataDetailId) {
      dataDetail = await prisma.dataDetail.findUnique({
        where: { id: Number(dataDetailId) },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
      if (dataDetail) {
        targetCatId = dataDetail.id_category;
      }
    } else if (categoryId) {
      targetCatId = Number(categoryId);
      dataDetail = await prisma.dataDetail.findFirst({
        where: { id_category: targetCatId },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      });
    }

    if (targetCatId) {
      const [totalServices, emptyDescServices] = await Promise.all([
        prisma.service.count({
          where: { id_category: targetCatId },
        }),
        prisma.service.count({
          where: {
            id_category: targetCatId,
            OR: [{ desc: null }, { desc: "" }],
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        hasApiKey,
        targetCatId,
        categoryName: dataDetail?.category?.name || "Kategori",
        conteks: dataDetail?.conteks || "",
        totalServices,
        emptyDescServices,
      });
    }

    // Global stats across all categories with DataDetail
    const allDataDetails = await prisma.dataDetail.findMany({
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });

    const totalEmpty = await prisma.service.count({
      where: {
        OR: [{ desc: null }, { desc: "" }],
      },
    });

    return NextResponse.json({
      success: true,
      hasApiKey,
      totalEmpty,
      availableCategories: allDataDetails.map((d) => ({
        dataDetailId: d.id,
        categoryId: d.id_category,
        categoryName: d.category.name,
        conteksPreview: d.conteks.substring(0, 100),
      })),
    });
  } catch (error) {
    console.error("GET /api/admin/data-detail/generate error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil statistik generate";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// POST: Jalankan generate deskripsi menggunakan Gemini
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      data_detail_id,
      id_category,
      overwrite = false,
      limit = 10,
      preview_only = false,
    } = body;

    // 1. Ambil Gemini API Key
    const setting = await prisma.setting.findFirst({
      orderBy: { id: "asc" },
      select: { gemini_api: true },
    });
    const apiKey = setting?.gemini_api?.trim() || process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "API Key Google Gemini belum diatur. Silakan atur Gemini API Key di menu Admin > Pengaturan Sistem.",
        },
        { status: 400 }
      );
    }

    // 2. Tentukan DataDetail acuan
    let dataDetail = null;
    if (data_detail_id) {
      dataDetail = await prisma.dataDetail.findUnique({
        where: { id: Number(data_detail_id) },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      });
    } else if (id_category) {
      dataDetail = await prisma.dataDetail.findFirst({
        where: { id_category: Number(id_category) },
        include: {
          category: {
            select: { id: true, name: true },
          },
        },
      });
    }

    if (!dataDetail) {
      return NextResponse.json(
        {
          success: false,
          message: "Data detail acuan konteks tidak ditemukan untuk kategori yang dipilih.",
        },
        { status: 404 }
      );
    }

    const templateConteks = dataDetail.conteks;
    const categoryName = dataDetail.category.name;

    // 3. Cari layanan yang akan di-generate
    const where: any = { id_category: dataDetail.id_category };
    if (!overwrite) {
      where.OR = [{ desc: null }, { desc: "" }];
    }

    const batchLimit = Math.max(1, Math.min(50, Number(limit) || 10));
    const services = await prisma.service.findMany({
      where,
      orderBy: { id: "asc" },
      take: preview_only ? 1 : batchLimit,
      select: {
        id: true,
        service_name: true,
        desc: true,
        min: true,
        max: true,
      },
    });

    if (services.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "Tidak ada layanan yang perlu diisi deskripsinya.",
        updatedServices: [],
      });
    }

    // 4. Proses generate tiap layanan dengan Gemini
    const results: Array<{
      id: number;
      service_name: string;
      desc: string;
    }> = [];
    const errors: string[] = [];

    for (const service of services) {
      const prompt = `You are a professional copywriter for an SMM (Social Media Marketing) reseller panel.
Your task is to write a single clean, informative, concise, and professional service description in ENGLISH for the following service:

- Service Title: "${service.service_name}"
- Service Category: "${categoryName}"
- Minimum Order: ${service.min}
- Maximum Order: ${service.max}
- Context & Reference Data:
"""
${templateConteks}
"""

Strict Instructions:
1. Write the entire description exclusively in ENGLISH.
2. Carefully inspect the service title "${service.service_name}" to identify specific details (such as refill / 30 days guarantee, instant or gradual speed, non-drop quality, required target URL / link format, and account requirements).
3. Blend and collaborate the context reference data with the service details. If the reference data contains "{title}", "{judul}", or "{TITLE}", replace it naturally with the relevant service title or feature.
4. STRICT PROHIBITION: Do NOT use markdown bold asterisks (NEVER use '**' or '*'). Do NOT use bold markdown syntax anywhere in the text. Use clean plain text headers and bullet points with '-' instead.
5. Provide ONLY the final service description text directly. Do NOT include conversational introductions (e.g. "Here is the description...", "Option 1:"), do NOT wrap in markdown code blocks, and do NOT include quotes at the start or end.`;

      try {
        const rawDesc = await callGemini(apiKey, prompt);
        // Ensure no ** or * markdown bold appears in the output
        const cleanDesc = rawDesc.replace(/\*\*/g, "").replace(/\*/g, "-").trim();

        // Save to database if not preview
        if (!preview_only) {
          await prisma.service.update({
            where: { id: service.id },
            data: { desc: cleanDesc },
          });
        }

        results.push({
          id: service.id,
          service_name: service.service_name,
          desc: cleanDesc,
        });
      } catch (genError) {
        const errMsg = genError instanceof Error ? genError.message : String(genError);
        console.error(`Error generating for service #${service.id}:`, errMsg);
        errors.push(errMsg);
      }
    }

    if (results.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Gagal men-generate deskripsi: ${errors[0]}`,
        },
        { status: 500 }
      );
    }

    if (!preview_only) {
      invalidateCacheTag("services");
    }

    return NextResponse.json({
      success: true,
      preview_only,
      count: results.length,
      message: preview_only
        ? "Pratinjau deskripsi AI berhasil dibuat"
        : `Berhasil men-generate deskripsi untuk ${results.length} layanan`,
      updatedServices: results,
    });
  } catch (error) {
    console.error("POST /api/admin/data-detail/generate error:", error);
    const message = error instanceof Error ? error.message : "Gagal memproses generate deskripsi";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

