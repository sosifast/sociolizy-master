import React from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import { prisma } from "@/lib/prisma";
import ServiceListView, { PublicServiceItem } from "./service-list-view";

export const metadata: Metadata = {
  title: "SMM Services List & Pricing - Sociolizy",
  description:
    "Complete 24/7 automated SMM services catalog: Instagram, TikTok, YouTube, Facebook, Telegram with lowest rates per 1,000 and refill guarantees.",
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />
      <div className="fixed -bottom-40 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-500/10 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />

      {/* Top Security & Updates Bar */}
      <Topbar />

      {/* Main Navbar */}
      <Navbar currentBadge="Services" />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ServiceListView initialServices={services} />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

