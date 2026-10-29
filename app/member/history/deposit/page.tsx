"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, Clock, RefreshCw } from "lucide-react";

export default function MemberDepositHistoryPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-[#0c1222]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/member"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base leading-tight text-white flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              Riwayat Deposit
            </h1>
            <span className="text-xs text-slate-400">Riwayat transaksi isi saldo akun Anda</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8">
        <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-6 shadow-xl text-center py-16">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">Belum Ada Riwayat Deposit</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Semua catatan transaksi isi saldo Anda akan tercatat secara otomatis di halaman ini.
          </p>
        </div>
      </main>
    </div>
  );
}

