"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Wallet, Clock, PlusCircle, ExternalLink } from "lucide-react";

export default function MemberDepositHistoryPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Deposit History
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-emerald-400" />
            <span>Deposit Transactions</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Invoices and confirmation status logs for all your account top-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/member/payment"
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Deposit</span>
          </Link>
          <Link
            href="/member/history/order"
            className="px-4 py-2 rounded-2xl bg-[#0c1222] border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <span>Order History</span>
          </Link>
        </div>
      </div>

      <div className="bg-[#0c1222] border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-xl text-center py-20">
        <div className="w-16 h-16 rounded-3xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto mb-4">
          <Clock className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">No Deposit Records Yet</h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          All cryptocurrency (Cryptomus) top-up invoices and network confirmations will be recorded and displayed here automatically.
        </p>
        <div className="pt-6">
          <Link
            href="/member/payment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            <span>Make a Deposit Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
