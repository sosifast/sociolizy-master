"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Check,
  Server,
  Layers,
  Users,
  Wallet,
  Zap,
  Lock,
  DollarSign,
  Headphones,
  RefreshCw,
  Globe,
  Flame,
  UserPlus,
  CreditCard,
  ShoppingBag,
  Rocket,
  Shield,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";

export default function HomePageContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const platforms = [
    { name: "Instagram", color: "from-pink-500 to-purple-500", badge: "Followers & Likes" },
    { name: "Twitter / X", color: "from-slate-400 to-slate-200", badge: "Retweets & Views" },
    { name: "Facebook", color: "from-blue-600 to-indigo-600", badge: "Page Likes & Shares" },
    { name: "YouTube", color: "from-red-600 to-red-500", badge: "Views & Subscribers" },
    { name: "TikTok", color: "from-cyan-400 to-pink-500", badge: "Viral Views & Likes" },
    { name: "Spotify", color: "from-emerald-500 to-green-500", badge: "Plays & Followers" },
    { name: "Telegram", color: "from-sky-500 to-blue-500", badge: "Channel Members" },
    { name: "Discord", color: "from-indigo-500 to-violet-600", badge: "Server Members" },
  ];

  const whyChooseUsItems = [
    {
      icon: Sparkles,
      title: "Great quality",
      desc: "You'll be satisfied with SMM services we provide.",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      icon: Wallet,
      title: "Many payment methods",
      desc: "Enjoy a fantastic selection of payment methods that we offer.",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      icon: Flame,
      title: "Shocking prices",
      desc: "You will be satisfied with how cheap our services are.",
      accent: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
    {
      icon: DollarSign,
      title: "Unbelievable Prices",
      desc: "Our prices most reasonable in the market, starting from at $0.001.",
      accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
  ];

  const whatWeOfferItems = [
    {
      icon: Users,
      title: "Resellers",
      desc: "You can resell our services and grow your profit easily, Resellers are important part of SMM PANEL.",
      tag: "High Margin",
    },
    {
      icon: Headphones,
      title: "Supports",
      desc: "Technical support for all our services 24/7 to help you with every question and request.",
      tag: "24/7 Active",
    },
    {
      icon: ShieldCheck,
      title: "High quality services",
      desc: "Get the best high quality services and in less time here with instant automated processing.",
      tag: "Premium Quality",
    },
    {
      icon: RefreshCw,
      title: "Updates",
      desc: "Services are updated daily In order to be further improved and to provide you with best experience.",
      tag: "Daily Updates",
    },
    {
      icon: Server,
      title: "Api support",
      desc: "We have API Support For panel owners so you can resell our services easily and automatically.",
      tag: "Instant REST API",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      desc: "We have popular methods including cryptocurrency gateways, and many more can be enabled upon request.",
      tag: "100% Secure",
    },
  ];

  const howItWorksSteps = [
    {
      step: "1",
      icon: UserPlus,
      title: "Register & log in",
      desc: "Creating an account is the first step, then you need to log in to access your personal dashboard.",
    },
    {
      step: "2",
      icon: Wallet,
      title: "Add funds",
      desc: "Next, pick a payment method and add funds to your account balance quickly and securely.",
    },
    {
      step: "3",
      icon: ShoppingBag,
      title: "Select a service",
      desc: "Select the services you want, input your link or username, and get ready to receive more publicity.",
    },
    {
      step: "4",
      icon: Rocket,
      title: "Enjoy popularity",
      desc: "You can enjoy incredible results when your order is complete through our fast automated delivery.",
    },
  ];

  const faqs = [
    {
      q: "What makes this the best social media panel in the market?",
      a: "We allow you to manage all social media networks from a single panel with exceptional quality and the cheapest rates. Starting from at $0.001, our services are fully automated, reliable, and backed by 24/7 technical support.",
    },
    {
      q: "How does the automated order process work?",
      a: "Our panel uses a high-speed automated engine. Once you submit your order, it is dispatched instantly to the servers. You can monitor the progress, status, and remaining balance directly from your member dashboard in real-time.",
    },
    {
      q: "Can I resell your SMM services on my own website or panel?",
      a: "Yes! Resellers are an essential part of our SMM Panel. We provide comprehensive REST API support for panel owners and developers so you can connect your own platform and resell our services seamlessly with high profit margins.",
    },
    {
      q: "Is my personal account and payment information safe?",
      a: "100% safe. All user information is kept completely private and will NEVER be shared with anyone. We never ask for your personal social media passwords, and our payments are protected with advanced encryption.",
    },
    {
      q: "Is account registration free?",
      a: "Yes, registration is 100% free with no hidden charges. You only pay for the exact services you choose to order.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />
      <div className="fixed -bottom-40 -right-40 w-[650px] h-[650px] bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent blur-[150px] rounded-full pointer-events-none animate-glow" />

      {/* Topbar Announcement */}
      <Topbar />

      {/* Main Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative pt-14 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Headlines & Call to Action */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
                {/* Pill Badge directly from reference */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>The Best Social Media Panel in The Market!</span>
                </div>

                {/* Primary H1 */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] mb-6">
                  Manage All Social Media Networks{" "}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    From a Single Panel
                  </span>
                </h1>

                {/* Reference text */}
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
                  Manage all social media networks from a single panel, quality and cheap. We provide services on today&apos;s most popular social networks. We have <strong className="text-white font-semibold">Instagram, Twitter, Facebook, Youtube, TikTok, Spotify</strong> and many more services.
                </p>

                {/* Pricing Highlight Pill */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mb-8">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Unbelievable Prices: Starting from at <strong className="text-emerald-400 font-mono font-bold">$0.001</strong></span>
                  <span className="text-slate-600">•</span>
                  <span className="text-indigo-300 font-medium">100% Automated</span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
                  <Link
                    href="/auth/register"
                    className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/auth/login"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                  >
                    <span>Sign In to Dashboard</span>
                  </Link>
                </div>

                {/* Trust Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-800/80 w-full">
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-emerald-400 font-mono">$0.001</div>
                    <div className="text-xs text-slate-400 mt-0.5">Starting Price</div>
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-indigo-400 font-mono">24/7</div>
                    <div className="text-xs text-slate-400 mt-0.5">Active Support</div>
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-cyan-400 font-mono">100%</div>
                    <div className="text-xs text-slate-400 mt-0.5">Automated Orders</div>
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono">100%</div>
                    <div className="text-xs text-slate-400 mt-0.5">Private &amp; Safe</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Simulated Order Engine */}
              <div className="lg:col-span-5 relative">
                <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent shadow-2xl shadow-indigo-950/60">
                  <div className="relative rounded-[23px] bg-[#0c1222]/90 backdrop-blur-2xl p-6 sm:p-7 border border-white/[0.06]">
                    
                    {/* Live Processing Header */}
                    <div className="flex items-center justify-between pb-5 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Live Automated Panel</div>
                          <div className="text-xs text-slate-400">All Social Networks in One Place</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Operational
                      </span>
                    </div>

                    {/* Order Flow Simulation */}
                    <div className="mt-5 space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xs">
                            IG
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">Instagram Followers High Quality</div>
                            <div className="text-[11px] text-slate-400">From $0.001 / 1K • Instant Start</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Completed
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                            TT
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">TikTok Views, Likes &amp; Shares</div>
                            <div className="text-[11px] text-slate-400">Shocking Prices • High Retention</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                          Processing
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold text-xs">
                            YT
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">YouTube Watchtime &amp; Subscribers</div>
                            <div className="text-[11px] text-slate-400">Safe Monetization Delivery</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          Automated
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                            SP
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">Spotify Streams &amp; Playlist Plays</div>
                            <div className="text-[11px] text-slate-400">Algorithmic Trigger Boost</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Instant
                        </span>
                      </div>
                    </div>

                    {/* Bottom feature callout */}
                    <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-white">100% Protected &amp; Private</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            All user information is kept 100% private and will NOT be shared with anyone. Most trusted SMM panel.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SUPPORTED PLATFORMS BAR */}
        {/* ========================================================================= */}
        <section className="py-8 border-y border-slate-800/60 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Services On Today&apos;s Most Popular Social Networks
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {platforms.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-indigo-500/40 transition-colors"
                >
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${p.color}`} />
                  <span className="text-xs font-bold text-slate-200">{p.name}</span>
                  <span className="text-[10px] text-slate-500">({p.badge})</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. WHY CHOOSE US? */}
        {/* ========================================================================= */}
        <section id="why-choose-us" className="py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>WHY CHOOSE US?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
                We Help Dominate Social Media With The Largest Social Media Panel
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Enjoy market-leading quality, flexible payment options, and the most affordable prices available anywhere.
              </p>
            </div>

            {/* 4 Cards from reference */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseUsItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-[#0c1222] border border-slate-800 hover:border-indigo-500/40 transition-all hover:-translate-y-1 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center mb-5 ${item.accent}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
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
        {/* 3. WHO WE ARE */}
        {/* ========================================================================= */}
        <section id="who-we-are" className="py-20 lg:py-28 bg-slate-900/20 border-y border-slate-800/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#0c1222] border border-indigo-500/30 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>WHO WE ARE</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                  What We Offer For Your Success Brand
                </h2>

                <p className="text-lg sm:text-xl text-indigo-200 font-medium mb-5 leading-relaxed">
                  We are active for support 24 hours a day and seven days a week with all of your demands and services around the clock.
                </p>

                <p className="text-base text-slate-300 leading-relaxed mb-8">
                  Don&apos;t go anywhere else. We are here ready to serve you and help you with all of your SMM needs. Users or clients with SMM orders and in need of cheap SMM services are more than welcome in our SMM Panel.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/auth/register"
                    className="px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    Join Our Panel Now
                  </Link>
                  <Link
                    href="/page/service"
                    className="px-7 py-3.5 text-base font-medium text-slate-300 hover:text-white bg-slate-900/70 hover:bg-slate-900 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
                  >
                    Browse Service Catalog
                  </Link>
                </div>
              </div>

              {/* Decorative accent orb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. WHAT WE OFFER! */}
        {/* ========================================================================= */}
        <section id="what-we-offer" className="py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-3 block">
                What We Offer!
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                We Help Dominate Social Media With The Largest Social Media Panel
              </h2>
              <p className="text-slate-400 text-base sm:text-lg">
                Explore the complete suite of features engineered to accelerate your personal brand or agency growth.
              </p>
            </div>

            {/* 6 Feature Cards from reference */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {whatWeOfferItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-8 rounded-3xl bg-[#0c1222] border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2.5">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">
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
        {/* 5. HOW IT WORKS? */}
        {/* ========================================================================= */}
        <section id="how-it-works" className="py-20 lg:py-28 bg-slate-900/20 border-t border-slate-800/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-3 block">
                How It Works?
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                By Following The Processes Below You Can Make Any Order You Want
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Four simple steps to kickstart your social media campaign with instant automated delivery.
              </p>
            </div>

            {/* 4 Steps from reference */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorksSteps.map((stepItem, idx) => {
                const StepIcon = stepItem.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-[#0c1222] border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between relative shadow-xl"
                  >
                    <div>
                      {/* Step Number Badge */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold font-mono text-sm">
                          {stepItem.step}
                        </div>
                        <StepIcon className="w-5 h-5 text-slate-500" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{stepItem.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                        {stepItem.desc}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                      Step 0{stepItem.step} of 04
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. PRIVACY & TRUST GUARANTEE BANNER */}
        {/* ========================================================================= */}
        <section className="py-14 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-[#0c1222] to-indigo-950/40 border border-emerald-500/30 shadow-2xl flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Privacy &amp; Security Guaranteed
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Most Trusted SMM Panel
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  All user information is kept 100% private and will NOT be shared with anyone. Always remember, you are protected with our panel.
                </p>
              </div>
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg shadow-emerald-600/30 transition-all shrink-0 cursor-pointer"
              >
                Register Safely
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        {/* ========================================================================= */}
        <section id="faq" className="py-20 lg:py-28 bg-slate-900/20 border-t border-slate-800/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-3 block">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Everything you need to know about our services, pricing, and automated delivery.
              </p>
            </div>

            {/* Accordion list */}
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-[#0c1222] border border-slate-800 transition-all overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base sm:text-lg">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-indigo-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FINAL CALL TO ACTION */}
        {/* ========================================================================= */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
              Ready to Dominate Social Media?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Don&apos;t go anywhere else. We are here ready to serve you and help you with all of your SMM needs. Create your free account today.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Create Your Free Account Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

