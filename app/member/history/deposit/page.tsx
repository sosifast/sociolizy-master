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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
        </span>
      );
    }
    if (s === "cancel" || s === "failed" || s === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3 h-3 text-amber-600" /> Pending
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Deposit Transactions
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>Deposit History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Invoices and real-time confirmation status logs for all your account top-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchDeposits}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          </button>
          <Link
            href="/member/payment"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Deposit</span>
          </Link>
          <Link
            href="/member/history/order"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>Order History</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600" />
          <p className="text-xs">Loading deposit history...</p>
        </div>
      ) : deposits.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Clock className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">No Deposit Records Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            All cryptocurrency (Cryptomus) top-up invoices and network confirmations will be recorded and displayed here automatically.
          </p>
          <div className="pt-4">
            <Link
              href="/member/payment"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
            >
              <span>Make a Deposit Now</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Invoice ID</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">TXID / Hash</th>
                  <th className="py-2.5 px-3">Created Date</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {d.order_id}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                      ${Number(d.amount).toFixed(2)} {d.currency}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px] border border-slate-200">
                        Cryptomus
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{getStatusBadge(d.payment_status)}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-xs">
                      {d.txid ? (
                        <span className="truncate max-w-[120px] block" title={d.txid}>
                          {d.txid.slice(0, 8)}...{d.txid.slice(-6)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(d.create_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {d.invoice_url ? (
                        <a
                          href={d.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-semibold transition-all text-[11px]"
                        >
                          <span>Invoice</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">-</span>
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
