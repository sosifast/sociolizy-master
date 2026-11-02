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
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import gscConfig from "@/app/data/gsc.json";
import GoogleTag from "@/app/components/google-tag";

export const metadata: Metadata = {
  title: "The Best Social Media Panel in The Market! - MasterSMM",
  description:
    "Manage all social media networks from a single panel, quality and cheap. We provide services on Instagram, Twitter, Facebook, Youtube, TikTok, Spotify and many more services.",
  verification: {
    google: gscConfig.googleSiteVerification || gscConfig.content,
  },
};

export default function HomePage() {
  const verificationCode = gscConfig.googleSiteVerification || gscConfig.content;

  const platforms = [
    "Instagram",
    "Twitter",
    "Facebook",
    "Youtube",
    "TikTok",
    "Spotify",
    "More",
  ];

  const whyChooseUs = [
    {
      icon: Sparkles,
      title: "Great quality",
      desc: "You'll be satisfied with SMM services we provide.",
    },
    {
      icon: Wallet,
      title: "Many payment methods",
      desc: "Enjoy a fantastic selection of payment methods that we offer.",
    },
    {
      icon: Tag,
      title: "Shoking prices",
      desc: "You will be satisfied with how cheap our services are.",
    },
    {
      icon: BadgePercent,
      title: "Unbelievable Prices",
      desc: "Our prices most reasonable in the market, starting from at $0.001.",
    },
  ];

  const whatWeOffer = [
    {
      icon: TrendingUp,
      title: "Resellers",
      desc: "You can resell our services and grow your profit easily, Resellers are important part of SMM PANEL",
    },
    {
      icon: Headphones,
      title: "Supports",
      desc: "Technical support for all our services 24/7 to help you",
    },
    {
      icon: CheckCircle2,
      title: "High quality services",
      desc: "Get the best high quality services and in less time here",
    },
    {
      icon: RefreshCw,
      title: "Updates",
      desc: "Services are updated daily In order to be further improved and to provide you with best experience",
    },
    {
      icon: Server,
      title: "Api support",
      desc: "We have API Support For panel owners so you can resell our services easily",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      desc: "We have a Popular methods as PayPal and many more can be enabled upon request",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      icon: UserPlus,
      title: "Register & log in",
      desc: "Creating an account is the first step, then you need to log in.",
    },
    {
      step: "2",
      icon: Wallet,
      title: "Add funds",
      desc: "Next, pick a payment method and add funds to your account.",
    },
    {
      step: "3",
      icon: ShoppingBag,
      title: "Select a service",
      desc: "Select the services you want and get ready to receive more publicity.",
    },
    {
      step: "4",
      icon: Zap,
      title: "Enjoy popularity",
      desc: "You can enjoy incredible results when your order is complete.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
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
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="py-20 lg:py-28 px-4 sm:px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Best Social Media Panel in The Market!</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
            The Best Social Media Panel{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              in The Market!
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed mb-8">
            Manage all social media networks from a single panel, quality and cheap. We provide services on today&apos;s most popular social networks. We have Instagram, Twitter, Facebook, Youtube, TikTok, Spotify and many more services.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              href="/auth/register"
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 font-bold text-sm text-slate-200 hover:text-white transition-all cursor-pointer"
            >
              Sign In
            </Link>
          </div>

          {/* Social Network Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {platforms.map((p) => (
              <span
                key={p}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300"
              >
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHY CHOOSE US? */}
        {/* ========================================================================= */}
        <section className="py-16 border-t border-slate-800/80 bg-slate-900/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-2 block">
                WHY CHOOSE US?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                We are help dominate social media with the largest social media panel
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {whyChooseUs.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
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
        {/* WHO WE ARE */}
        {/* ========================================================================= */}
        <section className="py-16 border-t border-slate-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-2 block">
              WHO WE ARE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-5">
              What We Offer For Your Succes Brand
            </h2>
            <div className="space-y-4 text-sm sm:text-base text-slate-300 leading-relaxed">
              <p>
                We are active for support only 24 hours a day and seven times a week with all of your demands and services around the day.
              </p>
              <p>
                Don&apos;t go anywhere else. We are here ready to serve you and help you with all of your SMM needs. Users or Clients with SMM orders and in need of CHEAP SMM services are more then welcome in our SMM PANEL.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* WHAT WE OFFER! */}
        {/* ========================================================================= */}
        <section className="py-16 border-t border-slate-800/80 bg-slate-900/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-2 block">
                What we offer!
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                We are help dominate social media with the largest social media panel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {whatWeOffer.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS? */}
        {/* ========================================================================= */}
        <section className="py-16 border-t border-slate-800/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 mb-2 block">
                How it works?
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                By following the processes below you can make any order you want.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {howItWorks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center">
                          {item.step}
                        </span>
                        <Icon className="w-5 h-5 text-slate-500" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
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
        {/* PRIVACY & TRUST NOTICE */}
        {/* ========================================================================= */}
        <section className="py-14 border-t border-slate-800/80 bg-slate-900/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0c1222] border border-emerald-500/30 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed max-w-2xl mb-6">
                All user information is kept 100% private and will NOT be shared with anyone. Always remember, you are protected with our panel - Most trusted smm panel
              </p>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Register Now
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
