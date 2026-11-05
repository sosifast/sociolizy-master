import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ChevronRight, Home, ArrowLeft } from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import { prisma } from "@/lib/prisma";
import PageBlockRenderer from "../../components/page-block-renderer";
import { PageBlock, PageStyles } from "@/lib/page-builder-types";

// Reserved root paths to avoid intercepting system routes
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "auth",
  "blog",
  "member",
  "services",
  "service",
  "about",
  "about-us",
  "contact",
  "contact-us",
  "privacy",
  "policy",
  "terms",
  "doc",
  "docs",
  "documentasi",
  "dokumentasi",
  "documentation",
  "page",
  "show",
  "login",
  "register",
  "logout",
  "sitemap",
  "robots",
  "favicon",
  "icon",
  "opengraph-image",
  "twitter-image",
]);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const instant = false;

// Dynamic SEO Metadata for Search Engines & Social Share
export async function generateCustomPageMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;

  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return {
      title: "Page Not Found | Sociolizy",
    };
  }

  const page = await prisma.customPage.findUnique({
    where: { slug },
  });

  if (!page || page.status !== "PUBLISHED") {
    return {
      title: "Page Not Found | Sociolizy",
    };
  }

  const title = page.meta_title || `${page.title} | Sociolizy`;
  const description =
    page.meta_description ||
    page.description ||
    "Explore customized pages, promotions, and services on Sociolizy.";
  const canonicalUrl = `https://sociolizy.com/${page.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Sociolizy",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function CustomPageView(props: PageProps) {
  await connection();
  const { slug } = await props.params;

  // Protect reserved system paths
  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    notFound();
  }

  const page = await prisma.customPage.findUnique({
    where: { slug },
  });

  // Only allow published pages for public view
  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  // Increment view counter asynchronously
  prisma.customPage
    .update({
      where: { id: page.id },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.error("View increment error:", err));

  const blocks = (page.blocks as unknown as PageBlock[]) || [];
  const styles = (page.styles as unknown as PageStyles) || {};
  const containerWidth = styles.containerWidth || "max-w-7xl";
  const showNavbar = styles.showNavbar !== false;
  const showFooter = styles.showFooter !== false;

  return (
    <div className={`min-h-screen flex flex-col justify-between ${styles.bgColor || "bg-slate-50/50"} text-slate-800`}>
      <div>
        {showNavbar && (
          <>
            <Topbar />
            <Navbar />
          </>
        )}

        <main className={`${containerWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8`}>
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
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {page.title}
            </span>
          </nav>

          {/* Blocks Render Stack */}
          {blocks.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-3">
              <h2 className="text-lg font-bold text-slate-800">This page has no content yet</h2>
              <p className="text-xs text-slate-500">The administrator hasn't added any blocks to this page.</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-10 sm:space-y-14">
              {blocks.map((block) => (
                <PageBlockRenderer key={block.id} block={block} />
              ))}
            </div>
          )}
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}

