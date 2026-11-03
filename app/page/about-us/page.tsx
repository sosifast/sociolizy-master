import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import {
  Zap,
  ShieldCheck,
  Globe2,
  TrendingUp,
  Cpu,
  Clock,
  CheckCircle2,
  ArrowRight,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import { getSiteSetting } from "@/lib/setting";

export const metadata: Metadata = {
  title: {
    absolute: "High-Performance SMM Infrastructure | Sociolizy",
  },
  description:
    "Learn about Sociolizy, the leading automated SMM platform providing high-speed order fulfillment, wholesale rates, and enterprise-grade API connectivity.",
  alternates: {
    canonical: "https://sociolizy.com/page/about-us",
  },
  openGraph: {
    title: "About Us - High-Performance SMM Infrastructure | Sociolizy",
    description:
      "Learn about Sociolizy, the leading automated SMM platform providing high-speed order fulfillment, wholesale rates, and enterprise-grade API connectivity.",
    url: "https://sociolizy.com/page/about-us",
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
    title: "About Us - High-Performance SMM Infrastructure | Sociolizy",
    description:
      "Learn about Sociolizy, the leading automated SMM platform providing high-speed order fulfillment, wholesale rates, and enterprise-grade API connectivity.",
    images: ["/og-image.jpg"],
  },
};

export const instant = false;

export default async function AboutUsPage() {
  await connection();
  const setting = await getSiteSetting();
  const siteName = setting.site_name;

  const stats = [
    { label: "Orders Delivered", value: "10M+", subtext: "Automated fulfillment" },
    { label: "Platform Uptime", value: "99.98%", subtext: "SLA enterprise grade" },
    { label: "Average Dispatch", value: "< 2 Mins", subtext: "Real-time processing" },
    { label: "Global Coverage", value: "20+ Countries", subtext: "Resellers & agencies" },
  ];

  const pillars = [
    {
      icon: Cpu,
      title: "Direct API Infrastructure",
      desc: "Our high-throughput routing engine connects directly to tier-1 server clusters, eliminating middlemen and providing sub-second order dispatch.",
    },
    {
      icon: ShieldCheck,
      title: "Safety & Privacy First",
      desc: "We never request passwords or private account access. All deliveries use organic algorithms complying with standard web privacy and SSL encryption.",
    },
    {
      icon: TrendingUp,
      title: "Lowest Per-1,000 Rates",
      desc: "Transparent wholesale rates curated specifically for agencies, influencers, and reseller platforms maximizing their return on investment.",
    },
    {
      icon: Layers,
      title: "Auto-Refill & Drop Protection",
      desc: "Integrated refill triggers detect retention drops automatically and replenish orders within guarantee periods with a single click.",
    },
    {
      icon: Server,
      title: "Multi-Region Distributed Nodes",
      desc: "Edge architecture deployed across Singapore, US, and Europe ensures zero downtime, low latency, and continuous 24/7 operation.",
    },
    {
      icon: Clock,
      title: "24/7 Dedicated Support",
      desc: "Real humans backed by responsive ticketing, WhatsApp, and Telegram dispatch ready to resolve order inquiries at any hour.",
    },
  ];

  const milestones = [
    {
      step: "01",
      title: "Select Service & Tier",
      description: "Browse thousands of verified services across Instagram, TikTok, YouTube, Telegram, and more with clear pricing and limits.",
    },
    {
      step: "02",
      title: "Submit Public Link",
      description: "Simply provide your public username or post URL. No passwords, credentials, or sensitive permissions are ever requested.",
    },
    {
      step: "03",
      title: "Automated Dispatch",
      description: "Our distributed queue schedules and begins dispatch within minutes, backed by high-speed provider nodes.",
    },
    {
      step: "04",
      title: "Live Order Tracking",
      description: "Track progress live from your member dashboard with start counts, remaining balance, and automated refill triggers.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Topbar Announcement */}
      <Topbar />

      {/* Main Navigation Header */}
      <Navbar />

      {/* Hero Header */}
      <section className="relative z-10 border-b border-slate-100 bg-white py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>About {siteName}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Building the Next-Generation{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              Social Media Growth Engine
            </span>
          </h1>

          <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {siteName} is an enterprise-grade SMM automation platform engineered for digital agencies, resellers, content creators, and businesses seeking transparent pricing, reliable speeds, and direct API connectivity.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Explore Services Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/page/contact-us"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <span>Contact Support</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="relative z-10 py-12 border-b border-slate-100 bg-slate-50/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-center relative group hover:border-emerald-500/40 transition-colors"
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-emerald-600">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {stat.subtext}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative z-10 py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-emerald-50/40 border border-emerald-200/60 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Mission</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To democratize social media acceleration by providing reliable, real-time marketing services at wholesale prices. We bridge the gap between complex provider APIs and end users through intuitive dashboards, automated fulfillment, and 24/7 technical stability.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 mb-6 shadow-xs">
                <Globe2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Vision</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                To be the world’s most trusted social media services backbone. Whether you are an aspiring creator launching your brand or a high-volume agency fulfilling millions of orders monthly, {siteName} delivers the infrastructure you can rely on without fail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="relative z-10 py-16 bg-slate-50/70 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-600 mb-3">
              Why Partner With Us
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Speed, Reliability &amp; Scale
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              We continually optimize our architecture to guarantee rapid delivery, high retention, and zero order friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-600 mb-3">
              Simple &amp; Seamless Process
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Our Fulfillment Pipeline Operates
            </h3>
            <p className="mt-3 text-sm text-slate-600">
              From order submission to completed delivery in four straightforward steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs relative flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl font-black text-emerald-600/40 mb-3">
                    {item.step}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="relative z-10 py-16 bg-slate-50/70 border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                Developer &amp; Reseller Ready
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
                Integrate Our SMM API Into Your Web Application
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Connect your existing website, Telegram bot, or custom storefront directly with our JSON REST API. Automate order creation, check real-time balances, and monitor service statuses in milliseconds.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Standard SMM v2 JSON format</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sub-second response time</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Instant balance callbacks</span>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all text-center cursor-pointer"
              >
                Create Free Account
              </Link>
              <Link
                href="/services"
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all text-center cursor-pointer shadow-xs"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
