"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Search,
  RefreshCw,
  Eye,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Copy,
  Check,
} from "lucide-react";

export default function AdminMerchantTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalVolumeUsd: 0,
    totalAdminFeeUsd: 0,
    totalMerchantNetUsd: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [detailTx, setDetailTx] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        status,
        search,
      });

      const res = await fetch(`/api/admin/merchant/transactions?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat data");
      }

      setTransactions(json.data);
      if (json.stats) setStats(json.stats);
      setTotalPages(json.pagination.totalPages || 1);
      setTotalCount(json.pagination.total || 0);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Riwayat Transaksi Merchant (B.1)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pantau seluruh arus pembayaran pelanggan pada semua merchant & website terdaftar.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="self-start sm:self-auto px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Volume Pembayaran</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${Number(stats.totalVolumeUsd).toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Semua transaksi status PAID
          </span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider">
              Fee Gateway Masuk (Admin Profit)
            </span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            +${Number(stats.totalAdminFeeUsd).toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Fee komisi platform yang didapatkan
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Net Masuk ke Merchant</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${Number(stats.totalMerchantNetUsd).toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Saldo bersih yang dikreditkan ke member
          </span>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Order ID, TxID, Merchant, User..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["ALL", "PAID", "PENDING", "EXPIRED", "FAILED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                status === s
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {s === "ALL" ? "Semua Status" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
            <span className="text-xs">Memuat riwayat transaksi merchant...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-rose-300">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            Tidak ada transaksi merchant ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice / Order ID</th>
                  <th className="py-3 px-4">Member Pemilik</th>
                  <th className="py-3 px-4">Merchant & Website</th>
                  <th className="py-3 px-4 text-right">Gross (USD)</th>
                  <th className="py-3 px-4 text-right">Fee Admin</th>
                  <th className="py-3 px-4 text-right">Net Merchant</th>
                  <th className="py-3 px-4">Crypto Transfer</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => {
                  const isPaid = tx.paymentStatus === "PAID";
                  const isPending = tx.paymentStatus === "PENDING";
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">#{tx.orderId}</div>
                        <span className="font-mono text-[10px] text-slate-500">
                          {tx.uuid.substring(0, 10)}...
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">
                          @{tx.merchant?.user?.username || "unknown"}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                          {tx.merchant?.user?.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{tx.merchant?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tx.website?.domain || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-200">
                        ${Number(tx.amountUsd).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        +${Number(tx.adminFee).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-300">
                        ${Number(tx.netAmountUsd).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs">
                        {tx.cryptoAmount ? (
                          <div>
                            <span className="text-white font-medium">{tx.cryptoAmount}</span>{" "}
                            <span className="text-emerald-400">{tx.cryptoCurrency}</span>{" "}
                            <span className="text-[10px] text-slate-500 uppercase">
                              ({tx.cryptoNetwork})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isPending
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {tx.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailTx(tx)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/pay/${tx.uuid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg"
                            title="Buka Checkout"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Total {totalCount} transaksi (Halaman {page} dari {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Invoice #{detailTx.orderId}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">{detailTx.uuid}</span>
              </div>
              <button
                type="button"
                onClick={() => setDetailTx(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Member:</span>
                  <span className="font-semibold text-white">
                    @{detailTx.merchant?.user?.username} ({detailTx.merchant?.user?.email})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Merchant Store:</span>
                  <span className="text-white font-medium">{detailTx.merchant?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Website:</span>
                  <span className="font-mono text-slate-300">{detailTx.website?.domain || "-"}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Invoice:</span>
                  <span className="font-bold text-white">${Number(detailTx.amountUsd).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fee Admin (Platform Profit):</span>
                  <span className="text-emerald-400 font-bold">+${Number(detailTx.adminFee).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Net Merchant:</span>
                  <span className="text-white font-semibold">${Number(detailTx.netAmountUsd).toFixed(2)} USD</span>
                </div>
              </div>

              {detailTx.payAddress && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-slate-400 font-semibold mb-1">Alamat Pembayaran:</div>
                  <div className="font-mono text-[11px] text-slate-200 break-all select-all bg-slate-900 p-2 rounded-lg">
                    {detailTx.payAddress}
                  </div>
                  {detailTx.txid && (
                    <div>
                      <div className="text-slate-400 font-semibold mb-1">Blockchain TxID:</div>
                      <div className="font-mono text-[11px] text-slate-200 break-all select-all bg-slate-900 p-2 rounded-lg">
                        {detailTx.txid}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setDetailTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

