import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getBaseUrl } from "@/lib/base-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const baseUrl = await getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/services",
          "/blog",
          "/blog/*",
          "/page/show",
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
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
