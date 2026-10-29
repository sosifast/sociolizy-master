import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import {
  Mail,
  Phone,
  Send,
  Share2,
  Globe,
  Clock,
  MessageSquare,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";
import { prisma } from "@/lib/prisma";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us - Sociolizy | 24/7 Customer Support & Help Desk",
  description:
    "Get in touch with the Sociolizy team. Reach our 24/7 help desk via WhatsApp, Telegram, Email, or social media for prompt assistance with orders and API.",
};

export const instant = false;

interface SettingData {
  id: number;
  site_name: string;
  email: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  telegram: string | null;
}

async function getSetting(): Promise<SettingData | null> {
  try {
    const setting = await prisma.setting.findFirst({
      orderBy: { id: "asc" },
      select: {
        id: true,
        site_name: true,
        email: true,
        whatsapp: true,
        instagram: true,
        facebook: true,
        tiktok: true,
        telegram: true,
      },
    });
    return setting;
  } catch (error) {
    console.error("Error fetching settings for contact page:", error);
    return null;
  }
}

export default async function ContactUsPage() {
  await connection();
  const setting = await getSetting();

  const email = setting?.email || "support@sociolizy.com";
  const whatsapp = setting?.whatsapp || "+628123456789";
  const telegram = setting?.telegram || "sociolizy_support";
  const instagram = setting?.instagram || "sociolizy.official";
  const facebook = setting?.facebook || "sociolizy";
  const tiktok = setting?.tiktok || "sociolizy";

  const cleanWhatsappNumber = whatsapp.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}`;

  const telegramUrl = telegram.startsWith("http")
    ? telegram
    : `https://t.me/${telegram.replace(/^@/, "")}`;

  const instagramUrl = instagram.startsWith("http")
    ? instagram
    : `https://instagram.com/${instagram.replace(/^@/, "")}`;

  const facebookUrl = facebook.startsWith("http")
    ? facebook
    : `https://facebook.com/${facebook.replace(/^@/, "")}`;

  const tiktokUrl = tiktok.startsWith("http")
    ? tiktok
    : `https://tiktok.com/@${tiktok.replace(/^@/, "")}`;

  const contactChannels = [
    {
      title: "Email Support",
      value: email,
      desc: "For general inquiries, account assistance, and enterprise partnerships.",
      icon: Mail,
      href: `mailto:${email}`,
      actionText: "Send Email",
      color: "from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-400",
      btnClass: "bg-blue-600 hover:bg-blue-500 text-white",
    },
    {
      title: "WhatsApp Dispatch",
      value: whatsapp,
      desc: "Instant live chat with our operations desk for urgent order questions.",
      icon: Phone,
      href: whatsappUrl,
      actionText: "Chat on WhatsApp",
      color: "from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-400",
      btnClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
      external: true,
    },
    {
      title: "Telegram Support",
      value: telegram.startsWith("@") ? telegram : `@${telegram}`,
      desc: "Official announcement channel and direct priority support ticket bot.",
      icon: Send,
      href: telegramUrl,
      actionText: "Open Telegram",
      color: "from-sky-600/20 to-cyan-600/10 border-sky-500/30 text-sky-400",
      btnClass: "bg-sky-600 hover:bg-sky-500 text-white",
      external: true,
    },
  ];

  const socialChannels = [
    {
      name: "Instagram",
      handle: instagram.startsWith("@") ? instagram : `@${instagram}`,
      href: instagramUrl,
      icon: Share2,
      desc: "Follow us for service updates, discount promotions, and daily tips.",
    },
    {
      name: "Facebook",
      handle: facebook.replace(/^https?:\/\/(www\.)?facebook\.com\//, ""),
      href: facebookUrl,
      icon: Globe,
      desc: "Connect with our global community of digital marketers and resellers.",
    },
    {
      name: "TikTok",
      handle: tiktok.startsWith("@") ? tiktok : `@${tiktok}`,
      href: tiktokUrl,
      icon: Share2,
      desc: "Watch tutorials on how to scale social presence with automated SMM.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-500/10 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* Topbar Announcement */}
      <Topbar />

      {/* Main Navigation Header */}
      <Navbar currentBadge="Contact Us" />

      {/* Hero Header */}
      <section className="relative z-10 border-b border-slate-800/80 bg-slate-900/30 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
            <Headphones className="w-4 h-4 text-indigo-400" />
            <span>24/7 Help Desk &amp; Dedicated Support</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight max-w-3xl mx-auto">
            We Are Here to Help{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
              Around the Clock
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Have a question regarding an active order, service specifications, or API integration? Connect with our dedicated support representatives via any of the direct channels below.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="relative z-10 py-16 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Direct Communication Channels */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400">
                  Direct Response Channels
                </h2>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Fastest Ways to Connect
                </h3>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Support Team Online Now</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactChannels.map((channel, idx) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all group"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 border shadow-sm transition-transform group-hover:scale-105"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <Icon className="w-6 h-6 text-indigo-400" />
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">
                        {channel.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                        {channel.desc}
                      </p>

                      <div className="font-mono text-xs font-semibold text-slate-200 bg-slate-800/60 px-3 py-2 rounded-xl mb-6 truncate border border-slate-700/50">
                        {channel.value}
                      </div>
                    </div>

                    <a
                      href={channel.href}
                      target={channel.external ? "_blank" : undefined}
                      rel={channel.external ? "noopener noreferrer" : undefined}
                      className={`inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${channel.btnClass}`}
                    >
                      <span>{channel.actionText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form & Support SLA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>

            {/* Support SLA & Info Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/30 border border-slate-800/80 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Operating Hours &amp; SLA</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Our automated dispatch engine operates continuously 24 hours a day, 7 days a week, 365 days a year without human intervention.
                  </p>
                </div>

                <div className="space-y-3 border-t border-slate-800/80 pt-4 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Automated Order Engine</span>
                    <span className="font-semibold text-emerald-400">24/7/365 Active</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">WhatsApp &amp; Telegram Chat</span>
                    <span className="font-semibold text-slate-200">10–15 Mins Avg Response</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Email Help Desk Tickets</span>
                    <span className="font-semibold text-slate-200">&lt; 2 Hours Response</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Refill &amp; Drop Verification</span>
                    <span className="font-semibold text-slate-200">Automated every 12h</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Already a Registered Member?</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    For faster resolution of specific orders, please include your <strong>Order ID</strong> and <strong>Service ID</strong> from your member dashboard when contacting us.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Community */}
          <div className="border-t border-slate-800/80 pt-12">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-2">
                Social Media Presence
              </h2>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Follow &amp; Engage With Us
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Stay updated with service availability notices, platform releases, and promotional coupon codes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {socialChannels.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a
                    key={idx}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-indigo-500/40 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-0.5">
                        {social.name}
                      </h4>
                      <p className="text-xs font-mono text-indigo-400 mb-2">
                        {social.handle}
                      </p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {social.desc}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
