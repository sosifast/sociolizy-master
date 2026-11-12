"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowDownToLine,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  AlertCircle,
  Check,
  Send,
  Zap,
} from "lucide-react";

export default function AdminMerchantWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalWithdrawnUsd: 0, totalFeesUsd: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Action Modal
  const [actionModal, setActionModal] = useState<{
    withdrawal: any;
    action: "approve" | "reject";
  } | null>(null);
  const [modalTxid, setModalTxid] = useState("");
  const [modalReason, setModalReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        status,
        search,
      });

      const res = await fetch(`/api/admin/merchant/withdrawals?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat data");
      }

      setWithdrawals(json.data);
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
    fetchWithdrawals();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchWithdrawals();
  };

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    setIsSubmitting(true);
    setActionError("");

    try {
      const res = await fetch("/api/admin/merchant/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: actionModal.withdrawal.id,
          action: actionModal.action,
          txid: modalTxid.trim(),
          reason: modalReason.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses aksi");
      }

      setActionModal(null);
      fetchWithdrawals();
    } catch (err: any) {
      setActionError(err?.message || "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Riwayat Penarikan Merchant (B.3)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola dan pantau seluruh permohonan penarikan saldo crypto (manual & auto-withdrawal).
          </p>
        </div>

        <button
          onClick={fetchWithdrawals}
          className="self-start sm:self-auto px-3.5 py-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Dana Telah Ditarik</span>
            <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${Number(stats.totalWithdrawnUsd).toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Status COMPLETED ke wallet member
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Permintaan Tercatat</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCount} Penarikan</div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Termasuk manual & auto-withdrawal
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Username, Alamat, TxID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["ALL", "PENDING", "PROCESSING", "COMPLETED", "REJECTED", "FAILED"].map((s) => (
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

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
            <span className="text-xs">Memuat data penarikan...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-rose-300">{error}</div>
        ) : withdrawals.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            Tidak ada data penarikan yang cocok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Jumlah (USD)</th>
                  <th className="py-3 px-4">Koin & Jaringan</th>
                  <th className="py-3 px-4">Alamat Dompet</th>
                  <th className="py-3 px-4">Metode</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">TxID</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4 text-center">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {withdrawals.map((w) => {
                  const isCompleted = w.status === "COMPLETED";
                  const isProcessing = w.status === "PROCESSING" || w.status === "PENDING";
                  return (
                    <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">@{w.user?.username}</div>
                        <div className="text-[10px] text-slate-500">{w.user?.email}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        ${Number(w.amountUsd).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {w.coin}{" "}
                        <span className="text-[10px] text-slate-500 uppercase">
                          ({w.network})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-300 max-w-[180px] truncate">
                        {w.address}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-400">
                          {w.isAuto ? "⚡ Auto" : "👤 Manual"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isProcessing
                              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-[140px] truncate">
                        {w.txid || "-"}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isProcessing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setActionModal({ withdrawal: w, action: "approve" });
                                setModalTxid("");
                                setModalReason("");
                                setActionError("");
                              }}
                              className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionModal({ withdrawal: w, action: "reject" });
                                setModalTxid("");
                                setModalReason("");
                                setActionError("");
                              }}
                              className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Selesai</span>
                        )}
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
              Total {totalCount} penarikan (Halaman {page} dari {totalPages})
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

      {/* APPROVE / REJECT ACTION MODAL */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {actionModal.action === "approve"
                  ? "Setujui Penarikan Dana"
                  : "Tolak Penarikan Dana"}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="mt-4 space-y-4 text-xs">
              {actionError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Member:</span>
                  <span className="font-semibold text-white">
                    @{actionModal.withdrawal.user?.username}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah:</span>
                  <span className="font-bold text-emerald-400">
                    ${Number(actionModal.withdrawal.amountUsd).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Koin & Jaringan:</span>
                  <span className="text-white font-mono">
                    {actionModal.withdrawal.coin} ({actionModal.withdrawal.network?.toUpperCase()})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Alamat Tujuan:</span>
                  <span className="font-mono text-[11px] text-slate-300 break-all select-all block bg-slate-900 p-2 rounded-lg">
                    {actionModal.withdrawal.address}
                  </span>
                </div>
              </div>

              {actionModal.action === "approve" ? (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Blockchain TxID / Bukti Transfer (Opsional)
                  </label>
                  <input
                    type="text"
                    value={modalTxid}
                    onChange={(e) => setModalTxid(e.target.value)}
                    placeholder="Hash transaksi blockchain jika transfer manual..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-hidden focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Menandai status menjadi COMPLETED dan menyelesaikan penarikan.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Alasan Penolakan *
                  </label>
                  <textarea
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    placeholder="Contoh: Alamat dompet tidak valid atau saldo dicurigai..."
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-hidden focus:border-rose-500"
                    required
                  />
                  <span className="text-[10px] text-amber-400 mt-1 block">
                    Dana sebesar ${Number(actionModal.withdrawal.amountUsd).toFixed(2)} akan otomatis dikembalikan ke saldo member.
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 text-slate-950 font-bold rounded-xl cursor-pointer disabled:opacity-50 ${
                    actionModal.action === "approve"
                      ? "bg-emerald-500 hover:bg-emerald-400"
                      : "bg-rose-500 hover:bg-rose-400 text-white"
                  }`}
                >
                  {isSubmitting
                    ? "Memproses..."
                    : actionModal.action === "approve"
                    ? "Setujui Penarikan"
                    : "Tolak & Revert Dana"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

