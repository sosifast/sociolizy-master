import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = await getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/services",
          "/documentasi",
          "/about-us",
          "/contact-us",
          "/policy",
          "/privacy",
          "/auth/login",
          "/auth/register",
          "/auth/forgot-password",
        ],
        disallow: [
          "/admin/",
          "/member/",
          "/api/",
          "/auth/reset-password",
          "/page/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
