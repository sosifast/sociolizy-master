"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Wallet,
  Clock,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Coins,
} from "lucide-react";

interface DepositItem {
  id: number;
  order_id: string;
  amount: number | string;
  currency: string;
  payment_status: string;
  invoice_url: string | null;
  txid: string | null;
  create_at: string;
}

export default function MemberDepositHistoryPage() {
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = useCallback(async () => {
    try {
      const res = await fetch("/api/member/payment/history");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setDeposits(json.data);
      }
    } catch (err) {
      console.error("Failed to load deposit history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits();

    const handleStatusUpdate = (e: any) => {
      const data = e.detail;
      if (!data?.order_id) return;
      setDeposits((prev) =>
        prev.map((d) =>
          d.order_id === data.order_id ? { ...d, payment_status: data.status } : d
        )
      );
    };

    const handleNewDeposit = () => {
      fetchDeposits();
    };

    window.addEventListener("master_smm:deposit_status_updated", handleStatusUpdate);
    window.addEventListener("master_smm:deposit_created", handleNewDeposit);

    return () => {
      window.removeEventListener("master_smm:deposit_status_updated", handleStatusUpdate);
      window.removeEventListener("master_smm:deposit_created", handleNewDeposit);
    };
  }, [fetchDeposits]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "paid_over") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Paid
        </span>
      );
    }
    if (s === "cancel" || s === "failed" || s === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  };

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
            Invoices and real-time confirmation status logs for all your account top-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchDeposits}
            className="p-2 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
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

      {loading ? (
        <div className="p-16 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
          <p className="text-xs">Loading deposit history...</p>
        </div>
      ) : deposits.length === 0 ? (
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
      ) : (
        <div className="bg-[#0c1222] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#070b14]/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">TXID / Hash</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {d.order_id}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ${Number(d.amount).toFixed(2)} {d.currency}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[11px]">
                        Cryptomus
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(d.payment_status)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      {d.txid ? (
                        <span className="truncate max-w-[120px] block" title={d.txid}>
                          {d.txid.slice(0, 8)}...{d.txid.slice(-6)}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(d.create_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {d.invoice_url ? (
                        <a
                          href={d.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 font-semibold transition-all text-xs"
                        >
                          <span>Invoice</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
