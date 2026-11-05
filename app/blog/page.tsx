import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import {
  ChevronRight,
  Clock,
  ArrowRight,
  ChevronLeft,
  FileQuestion,
  Home,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import { prisma } from "@/lib/prisma";
import { formatBlogDate, getCategoryBadgeClass } from "@/lib/blog-utils";
import BlogFilterBar from "./components/blog-filter-bar";

export const metadata: Metadata = {
  title: "Blog Articles & Guides | Sociolizy",
  description:
    "Explore the latest articles, growth guides, and social media tips from the Sociolizy team.",
  keywords: [
    "smm blog",
    "smm panel guide",
    "instagram tips",
    "tiktok algorithm",
    "smm reseller business",
    "sociolizy blog",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Blog Articles & Guides | Sociolizy",
    description:
      "Explore the latest articles, growth guides, and social media tips from the Sociolizy team.",
    url: "https://sociolizy.com/blog",
    siteName: "Sociolizy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sociolizy Blog",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog Articles & Guides | Sociolizy",
    description: "Explore the latest articles, growth guides, and social media tips.",
    images: ["/og-image.jpg"],
  },
};

export const instant = false;

interface BlogPageProps {
  searchParams?: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BlogIndexPage(props: BlogPageProps) {
  await connection();
  const searchParams = (await props.searchParams) || {};
  const currentCategory = searchParams.category || "";
  const currentSearch = searchParams.search || "";
  const currentPage = Math.max(1, parseInt(searchParams.page || "1"));
  const limit = 16; // 4x4 Grid
  const skip = (currentPage - 1) * limit;

  // Build where conditions
  const where: any = {
    status: "PUBLISHED",
  };

  if (currentCategory && currentCategory !== "all") {
    where.category = {
      slug: currentCategory,
    };
  }

  if (currentSearch.trim()) {
    where.OR = [
      { title: { contains: currentSearch.trim(), mode: "insensitive" } },
      { excerpt: { contains: currentSearch.trim(), mode: "insensitive" } },
      { tags: { contains: currentSearch.trim(), mode: "insensitive" } },
    ];
  }

  // Fetch data
  const [categories, articles, totalArticles] = await Promise.all([
    prisma.blogCategory.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        _count: {
          select: {
            articles: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),

    prisma.blogArticle.findMany({
      where,
      select: {
        id: true,
        uuid: true,
        title: true,
        slug: true,
        excerpt: true,
        cover_image: true,
        author_name: true,
        reading_time: true,
        views: true,
        published_at: true,
        create_at: true,
        is_featured: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: [{ is_featured: "desc" }, { published_at: "desc" }],
      skip,
      take: limit,
    }),

    prisma.blogArticle.count({ where }),
  ]);

  const totalPages = Math.ceil(totalArticles / limit) || 1;

  // Helper to generate pagination links
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (currentCategory && currentCategory !== "all") {
      params.set("category", currentCategory);
    }
    if (currentSearch) {
      params.set("search", currentSearch);
    }
    if (pageNumber > 1) {
      params.set("page", String(pageNumber));
    }
    const str = params.toString();
    return str ? `/blog?${str}` : "/blog";
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between text-slate-800">
      <div>
        <Topbar />
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link
              href="/"
              className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-900 font-bold">Blog</span>
          </nav>

          {/* Clean Header & Compact Filters */}
          <div className="space-y-4 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Blog
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {currentSearch
                    ? `Search results for "${currentSearch}"`
                    : currentCategory && currentCategory !== "all"
                    ? `Category: ${
                        categories.find((c) => c.slug === currentCategory)?.name || currentCategory
                      }`
                    : `Showing ${articles.length} of ${totalArticles} articles`}
                </p>
              </div>
            </div>

            {/* Filter Bar */}
            <BlogFilterBar
              categories={categories}
              currentCategory={currentCategory}
              currentSearch={currentSearch}
            />
          </div>

          {/* Articles Grid (4x4) */}
          {articles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileQuestion className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                No Articles Found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No articles match your search or selected category filter.
              </p>
              <Link
                href="/blog"
                className="inline-block px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {articles.map((art) => (
                <article
                  key={art.id}
                  className="group bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <Link
                      href={`/blog/${art.slug}`}
                      className="block relative aspect-video overflow-hidden bg-slate-100"
                    >
                      <img
                        src={
                          art.cover_image ||
                          "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                        loading="lazy"
                      />
                    </Link>

                    {/* Article Content */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        {art.category ? (
                          <Link
                            href={`/blog?category=${art.category.slug}`}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getCategoryBadgeClass(
                              art.category.color
                            )} hover:opacity-90`}
                          >
                            {art.category.name}
                          </Link>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}

                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{art.reading_time || 3}m</span>
                        </div>
                      </div>

                      <Link href={`/blog/${art.slug}`} className="block">
                        <h2 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                          {art.title}
                        </h2>
                      </Link>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
                    <span className="font-medium text-[11px]">
                      {formatBlogDate(art.published_at || art.create_at)}
                    </span>

                    <Link
                      href={`/blog/${art.slug}`}
                      className="inline-flex items-center gap-1 font-bold text-emerald-600 group-hover:text-emerald-700 text-xs transition-colors"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {currentPage > 1 ? (
                <Link
                  href={createPageUrl(currentPage - 1)}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold text-xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Link>
              ) : (
                <span className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs flex items-center gap-1 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </span>
              )}

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => {
                  const isCurrent = p === currentPage;
                  return (
                    <Link
                      key={p}
                      href={createPageUrl(p)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>

              {currentPage < totalPages ? (
                <Link
                  href={createPageUrl(currentPage + 1)}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs font-semibold text-xs flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-xs flex items-center gap-1 cursor-not-allowed">
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
