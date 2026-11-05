import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Zap,
  Sparkles,
  Wallet,
  Tag,
  BadgePercent,
  Headphones,
  RefreshCw,
  Server,
  CreditCard,
  UserPlus,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Clock,
  Star,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import gscConfig from "@/app/data/gsc.json";
import GoogleTag from "@/app/components/google-tag";

export const metadata: Metadata = {
  title: {
    absolute: "World's #1 Cheapest & Best SMM Services Provider | Sociolizy",
  },
  description:
    "Grow your social media presence with Sociolizy. The #1 cheapest automated SMM panel for Instagram, TikTok, YouTube, Telegram & Facebook with instant wholesale delivery.",
  alternates: {
    canonical: "https://www.sociolizy.com",
  },
  openGraph: {
    title: "World's #1 Cheapest & Best SMM Services Provider | Sociolizy",
    description:
      "Grow your social media presence with Sociolizy. The #1 cheapest automated SMM panel for Instagram, TikTok, YouTube, Telegram & Facebook with instant wholesale delivery.",
    url: "https://www.sociolizy.com",
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
    title: "World's #1 Cheapest & Best SMM Services Provider | Sociolizy",
    description:
      "Grow your social media presence with Sociolizy. The #1 cheapest automated SMM panel for Instagram, TikTok, YouTube, Telegram & Facebook with instant wholesale delivery.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: gscConfig.googleSiteVerification || gscConfig.content,
  },
};

export default function HomePage() {
  const verificationCode = gscConfig.googleSiteVerification || gscConfig.content;

  const platforms = [
    { name: "Instagram", color: "text-pink-600 bg-pink-50 border-pink-200" },
    { name: "TikTok", color: "text-slate-900 bg-slate-100 border-slate-300" },
    { name: "YouTube", color: "text-red-600 bg-red-50 border-red-200" },
    { name: "Facebook", color: "text-blue-600 bg-blue-50 border-blue-200" },
    { name: "Twitter / X", color: "text-sky-600 bg-sky-50 border-sky-200" },
    { name: "Telegram", color: "text-sky-600 bg-sky-50 border-sky-200" },
    { name: "Spotify", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  ];

  const statHighlights = [
    { value: "1.8M+", label: "Completed Orders", sublabel: "Automated 24/7 delivery" },
    { value: "$0.001", label: "Starting Price", sublabel: "Cheapest wholesale rates" },
    { value: "99.98%", label: "Uptime SLA", sublabel: "High-speed server cluster" },
    { value: "0.15s", label: "API Response", sublabel: "Zero-latency order dispatch" },
  ];

  const whyChooseUs = [
    {
      icon: Sparkles,
      title: "Great Quality",
      desc: "Every order is processed through verified high-retention servers to ensure satisfaction and lasting engagement.",
    },
    {
      icon: Wallet,
      title: "Multiple Payment Gateways",
      desc: "Enjoy seamless automated top-ups with instant balance credit via Cryptomus, Crypto, E-Wallets, and Bank Transfer.",
    },
    {
      icon: Tag,
      title: "Shockingly Low Rates",
      desc: "Direct wholesale provider connections allow us to deliver unbeatable rates starting as low as $0.001 per 1,000 units.",
    },
    {
      icon: BadgePercent,
      title: "Unbelievable Scale & Discounts",
      desc: "Volume pricing tiers specifically designed for agencies and resellers seeking to maximize profit margins effortlessly.",
    },
  ];

  const whatWeOffer = [
    {
      icon: TrendingUp,
      title: "Built For Resellers",
      desc: "Scale your agency effortlessly. Connect your own panel via our high-speed REST API and resell thousands of services.",
    },
    {
      icon: Headphones,
      title: "24/7 Dedicated Support",
      desc: "Round-the-clock technical operations team standing by via live ticket system and instant messaging channels.",
    },
    {
      icon: CheckCircle2,
      title: "High Quality Services",
      desc: "Automated algorithms monitor service stability and drop rates continuously to deliver the highest quality possible.",
    },
    {
      icon: RefreshCw,
      title: "Daily Catalog Updates",
      desc: "Our server lists are refreshed around the clock to ensure you always have access to active and working services.",
    },
    {
      icon: Server,
      title: "High Performance API",
      desc: "Standardized SmartPanel-compatible REST API endpoints with instant webhooks so you never need periodic cronjobs.",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      desc: "Enterprise-grade SSL 256-bit encryption protects all your deposits and confidential transactions at all times.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      icon: UserPlus,
      title: "Register & Log In",
      desc: "Create your free account in under 30 seconds with zero subscription fees or membership charges.",
    },
    {
      step: "02",
      icon: Wallet,
      title: "Add Funds",
      desc: "Select your preferred payment gateway and deposit funds with instant automatic balance activation.",
    },
    {
      step: "03",
      icon: ShoppingBag,
      title: "Select a Service",
      desc: "Browse through thousands of social media growth services, paste your public link, and enter your quantity.",
    },
    {
      step: "04",
      icon: Zap,
      title: "Watch Results Grow",
      desc: "Our automated dispatch cluster starts fulfilling your order immediately. Sit back and track progress live.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Tracking & Verification */}
      <GoogleTag />
      {verificationCode && (
        <meta name="google-site-verification" content={verificationCode} />
      )}

      {/* Navigation Bars */}
      <Topbar />
      <Navbar />

      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* HERO SECTION - Spacious, Bold & Well-Proportioned */}
        {/* ========================================================================= */}
        <section className="relative pt-20 pb-24 lg:pt-28 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          {/* Decorative Subtle Background Radial */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          {/* Announcement Tag */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs sm:text-sm font-bold uppercase tracking-wider mb-8 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>The #1 Social Media Growth Infrastructure</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-5xl mx-auto mb-8">
            The Best Social Media Panel{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500 bg-clip-text text-transparent">
              in The Market!
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            Manage all your social media campaigns from a single high-speed dashboard. Quality, instant delivery, and wholesale prices across Instagram, TikTok, YouTube, Facebook, Telegram, and more.
          </p>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/auth/register"
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-extrabold text-base text-white shadow-xl shadow-emerald-600/25 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/services"
              className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 font-bold text-base text-slate-700 hover:text-slate-900 shadow-xs hover:bg-slate-50 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Service Catalog</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Platform Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {platforms.map((p) => (
              <span
                key={p.name}
                className={`px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold shadow-2xs transition-transform hover:scale-105 ${p.color}`}
              >
                {p.name}
              </span>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* STATS HIGHLIGHTS BAR - Professional Scale */}
        {/* ========================================================================= */}
        <section className="border-y border-slate-200/80 bg-slate-50/80 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {statHighlights.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center flex flex-col justify-center items-center"
                >
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-mono tracking-tight mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base font-bold text-slate-800 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 font-normal">
                    {stat.sublabel}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHY CHOOSE US? - Big Proportional Cards */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-600 mb-3 block">
                WHY CHOOSE US?
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Dominate Social Media With High-Speed Infrastructure
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600">
                Designed from the ground up for individual marketers, fast-growing brands, and enterprise resellers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {whyChooseUs.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mb-6 shadow-2xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                        <Icon className="w-7 h-7" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHO WE ARE - Rich Center Section */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 border-t border-slate-200/70 bg-slate-50/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-600 mb-3 block">
              WHO WE ARE
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-6">
              Empowering Creators &amp; Brands Globally
            </h2>
            <div className="space-y-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              <p>
                Our server dispatch engine is active 24 hours a day, 7 days a week, 365 days a year to fulfill orders continuously with zero human delays.
              </p>
              <p>
                Whether you need a one-time boost for a single campaign or thousands of automated orders placed daily via our API, we provide the lowest rates and highest reliability in the market.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Instant Automatic Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Refill &amp; Drop Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Zero Password Required</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHAT WE OFFER! - Spacious 3-Column Grid */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 bg-white border-t border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-600 mb-3 block">
                WHAT WE OFFER!
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Everything You Need to Scale Social Media
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600">
                End-to-end tooling built to make digital marketing management straightforward, reliable, and profitable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {whatWeOffer.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mb-6 shadow-2xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS? - 4 Simple Steps */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 bg-slate-50/70 border-t border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-600 mb-3 block">
                HOW IT WORKS?
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Simple 4-Step Process to Get Started
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600">
                Follow these four easy steps to place and automate your orders in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {howItWorks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-emerald-300 transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <span className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-mono font-extrabold text-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
                          {item.step}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2.5">
                        {item.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PRIVACY & TRUST NOTICE - Prominent Card */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-24 bg-white border-t border-slate-200/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-12 lg:p-14 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-slate-50 border-2 border-emerald-300 text-center flex flex-col items-center shadow-lg shadow-emerald-600/5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-6 shadow-xs">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
                100% Privacy &amp; Data Security Guarantee
              </h3>
              <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mb-8">
                All order details and account parameters are kept strictly confidential. We never ask for passwords and will never share your order details with third parties.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/auth/register"
                  className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-extrabold text-sm text-white shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Create Free Account
                </Link>
                <Link
                  href="/documentasi"
                  className="px-8 py-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-bold text-sm text-slate-700 transition-all cursor-pointer"
                >
                  Read API Documentation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
