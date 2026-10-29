import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCacheTag } from "@/lib/server-cache";

export async function POST(
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

    let requestBody: any = {};
    try {
      requestBody = await request.json();
    } catch {
      // Empty body is okay for query action
    }

    // Jika request menyertakan opsi 'save' beserta 'balance' atau 'balance_idr', langsung update database
    if (requestBody && requestBody.save && (requestBody.balance !== undefined || requestBody.balance_idr !== undefined)) {
      const newBalance = Number(requestBody.balance ?? requestBody.balance_idr);
      const updated = await prisma.apiProvider.update({
        where: { id: providerId },
        data: { balance: newBalance },
      });

      invalidateCacheTag("providers", "stats");

      return NextResponse.json({
        success: true,
        message: `Saldo provider "${provider.name}" berhasil disinkronkan ke database`,
        data: updated,
      });
    }

    // Melakukan request sinkronisasi saldo ke server API Provider sesuai DOC-API.md
    const formData = new FormData();
    formData.append("key", provider.api_key.trim());
    formData.append("action", "balance");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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
      // Jika multipart FormData gagal, coba fallback ke urlencoded
      try {
        const urlParams = new URLSearchParams();
        urlParams.append("key", provider.api_key.trim());
        urlParams.append("action", "balance");

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
            message: `Gagal menghubungi server provider (${provider.url}): ${fetchErr.message || fallbackErr.message}`,
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
          message: `Server provider merespon dengan format non-JSON (HTTP ${response.status}): ${responseText.substring(0, 150)}`,
        },
        { status: 502 }
      );
    }

    if (jsonResponse.error) {
      return NextResponse.json(
        {
          success: false,
          message: `Provider API Error: ${typeof jsonResponse.error === "string" ? jsonResponse.error : JSON.stringify(jsonResponse.error)}`,
        },
        { status: 400 }
      );
    }

    // Ambil data balance & currency sesuai DOC-API.md
    const rawBalance =
      jsonResponse.balance !== undefined
        ? jsonResponse.balance
        : jsonResponse.data?.balance !== undefined
        ? jsonResponse.data.balance
        : null;

    if (rawBalance === null) {
      return NextResponse.json(
        {
          success: false,
          message: `Field 'balance' tidak ditemukan dalam respon provider API`,
          raw: jsonResponse,
        },
        { status: 422 }
      );
    }

    const currency = (
      jsonResponse.currency ||
      jsonResponse.data?.currency ||
      "USD"
    ).toUpperCase();

    return NextResponse.json({
      success: true,
      message: `Berhasil mendapatkan data saldo dari provider ${provider.name}`,
      data: {
        provider_id: provider.id,
        provider_name: provider.name,
        current_db_balance: Number(provider.balance),
        balance: String(rawBalance),
        currency: currency,
        raw: jsonResponse,
      },
    });
  } catch (error: any) {
    console.error("POST /api/admin/provider/[id]/sync-balance error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan internal",
      },
      { status: 500 }
    );
  }
}
