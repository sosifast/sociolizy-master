"use client";

import React, { useState } from "react";
import {
  FileDown,
  Server,
  Percent,
  CheckCircle2,
  RefreshCw,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AdminImportPage() {
  const [provider, setProvider] = useState("smm-global-direct");
  const [markupPercent, setMarkupPercent] = useState("30");
  const [currencyRate, setCurrencyRate] = useState("16000");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
              Sinkronisasi Massal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Import Layanan Otomatis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tarik ratusan daftar layanan langsung dari API provider terpilih dan tetapkan margin keuntungan Anda.
          </p>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
        <h3 className="font-extrabold text-slate-900 text-base mb-4">
          Langkah 1: Pengaturan Sumber & Markup Harga
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih API Provider
            </label>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              >
                <option value="smm-global-direct">SMM Global Direct API (Saldo: Rp 8.450.000)</option>
                <option value="indosmm-master">IndoSMM Master Server (Saldo: Rp 6.120.000)</option>
                <option value="vip-social-gateway">VIP Social Media Gateway (Saldo: Rp 3.880.000)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Margin Keuntungan (% Markup)
            </label>
            <div className="relative">
              <input
                type="number"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(e.target.value)}
                placeholder="Contoh: 30"
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 text-xs font-bold pointer-events-none">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Harga jual = Harga modal + {markupPercent}%</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kurs USD ke IDR (Jika API berbasis $)
            </label>
            <div className="relative">
              <input
                type="number"
                value={currencyRate}
                onChange={(e) => setCurrencyRate(e.target.value)}
                placeholder="16000"
                className="w-full pl-3.5 pr-12 py-2.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-red-500 focus:outline-none"
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 text-xs font-bold pointer-events-none">
                IDR
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm shadow-red-600/30 transition-all cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tarik Daftar Layanan dari Provider</span>
          </button>
        </div>
      </div>

      {/* Guide Info Card */}
      <div className="p-5 rounded-2xl bg-red-50 border border-red-200/70 text-red-950 text-xs leading-relaxed">
        <h4 className="font-bold flex items-center gap-2 text-sm text-red-700 mb-1">
          <Sparkles className="w-4 h-4 text-red-600" />
          <span>Cara Kerja Fitur Import Layanan</span>
        </h4>
        <p className="text-slate-600">
          Fitur ini akan memanggil endpoint `action=services` pada provider yang dipilih, membaca ID layanan, nama layanan, minimal order, maksimal order, dan harga modal. Sistem akan otomatis membuat Platform dan Kategori jika belum ada di database, kemudian menghitung harga jual member sesuai persentase keuntungan yang Anda tentukan.
        </p>
      </div>
    </div>
  );
}
