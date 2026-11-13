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
  Coins,
  ShieldCheck,
  TrendingUp,
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
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <RefreshCw className="w-9 h-9 animate-spin text-emerald-500 mb-3" />
        <span className="text-sm font-medium">Loading merchant dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-8 rounded-2xl text-center text-rose-700 max-w-lg mx-auto shadow-sm">
        <p className="text-sm font-semibold">{error || "Data is currently unavailable"}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { wallet, merchantCount, websiteCount, recentTransactions, recentWithdrawals } = data;

  return (
    <div className="space-y-8 animate__animated animate__fadeIn">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="spectrum-badge-green font-mono">
              Live Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Merchant Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time cryptocurrency payment collection, store revenues, and instant wallet settlement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/merchant/accounts"
            className="spectrum-btn-primary text-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Merchant</span>
          </Link>
          <Link
            href="/merchant/withdraw"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            <span>Withdraw Funds</span>
          </Link>
        </div>
      </div>

      {/* Wallet Balance Cards (White & Green Theme) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Balance (Featured Green Accent Card) */}
        <div className="spectrum-card-green p-6 relative overflow-hidden bg-gradient-to-br from-emerald-50/50 via-white to-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
            <span className="font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Available Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ${Number(wallet.balance).toFixed(2)}
            <span className="text-xs font-semibold text-slate-400 ml-1.5 font-mono">USD</span>
          </div>
          <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
            <span>Ready for instant crypto payout</span>
            <Link href="/merchant/withdraw" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
              Withdraw &rarr;
            </Link>
          </div>
        </div>

        {/* Locked / Processing Balance */}
        <div className="spectrum-card p-6 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
            <span className="font-bold uppercase tracking-wider text-slate-600">
              Processing Payouts
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ${Number(wallet.lockedBalance).toFixed(2)}
            <span className="text-xs font-semibold text-slate-400 ml-1.5 font-mono">USD</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            Awaiting blockchain confirmation
          </div>
        </div>

        {/* Total Earned */}
        <div className="spectrum-card p-6 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
            <span className="font-bold uppercase tracking-wider text-slate-600">
              Total Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ${Number(wallet.totalEarned).toFixed(2)}
            <span className="text-xs font-semibold text-slate-400 ml-1.5 font-mono">USD</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            Cumulative net store earnings
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="spectrum-card p-6 bg-white">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-3">
            <span className="font-bold uppercase tracking-wider text-slate-600">
              Total Settled
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            ${Number(wallet.totalWithdrawn).toFixed(2)}
            <span className="text-xs font-semibold text-slate-400 ml-1.5 font-mono">USD</span>
          </div>
          <div className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            Transferred to your external wallets
          </div>
        </div>
      </div>

      {/* Quick stats & shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/merchant/accounts"
          className="spectrum-card p-5.5 flex items-center justify-between group hover:border-emerald-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Multi Merchant</div>
              <div className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {merchantCount} Store Profiles
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          href="/merchant/websites"
          className="spectrum-card p-5.5 flex items-center justify-between group hover:border-emerald-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Websites & API Keys</div>
              <div className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                {websiteCount} Active Domains
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link
          href="/merchant/docs"
          className="spectrum-card p-5.5 flex items-center justify-between group hover:border-emerald-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Developer API</div>
              <div className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Integration Reference
              </div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </Link>
      </div>

      {/* Tables: Recent Transactions & Recent Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Transactions (7 cols) */}
        <div className="lg:col-span-7 spectrum-card p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Invoices</h2>
              <p className="text-xs text-slate-500">Live incoming crypto checkout payments</p>
            </div>
            <Link
              href="/merchant/transactions"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
            >
              View All Invoices &rarr;
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs">
              No transactions received yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((tx: any) => {
                const isPaid = tx.paymentStatus === "PAID";
                const isPending = tx.paymentStatus === "PENDING";
                return (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-600"
                            : isPending
                            ? "bg-amber-50 text-amber-600"
                            : "bg-rose-50 text-rose-600"
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
                        <div className="font-bold text-slate-900">#{tx.orderId}</div>
                        <div className="text-[11px] text-slate-400">
                          {tx.merchant?.name} • {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-slate-900">
                        +${Number(tx.netAmountUsd).toFixed(2)}
                      </div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isPending
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
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
        <div className="lg:col-span-5 spectrum-card p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Withdrawals</h2>
              <p className="text-xs text-slate-500">Crypto settlement records</p>
            </div>
            <Link
              href="/merchant/withdraw"
              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
            >
              Manage &rarr;
            </Link>
          </div>

          {recentWithdrawals.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs">
              No withdrawals requested yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentWithdrawals.map((w: any) => {
                const isCompleted = w.status === "COMPLETED";
                return (
                  <div key={w.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        ${Number(w.amountUsd).toFixed(2)} USD
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {w.coin} ({w.network}) • {w.isAuto ? "⚡ Auto" : "Manual"}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : w.status === "PROCESSING"
                          ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
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
