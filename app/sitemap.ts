import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = await getBaseUrl();
  const now = new Date();

  // Fetch published blog articles
  let blogArticleUrls: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.blogArticle.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        update_at: true,
        published_at: true,
      },
    });

    blogArticleUrls = articles.map((art) => ({
      url: `${baseUrl}/blog/${art.slug}`,
      lastModified: art.update_at || art.published_at || now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Error fetching blog articles for sitemap:", err);
  }

  const staticUrls: MetadataRoute.Sitemap = [
    // 1. Beranda / Homepage
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },

    // 2. Halaman Publik Utama (Clean Public URLs)
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/documentasi`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/policy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },

    // 3. Halaman Autentikasi Pengguna
    {
      url: `${baseUrl}/auth/login`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/forgot-password`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...blogArticleUrls];
}
