import React from "react";
import Link from "next/link";
import { History, Receipt, ShoppingCart, ArrowRight, Wallet, Clock } from "lucide-react";

export default function MemberHistoryIndexPage() {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Transaction History
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Activity &amp; Transaction Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Select a history category to view your SMM order transactions or account deposit records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
        {/* Card 1: Order History */}
        <Link
          href="/member/history/order"
          className="group p-6 rounded-3xl bg-[#0c1222] border border-slate-800 hover:border-indigo-500/40 hover:bg-[#0f172a] transition-all flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform mb-4">
              <ShoppingCart className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
              Order History
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              View all your social media service orders, including invoice IDs, provider references, target links, quantities, live statuses, and automatic balance refunds.
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-800/80 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
            <span>View Order History</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Deposit History */}
        <Link
          href="/member/history/deposit"
          className="group p-6 rounded-3xl bg-[#0c1222] border border-slate-800 hover:border-emerald-500/40 hover:bg-[#0f172a] transition-all flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform mb-4">
              <Receipt className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
              Deposit History
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Track your complete account top-up history via cryptocurrency gateways (Cryptomus) or alternative payment options with real-time network confirmation statuses.
            </p>
          </div>

          <div className="flex items-center justify-between pt-6 mt-4 border-t border-slate-800/80 text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
            <span>View Deposit History</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
