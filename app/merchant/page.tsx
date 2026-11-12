"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowUpRight,
  Store,
  Globe,
  Receipt,
  ArrowDownToLine,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Code2,
  Plus,
} from "lucide-react";

export default function MerchantDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/merchant/wallet");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load wallet data");
      }
      setData(json.data);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-3" />
        <span className="text-sm">Loading merchant dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/60 p-6 rounded-2xl text-center text-rose-300">
        <p className="text-sm">{error || "Data is unavailable"}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { wallet, merchantCount, websiteCount, recentTransactions, recentWithdrawals } = data;

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Merchant Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor incoming crypto payment revenues, transaction statuses, and your store balance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/merchant/accounts"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Merchant</span>
          </Link>
          <Link
            href="/merchant/withdraw"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700/60 transition-colors"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
            <span>Withdraw Funds</span>
          </Link>
        </div>
      </div>

      {/* Wallet Balance Cards (Requirement A.1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-black/20">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-emerald-400">
              Available Balance
            </span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ${Number(wallet.balance).toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
            <span>Ready for payout to your crypto wallet</span>
            <Link href="/merchant/withdraw" className="text-emerald-400 hover:underline">
              Withdraw &rarr;
            </Link>
          </div>
        </div>

        {/* Locked Balance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Processing Payouts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ${Number(wallet.lockedBalance).toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Queued in blockchain verification
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Revenue</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ${Number(wallet.totalEarned).toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            All-time net sales from your websites
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Withdrawn</span>
            <ArrowDownToLine className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            ${Number(wallet.totalWithdrawn).toFixed(2)}
            <span className="text-xs font-normal text-slate-400 ml-1.5">USD</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Successfully settled to your crypto addresses
          </div>
        </div>
      </div>

      {/* Quick stats & shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/merchant/accounts"
          className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Multi Merchant</div>
              <div className="text-base font-bold text-white">{merchantCount} Stores Registered</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
        </Link>

        <Link
          href="/merchant/websites"
          className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Websites & API Keys</div>
              <div className="text-base font-bold text-white">{websiteCount} Connected Domains</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
        </Link>

        <Link
          href="/merchant/docs"
          className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Developer API</div>
              <div className="text-base font-bold text-white">Integration Documentation</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </Link>
      </div>

      {/* Tables: Recent Transactions & Recent Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Transactions (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Latest customer payments across your stores</p>
            </div>
            <Link
              href="/merchant/transactions"
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              View All &rarr;
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No transactions received yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentTransactions.map((tx: any) => {
                const isPaid = tx.paymentStatus === "PAID";
                const isPending = tx.paymentStatus === "PENDING";
                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-400"
                            : isPending
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isPending ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-white">#{tx.orderId}</div>
                        <div className="text-[11px] text-slate-400">
                          {tx.merchant?.name} • {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">
                        +${Number(tx.netAmountUsd).toFixed(2)}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          isPaid
                            ? "bg-emerald-500/20 text-emerald-400"
                            : isPending
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {tx.paymentStatus}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Recent Withdrawals (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Recent Withdrawals</h2>
              <p className="text-xs text-slate-400">Crypto payout transaction history</p>
            </div>
            <Link
              href="/merchant/withdraw"
              className="text-xs text-emerald-400 hover:underline font-semibold"
            >
              Manage &rarr;
            </Link>
          </div>

          {recentWithdrawals.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No withdrawals requested yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentWithdrawals.map((w: any) => {
                const isCompleted = w.status === "COMPLETED";
                return (
                  <div key={w.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-semibold text-white">
                        ${Number(w.amountUsd).toFixed(2)} USD
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {w.coin} ({w.network}) • {w.isAuto ? "⚡ Auto" : "Manual"}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-400"
                          : w.status === "PROCESSING"
                          ? "bg-cyan-500/20 text-cyan-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
