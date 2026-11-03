import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://sociolizy.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/page/", "/auth/"],
        disallow: ["/admin/", "/member/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

