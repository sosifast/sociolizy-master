import { prisma } from "@/lib/prisma";
import { getCachedData } from "@/lib/server-cache";

export interface SiteSetting {
  id: number;
  site_name: string;
  favicon: string | null;
  logo: string | null;
  api_app: string | null;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  telegram: string | null;
  url_image_kit: string | null;
}

export const DEFAULT_SETTING: SiteSetting = {
  id: 1,
  site_name: "Sociolizy",
  favicon: "/logo/favicon.png",
  logo: "/logo/logo.png",
  api_app: null,
  email: "support@sociolizy.com",
  whatsapp: "+628123456789",
  instagram: "sociolizy.official",
  facebook: "sociolizy",
  tiktok: "sociolizy",
  telegram: "sociolizy_support",
  url_image_kit: null,
};

/**
 * Fetches the site configuration record from Prisma Setting table.
 * Cached in memory for high performance.
 */
export async function getSiteSetting(): Promise<SiteSetting> {
  try {
    return await getCachedData(
      "app:site_setting",
      async () => {
        const setting = await prisma.setting.findFirst({
          orderBy: { id: "asc" },
        });

        if (!setting) {
          return DEFAULT_SETTING;
        }

        return {
          id: setting.id,
          site_name: setting.site_name || DEFAULT_SETTING.site_name,
          favicon: setting.favicon || DEFAULT_SETTING.favicon,
          logo: setting.logo || DEFAULT_SETTING.logo,
          api_app: setting.api_app || null,
          email: setting.email || DEFAULT_SETTING.email,
          whatsapp: setting.whatsapp || DEFAULT_SETTING.whatsapp,
          instagram: setting.instagram || DEFAULT_SETTING.instagram,
          facebook: setting.facebook || DEFAULT_SETTING.facebook,
          tiktok: setting.tiktok || DEFAULT_SETTING.tiktok,
          telegram: setting.telegram || DEFAULT_SETTING.telegram,
          url_image_kit: setting.url_image_kit || null,
        };
      },
      { ttlSeconds: 120, tags: ["settings"] }
    );
  } catch (error) {
    console.error("Error fetching site setting:", error);
    return DEFAULT_SETTING;
  }
}

