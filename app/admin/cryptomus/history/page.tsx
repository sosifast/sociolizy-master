"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins,
  Search,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Calendar,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

interface CryptomusTx {
  id: number;
  uuid: string;
  order_id: string;
  user_id?: number | null;
  amount: string | number;
  currency: string;
  crypto_amount?: string | number | null;
  crypto_currency?: string | null;
  payment_status: string;
  invoice_url?: string | null;
  txid?: string | null;
  create_at: string;
}

export default function AdminCryptomusHistoryPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<CryptomusTx[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        status: statusFilter,
        search,
      });

      const res = await fetch(`/api/admin/cryptomus/history?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setTransactions(json.data || []);
        setTotal(json.pagination?.total || 0);
      } else {
        toast.error("Gagal Memuat", json.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Tidak dapat mengambil riwayat transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "paid_over") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Lunas ({status})</span>
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Menunggu</span>
        </span>
      );
    }
    if (s === "expired" || s === "cancel") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>{status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <AlertTriangle className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Deposit Cryptomus
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Daftar seluruh faktur dan status konfirmasi transaksi mata uang kripto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/cryptomus/setup"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Pengaturan Gateway</span>
          </Link>
          <button
            onClick={() => fetchTransactions()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors border border-indigo-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan Order ID, TXID, atau koin..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer w-full md:w-auto"
          >
            <option value="all">Semua Status</option>
            <option value="paid">Lunas (Paid)</option>
            <option value="pending">Menunggu (Pending)</option>
            <option value="cancel">Dibatalkan (Cancel)</option>
            <option value="expired">Kedaluwarsa (Expired)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Kripto / Jaringan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">TXID / Invoice</th>
                <th className="py-3 px-4 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                    <span>Memuat data riwayat transaksi...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">Belum ada transaksi Cryptomus</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Transaksi deposit kripto dari pengguna akan tercatat otomatis di sini.
                    </p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {tx.order_id}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {Number(tx.amount).toLocaleString()} {tx.currency}
                    </td>
                    <td className="py-3 px-4">
                      {tx.crypto_currency ? (
                        <span className="font-bold text-indigo-600">
                          {tx.crypto_amount ? `${tx.crypto_amount} ` : ""}
                          {tx.crypto_currency}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {renderStatusBadge(tx.payment_status)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {tx.txid ? (
                          <span className="font-mono text-xs text-slate-600 truncate max-w-[120px]" title={tx.txid}>
                            {tx.txid}
                          </span>
                        ) : tx.invoice_url ? (
                          <a
                            href={tx.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-bold"
                          >
                            <span>Faktur</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-slate-500 whitespace-nowrap">
                      {new Date(tx.create_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Total: <strong>{total}</strong> transaksi tercatat</span>
        </div>
      </div>
    </div>
  );
}

