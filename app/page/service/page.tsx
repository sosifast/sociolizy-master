import React from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import { prisma } from "@/lib/prisma";
import ServiceListView, { PublicServiceItem } from "./service-list-view";

export const metadata: Metadata = {
  title: {
    absolute: "SMM Services List & Real-Time Wholesale Pricing | Sociolizy",
  },
  description:
    "Explore 1,000+ automated SMM services for Instagram, TikTok, YouTube, Telegram & Facebook. Compare lowest rates per 1,000, speed, and refill guarantees.",
  alternates: {
    canonical: "https://sociolizy.com/page/service",
  },
  openGraph: {
    title: "SMM Services List & Real-Time Wholesale Pricing | Sociolizy",
    description:
      "Explore 1,000+ automated SMM services for Instagram, TikTok, YouTube, Telegram & Facebook. Compare lowest rates per 1,000, speed, and refill guarantees.",
    url: "https://sociolizy.com/page/service",
    siteName: "Sociolizy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sociolizy - Your Ultimate SMM Partner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SMM Services List & Real-Time Wholesale Pricing | Sociolizy",
    description:
      "Explore 1,000+ automated SMM services for Instagram, TikTok, YouTube, Telegram & Facebook.",
    images: ["/og-image.jpg"],
  },
};

export const instant = false;

async function getServices(): Promise<PublicServiceItem[]> {
  try {
    const rows = await prisma.service.findMany({
      select: {
        id: true,
        uuid: true,
        service_id: true,
        service_name: true,
        slug: true,
        min: true,
        max: true,
        desc: true,
        rate_sale: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            platform: {
              select: {
                id: true,
                name: true,
                slug: true,
                icon: true,
              },
            },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    return rows.map((s) => ({
      ...s,
      rate_sale: Number(s.rate_sale || 0),
    }));
  } catch (error) {
    console.error("Error fetching services for public page:", error);
    return [];
  }
}

export default async function ServicesPage() {
  await connection();
  const services = await getServices();

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Security & Updates Bar */}
      <Topbar />

      {/* Main Navbar */}
      <Navbar />

      {/* Hero Header */}
      <section className="relative z-10 border-b border-slate-200 bg-slate-50/70 py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real-time Wholesale Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            SMM Services List &amp; Pricing
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Browse our full catalog of high-speed social media growth services. Filter by platform or category to find the exact service ID and rate for your campaigns or API integration.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ServiceListView initialServices={services} />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
