import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connection } from "next/server";
import {
  Clock,
  Eye,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Tag,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import { prisma } from "@/lib/prisma";
import { formatBlogDate, getCategoryBadgeClass } from "@/lib/blog-utils";
import MarkdownView from "../components/markdown-view";
import ShareButtons from "../components/share-buttons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;

  const article = await prisma.blogArticle.findUnique({
    where: { slug },
    select: {
      title: true,
      excerpt: true,
      meta_title: true,
      meta_description: true,
      cover_image: true,
      tags: true,
      published_at: true,
      update_at: true,
      author_name: true,
    },
  });

  if (!article) {
    return {
      title: "Article Not Found | Sociolizy",
    };
  }

  const title = article.meta_title || `${article.title} | Sociolizy Blog`;
  const description = article.meta_description || article.excerpt || "";
  const ogImage =
    article.cover_image ||
    "https://sociolizy.com/og-image.jpg";

  return {
    title,
    description,
    keywords: article.tags ? article.tags.split(",").map((t) => t.trim()) : undefined,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://sociolizy.com/blog/${slug}`,
      siteName: "Sociolizy",
      type: "article",
      publishedTime: article.published_at?.toISOString(),
      modifiedTime: article.update_at?.toISOString(),
      authors: [article.author_name || "Sociolizy Editorial Team"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const instant = false;

export default async function BlogDetailPage(props: PageProps) {
  await connection();
  const { slug } = await props.params;

  const article = await prisma.blogArticle.findUnique({
    where: { slug },
    include: {
      category: true,
      author: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Increment views count asynchronously in background
  prisma.blogArticle
    .update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.error("Error incrementing views:", err));

  // Fetch related articles (same category or latest)
  const relatedArticles = await prisma.blogArticle.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: article.id },
      ...(article.category_id ? { category_id: article.category_id } : {}),
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      cover_image: true,
      reading_time: true,
      published_at: true,
      category: {
        select: {
          name: true,
          slug: true,
          color: true,
        },
      },
    },
    take: 3,
    orderBy: { published_at: "desc" },
  });

  const articleUrl = `https://sociolizy.com/blog/${article.slug}`;

  // Structured Data Schema.org (JSON-LD) for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt || article.meta_description,
    image: article.cover_image ? [article.cover_image] : undefined,
    datePublished: article.published_at?.toISOString(),
    dateModified: article.update_at?.toISOString(),
    author: {
      "@type": "Organization",
      name: article.author_name || "Sociolizy Editorial Team",
      url: "https://sociolizy.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Sociolizy",
      logo: {
        "@type": "ImageObject",
        url: "https://sociolizy.com/logo/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-between text-slate-800">
      {/* Insert JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Topbar />
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto pb-1">
            <Link href="/" className="hover:text-emerald-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <Link href="/blog" className="hover:text-emerald-600 transition-colors">
              Blog
            </Link>
            {article.category && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <Link
                  href={`/blog?category=${article.category.slug}`}
                  className="hover:text-emerald-600 transition-colors font-medium"
                >
                  {article.category.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">
              {article.title}
            </span>
          </nav>

          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {article.category && (
                <Link
                  href={`/blog?category=${article.category.slug}`}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${getCategoryBadgeClass(
                    article.category.color
                  )} hover:opacity-90`}
                >
                  {article.category.name}
                </Link>
              )}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.reading_time || 3} min read</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.views + 1} views</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                {article.excerpt}
              </p>
            )}

            {/* Author & Share Bar */}
            <div className="pt-4 border-t border-b border-slate-200/80 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-inner">
                  SZ
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">
                    {article.author_name || "Sociolizy Editorial Team"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Published on {formatBlogDate(article.published_at)}
                  </p>
                </div>
              </div>

              {/* Share Buttons */}
              <ShareButtons title={article.title} url={articleUrl} />
            </div>
          </header>

          {/* Featured Cover Image */}
          {article.cover_image && (
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-slate-200/90 bg-slate-100">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Main Body (Markdown) */}
          <article className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
            <MarkdownView content={article.content} />

            {/* Article Tags */}
            {article.tags && (
              <div className="mt-10 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mr-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Related Topics:</span>
                </span>
                {article.tags.split(",").map((t, idx) => {
                  const cleanTag = t.trim();
                  return (
                    <Link
                      key={idx}
                      href={`/blog?search=${encodeURIComponent(cleanTag)}`}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-xs font-semibold transition-colors"
                    >
                      #{cleanTag}
                    </Link>
                  );
                })}
              </div>
            )}
          </article>

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <section className="space-y-5 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Related Articles
                </h3>
                <Link
                  href="/blog"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedArticles.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/blog/${rel.slug}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {rel.cover_image && (
                        <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-slate-100">
                          <img
                            src={rel.cover_image}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      {rel.category && (
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-2 ${getCategoryBadgeClass(
                            rel.category.color
                          )}`}
                        >
                          {rel.category.name}
                        </span>
                      )}
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{formatBlogDate(rel.published_at)}</span>
                      <span>{rel.reading_time || 3} min</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to Blog Hub Button */}
          <div className="text-center pt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog Hub</span>
            </Link>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
