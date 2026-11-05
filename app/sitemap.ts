import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { getBaseUrl } from "@/lib/base-url";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Opt into dynamic runtime so /sitemap.xml generates on-demand with live domain & database records
  await connection();

  const baseUrl = await getBaseUrl();
  const now = new Date();

  // 1. Fetch published Blog Articles (Auto-detected from DB)
  let blogArticleUrls: MetadataRoute.Sitemap = [];
  try {
    const articles = await prisma.blogArticle.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        update_at: true,
        published_at: true,
        create_at: true,
      },
      orderBy: { published_at: "desc" },
    });

    blogArticleUrls = articles.map((art) => ({
      url: `${baseUrl}/blog/${art.slug}`,
      lastModified: art.update_at || art.published_at || art.create_at || now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));
  } catch (err) {
    console.error("[Sitemap] Error fetching blog articles:", err);
  }

  // 2. Fetch Blog Categories
  let blogCategoryUrls: MetadataRoute.Sitemap = [];
  try {
    const categories = await prisma.blogCategory.findMany({
      select: {
        slug: true,
        update_at: true,
      },
    });

    blogCategoryUrls = categories.map((cat) => ({
      url: `${baseUrl}/blog?category=${encodeURIComponent(cat.slug)}`,
      lastModified: cat.update_at || now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (err) {
    console.error("[Sitemap] Error fetching blog categories:", err);
  }

  // 3. Fetch published Custom Pages created via Page Builder (Auto-detected from DB)
  let customPageUrls: MetadataRoute.Sitemap = [];
  try {
    const customPages = await prisma.customPage.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        update_at: true,
        create_at: true,
      },
      orderBy: { update_at: "desc" },
    });

    customPageUrls = customPages.map((page) => ({
      url: `${baseUrl}/${page.slug}`,
      lastModified: page.update_at || page.create_at || now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.error("[Sitemap] Error fetching custom pages:", err);
  }

  // 4. Core Public & Navigation Pages
  const staticUrls: MetadataRoute.Sitemap = [
    // Beranda / Homepage
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },

    // Layanan & Katalog
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },

    // Blog Hub
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },

    // Custom Page Directory (Page Show Index)
    {
      url: `${baseUrl}/page/show`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },

    // Panduan & Dokumentasi
    {
      url: `${baseUrl}/documentasi`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },

    // Informasi Perusahaan & Legalitas
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

    // Autentikasi Publik
    {
      url: `${baseUrl}/auth/login`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/forgot-password`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  return [
    ...staticUrls,
    ...blogArticleUrls,
    ...blogCategoryUrls,
    ...customPageUrls,
  ];
}
