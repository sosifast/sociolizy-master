"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  TrendingUp,
  Globe,
  Sparkles,
  ArrowRight,
  ChevronDown,
  CheckCircle2,
  Check,
  Server,
  Layers,
  Users,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const platforms = [
    { name: "Instagram", color: "from-pink-500 to-purple-500", badge: "Instagram SMM Panel" },
    { name: "TikTok", color: "from-cyan-400 to-pink-500", badge: "TikTok Views & Likes" },
    { name: "YouTube", color: "from-red-600 to-red-500", badge: "YouTube Watchtime" },
    { name: "Facebook", color: "from-blue-600 to-indigo-600", badge: "Facebook SMM Panel" },
    { name: "X / Twitter", color: "from-slate-400 to-slate-200", badge: "Twitter Followers" },
    { name: "Telegram", color: "from-sky-500 to-blue-500", badge: "Channel Members" },
    { name: "Spotify", color: "from-emerald-500 to-green-500", badge: "Streams & Plays" },
    { name: "Discord", color: "from-indigo-500 to-violet-600", badge: "Server Members" },
  ];

  const faqs = [
    {
      q: "1. Is it safe to use your SMM Sociolizy?",
      a: "Absolutely! At Sociolizy, we prioritize the safety and security of our users. Our SMM Sociolizy is designed to adhere to industry standards and ethical practices. We implement robust security measures to protect your account information and ensure a safe user experience. While using any SMM panel, it's essential to follow best practices, such as providing necessary information securely and using services responsibly. With our commitment to user safety, you can confidently leverage our SMM panel to enhance your social media presence without compromising on security. Thank you for trusting Sociolizy for your social media marketing needs.",
    },
    {
      q: "2. Which is the best SMM panel?",
      a: "We take pride in offering top-notch social media marketing solutions tailored to your needs. While the definition of the \"best\" SMM panel can vary based on individual preferences, our platform prioritizes quality services, genuine engagement, and adherence to ethical practices. We encourage users to explore our range of packages, read reviews, and consider their specific requirements when determining the best fit for their social media marketing goals. Our commitment lies in providing a reliable and effective platform for enhancing your online presence. Thank you for choosing Sociolizy for your social media marketing needs.",
    },
    {
      q: "3. How does the automated order process work?",
      a: "World's cheapest social media panel is an automated system that provides social media services. Your orders start automatically and complete very quickly. Once you submit a link and desired quantity from your dashboard, our automated engine assigns the order immediately without manual delays.",
    },
    {
      q: "4. Is membership free or do I have to pay to join?",
      a: "Registration is 100% free! Do not contact people who want to sell you money for membership! Sociolizy never charges any fee to create an account. You only pay for the exact services you choose to order with full balance transparency.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />
      <div className="fixed -bottom-40 -right-40 w-[650px] h-[650px] bg-gradient-to-bl from-cyan-500/15 via-blue-600/10 to-transparent blur-[150px] rounded-full pointer-events-none animate-glow" />

      {/* Topbar Security Announcement */}
      <Topbar />

      {/* Main Navigation Header */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Headlines & Call to Action */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
                  <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                  <span>#1 Best and Cheapest SMM Panel</span>
                </div>

                {/* Primary H1 */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] mb-6">
                  World&apos;s Cheapest &amp; Most Reliable{" "}
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                    Social Media Panel
                  </span>
                </h1>

                {/* Subtitle directly quoting and refining konten.md */}
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
                  Welcome to <strong className="text-white font-semibold">Sociolizy</strong> — the world&apos;s cheapest social media panel. An automated system delivering high-speed social media services. Your orders start automatically and complete very quickly with wholesale pricing that leaves room for profit.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
                  <Link
                    href="/auth/register"
                    className="group w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all"
                  >
                    <span>Get Started for Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/auth/login"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                  >
                    <span>Sign In to Dashboard</span>
                  </Link>
                </div>

                {/* Trust Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-slate-800/80 w-full">
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-white">20+</div>
                    <div className="text-xs text-slate-400 mt-0.5">Countries Served</div>
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-indigo-400">100%</div>
                    <div className="text-xs text-slate-400 mt-0.5">Automated Orders</div>
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-cyan-400">2,500+</div>
                    <div className="text-xs text-slate-400 mt-0.5">Active Services</div>
                  </div>
                  <div>
                    <div className="text-2xl lg:text-3xl font-extrabold text-emerald-400">24/7</div>
                    <div className="text-xs text-slate-400 mt-0.5">Fast Delivery</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Dashboard Simulation Card */}
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
                          <div className="text-sm font-bold text-white">Live Automated Engine</div>
                          <div className="text-xs text-slate-400">Real-time Order Processing</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Operational
                      </span>
                    </div>

                    {/* Order Flow Simulation */}
                    <div className="mt-5 space-y-3.5">
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-xs">
                            IG
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">Instagram Followers High Quality</div>
                            <div className="text-[11px] text-slate-400">Order #84920 • 5,000 units</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          Fast Delivery
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs">
                            TT
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-200">TikTok Viral Views &amp; Shares</div>
                            <div className="text-[11px] text-slate-400">Order #84921 • 25,000 units</div>
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
                            <div className="text-xs font-semibold text-slate-200">YouTube Watchtime Monetization</div>
                            <div className="text-[11px] text-slate-400">Order #84922 • 4,000 Hours</div>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                          Automated
                        </span>
                      </div>
                    </div>

                    {/* Bottom feature callout */}
                    <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-white">Wholesale Reseller Advantage</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Automated API with instant response. Connect your own panel or manage directly with zero coding required.
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

        {/* Supported Platforms Strip */}
        <section className="py-8 border-y border-slate-800/60 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Automated Services Available Across Leading Platforms
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {platforms.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                >
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${p.color}`} />
                  <span className="text-xs font-medium text-slate-300">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section (konten.md) */}
        <section id="why-choose-us" className="py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="max-w-3xl mx-auto text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Customer Acknowledgement</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-5">
                Why Choose Us
              </h2>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
                Sociolizy has gained customers&apos; acknowledgement in such a short time; it is the most affordable SMM Panel &amp; Reseller SMM services provider in the present time. Therefore if you are looking for the most economical SMM platform for social media marketing, then you are at the right place.
              </p>
            </div>

            {/* Price Guarantee Callout */}
            <div className="mb-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/30 backdrop-blur-sm text-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Our Low-Cost &amp; Quality Guarantee
              </h3>
              <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
                We ensure you for the price; no one else can offer your wide range of service at such a low cost like us. SMM panel is used to promote the brand on social media platforms such as Facebook SMM Panel and Instagram SMM Panel.
              </p>
            </div>

            {/* 4 Core Pillars Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-indigo-500/40 transition-all hover:translate-y-[-2px]">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Most Economical Platform</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Market-leading distributor rates structured to maximize profitability for resellers, freelancers, and businesses.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/40 transition-all hover:translate-y-[-2px]">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                  <Server className="w-6 h-6 text-cyan-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Fully Automated Orders</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Orders start automatically and complete very quickly. Continuous automated delivery 24 hours a day, 7 days a week.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-all hover:translate-y-[-2px]">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Ethical &amp; Safe Standards</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Robust security measures built to safeguard user accounts. Never requires social media passwords or private keys.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-violet-500/40 transition-all hover:translate-y-[-2px]">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                  <Layers className="w-6 h-6 text-violet-400" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Unified Dashboard</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A centralized dashboard to manage campaigns across Instagram, TikTok, YouTube, Facebook, and 9+ more networks.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Services for Creators, Resellers and Agencies (konten.md) */}
        <section id="services" className="py-20 lg:py-24 bg-slate-900/20 border-t border-slate-800/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-3 block">
                Tailored Growth Solutions
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                Best and Cheapest SMM Panel Services for Creators, Resellers and Agencies
              </h2>
              <p className="text-slate-300 text-base sm:text-lg">
                Sociolizy gives resellers, creators, agencies, and brands affordable social media growth services across Instagram, TikTok, YouTube, Facebook, and 9 more platforms.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Resellers Card */}
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                    <TrendingUp className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">For Resellers</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    Connect your own custom panel with our high-speed automated API. Enjoy direct distributor wholesale rates that leave handsome profit margins.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Instant REST API integration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Lowest price tiers on bulk volumes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Automatic balance sync &amp; order updates</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <Link
                    href="/auth/register"
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl transition-all"
                  >
                    Start Reselling
                  </Link>
                </div>
              </div>

              {/* Creators Card */}
              <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/40 to-slate-900/70 border border-indigo-500/30 hover:border-indigo-500/50 shadow-xl shadow-indigo-950/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">For Creators</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    Boost your social proof across Instagram, TikTok, and YouTube. Accelerate your organic discovery and build the credibility you deserve.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Fast start for views, likes, and shares</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>High retention views for algorithm triggers</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>No password or login credentials needed</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <Link
                    href="/auth/register"
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all"
                  >
                    Grow Your Brand
                  </Link>
                </div>
              </div>

              {/* Agencies Card */}
              <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">For Agencies</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    Deliver outstanding marketing KPIs for multiple clients with reliable speed, bulk submissions, and comprehensive status tracking.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Bulk order processing in one click</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Detailed order status &amp; refill guarantees</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Dedicated 24/7 priority automated dispatch</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <Link
                    href="/auth/register"
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-xl transition-all"
                  >
                    Manage Clients
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* #1 Global Growth Platform (konten.md) */}
        <section id="global-platform" className="py-20 lg:py-28 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl p-8 sm:p-12 lg:p-16 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/30 relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Trusted Across 20+ Countries</span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
                  #1 Global Growth Platform
                </h2>

                <p className="text-lg sm:text-xl text-indigo-200 font-medium mb-6">
                  Join us today, and let&apos;s take your social media expertise to the next level!
                </p>

                <p className="text-base text-slate-300 leading-relaxed mb-8">
                  We started as a wholesale SMM panel built for resellers. We grew into a platform trusted by creators, agencies, and brands across 20+ countries, with one dashboard, fast delivery, and pricing that actually leaves room for profit.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/auth/register"
                    className="px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/auth/login"
                    className="px-7 py-3.5 text-base font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 rounded-xl transition-all"
                  >
                    Member Login
                  </Link>
                </div>
              </div>

              {/* Decorative accent orb */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions (konten.md) */}
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
                Everything you need to know about Sociolizy&apos;s services, security, and automated delivery.
              </p>
            </div>

            {/* Accordion list */}
            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-slate-900/60 border border-slate-800 transition-all overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-slate-200 hover:text-white transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-base sm:text-lg">{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-indigo-400 flex-shrink-0 transition-transform duration-200 ${
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

        {/* Final CTA Strip */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6">
              Ready to Skyrocket Your Social Media Presence?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Join Sociolizy today and start experiencing the world&apos;s most affordable automated SMM panel. Registration is fast, secure, and 100% free.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all"
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
