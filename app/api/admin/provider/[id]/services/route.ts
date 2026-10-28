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
      return NextResponse.json(
        { success: false, message: "ID Provider tidak valid" },
        { status: 400 }
      );
    }

    const provider = await prisma.apiProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      return NextResponse.json(
        { success: false, message: "Provider tidak ditemukan di database" },
        { status: 404 }
      );
    }

    if (!provider.url || !provider.api_key) {
      return NextResponse.json(
        {
          success: false,
          message: "Provider belum memiliki URL Endpoint atau API Key yang valid",
        },
        { status: 400 }
      );
    }

    // Melakukan request daftar layanan ke server API Provider sesuai DOC-API.md
    const formData = new FormData();
    formData.append("key", provider.api_key.trim());
    formData.append("action", "services");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let response: Response;
    try {
      response = await fetch(provider.url.trim(), {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          "User-Agent": "Master-SMM-Engine/1.0",
        },
      });
    } catch (fetchErr: any) {
      clearTimeout(timeoutId);
      // Fallback ke urlencoded jika multipart gagal
      try {
        const urlParams = new URLSearchParams();
        urlParams.append("key", provider.api_key.trim());
        urlParams.append("action", "services");

        response = await fetch(provider.url.trim(), {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Master-SMM-Engine/1.0",
          },
          body: urlParams.toString(),
        });
      } catch (fallbackErr: any) {
        return NextResponse.json(
          {
            success: false,
            message: `Gagal menghubungi server provider (${provider.url}): ${fetchErr?.message || fallbackErr?.message || "Koneksi terputus"}`,
          },
          { status: 504 }
        );
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const responseText = await response.text();
    let jsonResponse: any;

    try {
      jsonResponse = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: `Server provider merespon dengan format non-JSON (HTTP ${response.status}): ${responseText.substring(0, 200)}`,
        },
        { status: 502 }
      );
    }

    if (!Array.isArray(jsonResponse)) {
      if (jsonResponse.error) {
        return NextResponse.json(
          {
            success: false,
            message: `Provider API Error: ${typeof jsonResponse.error === "string" ? jsonResponse.error : JSON.stringify(jsonResponse.error)}`,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "Format respon provider tidak sesuai: diharapkan array layanan.",
          raw: jsonResponse,
        },
        { status: 422 }
      );
    }

    // Ambil daftar service_id yang sudah ada di database lokal
    const existingServices = await prisma.service.findMany({
      select: { service_id: true },
    });
    const existingServiceIds = existingServices.map((s) => String(s.service_id));

    // Normalisasi struktur layanan
    const formattedServices = jsonResponse.map((item: any) => ({
      service_id: String(item.service ?? item.service_id ?? item.id ?? ""),
      service_name: String(item.name ?? item.service_name ?? "Tanpa Nama"),
      category: String(item.category ?? "Umum"),
      rate: String(item.rate ?? "0"),
      min: Number(item.min ?? 0),
      max: Number(item.max ?? 0),
      type: String(item.type ?? "default"),
      desc: item.desc ? String(item.desc) : "",
      dripfeed: item.dripfeed ?? false,
      refill: item.refill ?? false,
      cancel: item.cancel ?? false,
    }));

    return NextResponse.json({
      success: true,
      provider: {
        id: provider.id,
        name: provider.name,
        slug: provider.slug,
        balance: Number(provider.balance),
      },
      count: formattedServices.length,
      data: formattedServices,
      existing_service_ids: existingServiceIds,
    });
  } catch (error: any) {
    console.error("GET /api/admin/provider/[id]/services error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan server internal",
      },
      { status: 500 }
    );
  }
}
