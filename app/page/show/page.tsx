import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { connection } from "next/server";
import { ChevronRight, Home, Layout, ArrowRight, Eye, Sparkles } from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Featured Pages & Promotions | Sociolizy",
  description: "Browse customized landing pages, special deals, and guides on Sociolizy.",
};

export const instant = false;

interface PageProps {
  searchParams?: Promise<{ slug?: string }>;
}

export default async function PageShowIndex(props: PageProps) {
  await connection();
  const searchParams = (await props.searchParams) || {};
  const querySlug = searchParams.slug;

  // If slug is provided in query string, redirect directly to /[slug]
  if (querySlug) {
    redirect(`/${encodeURIComponent(querySlug)}`);
  }

  // Otherwise, list all published custom pages
  const pages = await prisma.customPage.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { update_at: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      views: true,
      update_at: true,
      create_at: true,
    },
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50/50 text-slate-800">
      <div>
        <Topbar />
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
            <span className="text-slate-900 font-bold">Featured Pages</span>
          </nav>

          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Custom Landing Pages</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Featured Pages &amp; Guides
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Explore special event promotions, VIP partnership offers, and curated service directories.
            </p>
          </div>

          {/* Pages Grid */}
          {pages.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Pages Available Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No custom pages are currently published. Check back soon for new promotions and features.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pages.map((p) => (
                <Link
                  key={p.id}
                  href={`/${p.slug}`}
                  className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-lg hover:border-emerald-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Layout className="w-5 h-5" />
                    </div>

                    <h2 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {p.title}
                    </h2>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {p.description || "Custom crafted landing page with exclusive offers and guides."}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{p.views} views</span>
                    </div>

                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

