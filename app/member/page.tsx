import React from "react";
import Link from "next/link";
import { Zap, Wallet, ShoppingCart, User, ArrowLeft, Shield } from "lucide-react";

export default function MemberDashboardPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top navbar */}
      <header className="border-b border-slate-800 bg-[#0c1222]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Master SMM</h1>
            <span className="text-xs text-indigo-400 font-medium">Member Area</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Saldo:</span>
            <span className="font-bold text-white">Rp 0</span>
          </div>
          <Link
            href="/auth/login"
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Keluar
          </Link>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Selamat Datang di Member Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Pusat pemesanan layanan media sosial otomatis Anda.
          </p>
        </div>

        {/* Quick summary cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Saldo</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">Rp 0</div>
            <div className="text-[11px] text-emerald-400 mt-2 font-medium">Siap untuk deposit</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Total Pesanan</span>
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">0 Pesanan</div>
            <div className="text-[11px] text-slate-400 mt-2">Belum ada transaksi</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Status Akun</span>
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">Member Aktif</div>
            <div className="text-[11px] text-cyan-400 mt-2 font-medium">Level Standard</div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col items-center justify-center text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg text-white">Mulai Pemesanan Pertama Anda</h3>
          <p className="text-sm text-slate-400 max-w-md mt-1 mb-6">
            Pilih platform seperti Instagram, TikTok, YouTube, atau X dan masukkan link target untuk memproses order instan.
          </p>
          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Login
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
