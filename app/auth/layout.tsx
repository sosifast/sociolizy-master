import React from "react";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
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
          className="group inline-flex items-center gap-2.5 mb-4 transition-transform duration-200 hover:scale-[1.02]"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[11px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              MASTER<span className="text-indigo-400">SMM</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              PRO
            </span>
          </div>
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
