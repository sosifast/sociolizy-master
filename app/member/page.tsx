import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Zap, Wallet, ShoppingCart, User, Globe, LogOut, Shield } from "lucide-react";
import { verifySessionToken } from "@/lib/auth";

export const instant = false;

export default async function MemberDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session")?.value;
  const session = await verifySessionToken(sessionCookie);

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
          {session?.server_area && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">Region:</span>
              <span className="font-bold text-white">{session.server_area}</span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Saldo:</span>
            <span className="font-bold text-white">Rp 0</span>
          </div>

          <Link
            href="/api/auth/logout"
            className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </Link>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Akun Member Terverifikasi
            </span>
            {session?.server_area && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Region: {session.server_area}
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">
            Selamat Datang, {session?.username || "Member"}!
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
            <div className="text-2xl font-bold text-white">0</div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">Belum ada transaksi</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0c1222] border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span>Status Akun</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">Aktif</div>
            <div className="text-[11px] text-slate-400 mt-2 font-medium">Level {session?.level || "Member"}</div>
          </div>
        </div>

        {/* Action card */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-indigo-900/30 via-slate-900 to-[#0c1222] border border-indigo-500/20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-white">Siap Melakukan Pemesanan Pertama?</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
              Katalog layanan SMM aktif dengan harga terjangkau dan proses instan otomatis.
            </p>
          </div>
          <Link
            href="/member/order"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            Pesan Layanan Sekarang
          </Link>
        </div>
      </main>
    </div>
  );
}
