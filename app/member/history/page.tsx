import React from "react";
import Link from "next/link";
import { Receipt, ShoppingCart, ArrowRight } from "lucide-react";

export default function MemberHistoryIndexPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          History
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
        {/* Card 1: Order History */}
        <Link
          href="/member/history/order"
          className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/40 hover:shadow-xs transition-all flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3.5 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Order History
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              View all your service orders, including invoice IDs, target links, quantities, real-time statuses, and automatic balance refunds.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs sm:text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
            <span>View Order History</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Deposit History */}
        <Link
          href="/member/history/deposit"
          className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/40 hover:shadow-xs transition-all flex flex-col justify-between shadow-xs"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3.5 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Deposit History
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
              Track your complete account top-up history via cryptocurrency gateways with real-time network confirmation statuses.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs sm:text-sm font-semibold text-emerald-600 group-hover:text-emerald-700">
            <span>View Deposit History</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
