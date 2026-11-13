import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getBaseUrl } from "@/lib/base-url";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const baseUrl = await getBaseUrl();

  const publicAllowedRoutes = [
    "/",
    "/llms.txt",
    "/llms-full.txt",
    "/services",
    "/blog",
    "/blog/*",
    "/page/show",
    "/documentasi",
    "/merchant/docs",
    "/about-us",
    "/contact-us",
    "/policy",
    "/privacy",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
  ];

  const restrictedRoutes = [
    "/admin/",
    "/member/",
    "/api/",
    "/auth/reset-password",
  ];

  const aiAgents = [
    "GPTBot",
    "ChatGPT-User",
    "PerplexityBot",
    "ClaudeBot",
    "anthropic-ai",
    "Google-Extended",
    "Applebot-Extended",
    "Meta-ExternalAgent",
    "cohere-ai",
    "Bytespider",
    "CCBot",
  ];

  const aiRules = aiAgents.map((agent) => ({
    userAgent: agent,
    allow: publicAllowedRoutes,
    disallow: restrictedRoutes,
  }));

  return {
    rules: [
      {
        userAgent: "*",
        allow: publicAllowedRoutes,
        disallow: restrictedRoutes,
      },
      ...aiRules,
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
