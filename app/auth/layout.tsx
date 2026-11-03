import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap } from "lucide-react";
import GoogleTag from "@/app/components/google-tag";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Google tag (gtag.js) */}
      <GoogleTag />

      {/* Background ambient lighting & grid (overflow strictly clipped to prevent extra page scrollbar) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-600/25 via-violet-600/15 to-transparent blur-[130px] rounded-full animate-glow" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-gradient-to-bl from-cyan-500/20 via-blue-600/15 to-transparent blur-[130px] rounded-full animate-glow" />
      </div>

      {/* Main Centered Auth Container */}
      <main className="relative z-10 flex-1 w-full flex flex-col items-center justify-center px-4 py-6 sm:py-8 sm:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group inline-flex items-center gap-2 mb-4 p-2 px-3.5 rounded-2xl bg-white shadow-md shadow-black/20 transition-transform duration-200 hover:scale-[1.02]"
        >
          <Image
            src="/logo/logo.png"
            alt="sociolizy"
            width={120}
            height={44}
            className="h-7 w-auto object-contain"
            priority
          />
        </Link>

        {/* Children (Form Card) */}
        <div className="w-full flex justify-center">
          {children}
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 w-full py-3.5 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-[#070b14]/50 backdrop-blur-md">
        <p>© 2026 MASTER SMM. All rights reserved.</p>
      </footer>
    </div>
  );
}
