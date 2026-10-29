import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCachedData, invalidateCacheTag, getCacheHeaders } from "@/lib/server-cache";

export async function GET() {
  try {
    const setting = await getCachedData(
      "admin:setting",
      async () => {
        let rec = await prisma.setting.findFirst({
          orderBy: { id: "asc" },
        });

        // Jika belum ada record setting, buat default
        if (!rec) {
          rec = await prisma.setting.create({
            data: {
              site_name: "Master SMM",
              favicon: "/favicon.ico",
              logo: "/logo.png",
              api_app: "smm_app_key_master_live_2026",
            },
          });
        }
        return rec;
      },
      { ttlSeconds: 120, tags: ["settings"] }
    );

    return NextResponse.json(
      {
        success: true,
        data: setting,
      },
      { headers: getCacheHeaders(60, 120) }
    );
  } catch (error) {
    console.error("GET /api/admin/setting error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengambil pengaturan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      site_name,
      favicon,
      logo,
      api_app,
      email,
      whatsapp,
      instagram,
      facebook,
      tiktok,
      telegram,
      url_image_kit,
      imagekit_api,
      imagekit_secret,
    } = body;

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
          ...(email !== undefined && { email: email ? email.trim() : null }),
          ...(whatsapp !== undefined && { whatsapp: whatsapp ? whatsapp.trim() : null }),
          ...(instagram !== undefined && { instagram: instagram ? instagram.trim() : null }),
          ...(facebook !== undefined && { facebook: facebook ? facebook.trim() : null }),
          ...(tiktok !== undefined && { tiktok: tiktok ? tiktok.trim() : null }),
          ...(telegram !== undefined && { telegram: telegram ? telegram.trim() : null }),
          ...(url_image_kit !== undefined && { url_image_kit: url_image_kit ? url_image_kit.trim() : null }),
          ...(imagekit_api !== undefined && { imagekit_api: imagekit_api ? imagekit_api.trim() : null }),
          ...(imagekit_secret !== undefined && { imagekit_secret: imagekit_secret ? imagekit_secret.trim() : null }),
        },
      });
    } else {
      setting = await prisma.setting.create({
        data: {
          site_name: site_name ? site_name.trim() : "Master SMM",
          favicon: favicon || "/favicon.ico",
          logo: logo || "/logo.png",
          api_app: api_app ? api_app.trim() : "smm_app_key_master_live_2026",
          email: email ? email.trim() : null,
          whatsapp: whatsapp ? whatsapp.trim() : null,
          instagram: instagram ? instagram.trim() : null,
          facebook: facebook ? facebook.trim() : null,
          tiktok: tiktok ? tiktok.trim() : null,
          telegram: telegram ? telegram.trim() : null,
          url_image_kit: url_image_kit ? url_image_kit.trim() : null,
          imagekit_api: imagekit_api ? imagekit_api.trim() : null,
          imagekit_secret: imagekit_secret ? imagekit_secret.trim() : null,
        },
      });
    }

    invalidateCacheTag("settings");

    return NextResponse.json({
      success: true,
      message: "Pengaturan berhasil disimpan",
      data: setting,
    });
  } catch (error) {
    console.error("POST /api/admin/setting error:", error);
    const message = error instanceof Error ? error.message : "Gagal menyimpan pengaturan";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
