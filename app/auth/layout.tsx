import React from "react";
import Link from "next/link";
import { Sparkles, Zap, ShieldCheck, TrendingUp, CheckCircle2, Star } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting & grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
      
      {/* Ambient gradient orbs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />
      <div className="absolute -bottom-40 -right-40 w-[650px] h-[650px] bg-gradient-to-bl from-cyan-500/20 via-blue-600/15 to-transparent blur-[150px] rounded-full pointer-events-none animate-glow" />
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-[#0a0f1d] rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                MASTER<span className="text-indigo-400">SMM</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                PRO
              </span>
            </div>
          </div>
        </Link>

        {/* Live System Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Sistem Online & Otomatis 24/7</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-20 flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
        <div className="w-full grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column (Visible on Desktop) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center pr-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent border border-indigo-500/20 text-indigo-300 text-xs font-semibold w-fit mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Pusat Social Media Marketing Terlengkap & Termurah</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.18] mb-6">
              Tingkatkan Visibilitas & Penjualan Akun Bisnis Anda{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                Secara Otomatis.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base xl:text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
              Platform all-in-one untuk reseller, agensi, dan kreator konten. Akses 2.500+ layanan Instagram, TikTok, YouTube, X, dan lainnya dengan harga modal distributor.
            </p>

            {/* Feature List */}
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4 text-indigo-400" />
                </div>
                <h4 className="font-semibold text-sm text-slate-200 mb-1">Server Instan 24 Jam</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Semua order diteruskan langsung ke penyedia utama secara otomatis dalam hitungan detik.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <h4 className="font-semibold text-sm text-slate-200 mb-1">Aman & Terpercaya</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tidak pernah membutuhkan password akun media sosial Anda. 100% aman dan bergaransi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-semibold text-sm text-slate-200 mb-1">Harga Grosir Reseller</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dapatkan tarif terbaik untuk dijual kembali dengan margin keuntungan hingga 300%.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-sm hover:border-indigo-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="font-semibold text-sm text-slate-200 mb-1">Dukungan API Reseller</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Hubungkan website atau panel SMM Anda langsung melalui dokumentasi REST API kami yang lengkap.
                </p>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-800/60">
              <div className="flex -space-x-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border-2 border-[#070b14] flex items-center justify-center text-xs font-bold text-white shadow-md">
                  AD
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 border-2 border-[#070b14] flex items-center justify-center text-xs font-bold text-white shadow-md">
                  RZ
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 border-2 border-[#070b14] flex items-center justify-center text-xs font-bold text-white shadow-md">
                  SK
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 border-2 border-[#070b14] flex items-center justify-center text-xs font-bold text-white shadow-md">
                  15k+
                </div>
              </div>
              <div className="text-xs text-slate-400">
                <div className="flex items-center gap-1 text-amber-400 font-semibold mb-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-slate-300 ml-1">4.9 / 5.0</span>
                </div>
                <span>Dipercaya oleh 15.000+ pengguna aktif & reseller di Indonesia</span>
              </div>
            </div>

          </div>

          {/* Right Form Column */}
          <div className="w-full lg:col-span-6 xl:col-span-5 flex justify-center">
            {children}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© 2026 Master SMM Platform. Seluruh hak cipta dilindungi.</p>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-slate-300 transition-colors">
            Ketentuan Layanan
          </Link>
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">
            Kebijakan Privasi
          </Link>
          <Link href="/api-docs" className="hover:text-slate-300 transition-colors">
            Dokumentasi API
          </Link>
        </div>
      </footer>
    </div>
  );
}
