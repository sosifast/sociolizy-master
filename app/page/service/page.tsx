import React from "react";
import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";

export default function PublicServicePage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-[#0c1222]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base leading-tight text-white flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-indigo-400" />
              Katalog Layanan
            </h1>
            <span className="text-xs text-slate-400">Daftar layanan SMM tersedia</span>
          </div>
        </div>

        <Link
          href="/member/order"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          Pesan Sekarang
        </Link>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8">
        <div className="p-8 rounded-3xl bg-[#0c1222] border border-slate-800 text-center space-y-4">
          <PackageCheck className="w-12 h-12 text-indigo-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Katalog Layanan SMM Instan</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Dapatkan akses langsung ke ribuan layanan media sosial dengan harga kompetitif dan pemrosesan otomatis 24 jam.
          </p>
          <div className="pt-2">
            <Link
              href="/member/order"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Lihat Layanan di Member Area
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

