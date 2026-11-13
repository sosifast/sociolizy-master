import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCacheTag } from "@/lib/server-cache";

// Helper to call Google Gemini API with fallback models
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

function cleanDescription(raw: string): string {
  return raw
    .replace(/\*\*/g, "")
    .replace(/\*/g, "-")
    .replace(/^["']|["']$/g, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      service_id,
      service_name,
      id_category,
      category_name,
      idea,
      min,
      max,
      save_to_db = false,
      ids, // array for bulk generation from datatable
    } = body;

    // 1. Get Gemini API key from Settings
    const setting = await prisma.setting.findFirst({
      select: { gemini_api: true },
    });

    if (!setting?.gemini_api || !setting.gemini_api.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Gemini API Key belum diatur di Pengaturan. Silakan tambahkan API key di Pengaturan > API Gemini.",
        },
        { status: 400 }
      );
    }

    const apiKey = setting.gemini_api.trim();

    // 2. Handle Bulk Generation from Datatable (if ids array is provided)
    if (Array.isArray(ids) && ids.length > 0) {
      const numericIds = ids.map((id) => Number(id)).filter((id) => !isNaN(id));
      if (numericIds.length === 0) {
        return NextResponse.json(
          { success: false, message: "ID layanan tidak valid" },
          { status: 400 }
        );
      }

      const services = await prisma.service.findMany({
        where: { id: { in: numericIds } },
        include: {
          category: {
            select: { name: true, id: true },
          },
        },
      });

      if (services.length === 0) {
        return NextResponse.json(
          { success: false, message: "Layanan tidak ditemukan" },
          { status: 404 }
        );
      }

      // Pre-fetch data_detail context per category
      const categoryIds = Array.from(new Set(services.map((s) => s.id_category).filter(Boolean)));
      const dataDetails = await prisma.dataDetail.findMany({
        where: { id_category: { in: categoryIds } },
      });
      const dataDetailMap = new Map<number, string>();
      dataDetails.forEach((dd) => {
        if (!dataDetailMap.has(dd.id_category)) {
          dataDetailMap.set(dd.id_category, dd.conteks);
        }
      });

      const updatedResults: Array<{ id: number; service_name: string; desc: string }> = [];
      const errors: string[] = [];

      for (const service of services) {
        const catName = service.category?.name || "General";
        const templateContext = service.id_category ? dataDetailMap.get(service.id_category) || "" : "";

        const prompt = `You are a professional copywriter for an SMM (Social Media Marketing) reseller panel.
Your task is to write a clean, concise, and professional service description in ENGLISH based on the service title:

- Service Title: "${service.service_name}"
- Category: "${catName}"
- Min Order: ${service.min}
- Max Order: ${service.max}
${templateContext ? `- Reference Context: """\n${templateContext}\n"""` : ""}

Strict Instructions:
1. Write the entire description exclusively in ENGLISH.
2. Analyze the service title "${service.service_name}" to highlight key service specifications (e.g. warranty / refill period, delivery speed, retention / drop guarantee, link format requirements, and profile status).
3. STRICT PROHIBITION: Do NOT use markdown bold asterisks (NEVER use '**' or '*'). Do NOT use bold markdown syntax anywhere. Use plain text labels and bullet points with '-' instead.
4. Keep the output clean, structured, and easy to read.
5. Provide ONLY the final service description text directly without conversational greetings or code fences.`;

        try {
          const raw = await callGemini(apiKey, prompt);
          const cleaned = cleanDescription(raw);

          await prisma.service.update({
            where: { id: service.id },
            data: { desc: cleaned },
          });

          updatedResults.push({
            id: service.id,
            service_name: service.service_name,
            desc: cleaned,
          });
        } catch (err: any) {
          errors.push(`Service #${service.id} (${service.service_name}): ${err?.message || err}`);
        }
      }

      invalidateCacheTag("services");

      return NextResponse.json({
        success: true,
        count: updatedResults.length,
        updated: updatedResults,
        errors: errors.length > 0 ? errors : undefined,
        message: `Berhasil menghasilkan deskripsi untuk ${updatedResults.length} layanan.`,
      });
    }

    // 3. Handle Single Generation (from Create, Edit, or single Datatable action)
    if (!service_name || !String(service_name).trim()) {
      return NextResponse.json(
        { success: false, message: "Nama layanan wajib diisi untuk referensi AI." },
        { status: 400 }
      );
    }

    const cleanTitle = String(service_name).trim();

    // Check category context or data detail
    let catName = category_name || "";
    let templateContext = "";

    if (id_category) {
      const category = await prisma.category.findUnique({
        where: { id: Number(id_category) },
        select: { name: true },
      });
      if (category?.name) catName = category.name;

      const dataDetail = await prisma.dataDetail.findFirst({
        where: { id_category: Number(id_category) },
        select: { conteks: true },
      });
      if (dataDetail?.conteks) {
        templateContext = dataDetail.conteks;
      }
    }

    const prompt = `You are a professional copywriter for an SMM (Social Media Marketing) reseller panel.
Your task is to write a single clean, informative, concise, and professional service description in ENGLISH for the following service:

- Service Title: "${cleanTitle}"
${catName ? `- Service Category: "${catName}"` : ""}
${min ? `- Minimum Order: ${min}` : ""}
${max ? `- Maximum Order: ${max}` : ""}
${idea && String(idea).trim() ? `- Creator Ideas / Custom Notes: "${String(idea).trim()}"` : ""}
${templateContext ? `- Context Reference Data: """\n${templateContext}\n"""` : ""}

Strict Instructions:
1. Write the entire description exclusively in ENGLISH.
2. Carefully inspect the service title "${cleanTitle}" to identify specific details (such as refill / guarantee, instant or normal start time, quality grade, target link format, and account privacy requirements).
3. If ideas or notes are provided above, integrate them accurately into the description.
4. STRICT PROHIBITION: Do NOT use markdown bold asterisks (NEVER use '**' or '*'). Do NOT use bold markdown syntax anywhere in the text. Use clean plain text headers and bullet points with '-' instead.
5. Provide ONLY the final service description text directly. Do NOT include conversational introductions (e.g. "Here is the description...", "Option 1:"), do NOT wrap in markdown code blocks, and do NOT include quotes at the start or end.`;

    const raw = await callGemini(apiKey, prompt);
    const cleaned = cleanDescription(raw);

    // If requested to save directly to DB (e.g. from datatable single action)
    if (save_to_db && service_id) {
      await prisma.service.update({
        where: { id: Number(service_id) },
        data: { desc: cleaned },
      });
      invalidateCacheTag("services");
    }

    return NextResponse.json({
      success: true,
      description: cleaned,
      service_id: service_id ? Number(service_id) : undefined,
      message: "Deskripsi berhasil dibuat dengan AI.",
    });
  } catch (error: any) {
    console.error("POST /api/admin/service/generate-desc error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Terjadi kesalahan saat menghasilkan deskripsi AI.",
      },
      { status: 500 }
    );
  }
}

