import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let setting = await prisma.setting.findFirst({
      orderBy: { id: "asc" },
    });

    // Jika belum ada record setting, buat default
    if (!setting) {
      setting = await prisma.setting.create({
        data: {
          site_name: "Master SMM",
          favicon: "/favicon.ico",
          logo: "/logo.png",
          api_app: "smm_app_key_master_live_2026",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("GET /api/admin/setting error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil pengaturan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { site_name, favicon, logo, api_app } = body;

    let setting = await prisma.setting.findFirst({
      orderBy: { id: "asc" },
    });

    if (setting) {
      setting = await prisma.setting.update({
        where: { id: setting.id },
        data: {
          ...(site_name && { site_name: site_name.trim() }),
          ...(favicon !== undefined && { favicon }),
          ...(logo !== undefined && { logo }),
          ...(api_app && { api_app: api_app.trim() }),
        },
      });
    } else {
      setting = await prisma.setting.create({
        data: {
          site_name: site_name ? site_name.trim() : "Master SMM",
          favicon: favicon || "/favicon.ico",
          logo: logo || "/logo.png",
          api_app: api_app ? api_app.trim() : "smm_app_key_master_live_2026",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan berhasil disimpan ke database",
      data: setting,
    });
  } catch (error) {
    console.error("POST /api/admin/setting error:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan pengaturan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
