"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowDownToLine,
  Search,
  RefreshCw,
  Clock,
  X,
  AlertCircle,
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Penarikan Saldo Merchant
          </h1>
        </div>

        <button
          onClick={fetchWithdrawals}
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="spectrum-card-green p-5">
          <div className="flex items-center justify-between text-emerald-800 text-xs mb-1">
            <span className="font-bold uppercase tracking-wider">Total Dana Selesai Ditarik</span>
            <ArrowDownToLine className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-950">
            ${Number(stats.totalWithdrawnUsd).toFixed(2)}{" "}
            <span className="text-xs font-semibold text-emerald-700">USD</span>
          </div>
        </div>

        <div className="spectrum-card p-5">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider text-slate-700">Total Permintaan Tercatat</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCount} Penarikan</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="spectrum-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Username, Alamat, TxID..."
            className="spectrum-input w-full bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400"
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
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {s === "ALL" ? "Semua Status" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="spectrum-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs font-medium text-slate-500">Memuat data penarikan...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-rose-600">{error}</div>
        ) : withdrawals.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Tidak ada data penarikan ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((w) => {
                  const isCompleted = w.status === "COMPLETED";
                  const isProcessing = w.status === "PROCESSING" || w.status === "PENDING";
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">@{w.user?.username}</div>
                        <div className="text-[10px] text-slate-500">{w.user?.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ${Number(w.amountUsd).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        {w.coin}{" "}
                        <span className="text-[10px] text-slate-400 uppercase">
                          ({w.network})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 max-w-[180px] truncate">
                        {w.address}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-slate-600 font-medium">
                          {w.isAuto ? "⚡ Auto" : "👤 Manual"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isProcessing
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 max-w-[140px] truncate">
                        {w.txid || "-"}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
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
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
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
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Selesai</span>
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Total {totalCount} penarikan (Halaman {page} dari {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs font-medium cursor-pointer"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs font-medium cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* APPROVE / REJECT ACTION MODAL */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {actionModal.action === "approve"
                  ? "Setujui Penarikan Dana"
                  : "Tolak Penarikan Dana"}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteAction} className="mt-4 space-y-3.5 text-xs">
              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Member:</span>
                  <span className="font-semibold text-slate-900">
                    @{actionModal.withdrawal.user?.username}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jumlah:</span>
                  <span className="font-bold text-emerald-700">
                    ${Number(actionModal.withdrawal.amountUsd).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Koin & Jaringan:</span>
                  <span className="text-slate-900 font-mono font-semibold">
                    {actionModal.withdrawal.coin} ({actionModal.withdrawal.network?.toUpperCase()})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Alamat Tujuan:</span>
                  <span className="font-mono text-[11px] text-slate-800 break-all select-all block bg-white p-2 rounded-lg border border-slate-200/90 shadow-2xs font-medium">
                    {actionModal.withdrawal.address}
                  </span>
                </div>
              </div>

              {actionModal.action === "approve" ? (
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Blockchain TxID / Bukti Transfer (Opsional)
                  </label>
                  <input
                    type="text"
                    value={modalTxid}
                    onChange={(e) => setModalTxid(e.target.value)}
                    placeholder="Hash transaksi blockchain jika transfer manual..."
                    className="spectrum-input w-full bg-white text-slate-800 font-mono py-2 px-3 text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Menandai status menjadi COMPLETED dan menyelesaikan penarikan.
                  </span>
                </div>
              ) : (
                <div>
                  <label className="text-slate-700 font-semibold block mb-1">
                    Alasan Penolakan *
                  </label>
                  <textarea
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    placeholder="Masukkan alasan penolakan..."
                    rows={2}
                    className="spectrum-input w-full bg-white text-slate-800 py-2 px-3 text-xs"
                    required
                  />
                  <span className="text-[10px] text-amber-700 mt-1 block">
                    Dana sebesar ${Number(actionModal.withdrawal.amountUsd).toFixed(2)} USD akan otomatis dikembalikan ke saldo member.
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 font-bold rounded-xl cursor-pointer disabled:opacity-50 text-xs ${
                    actionModal.action === "approve"
                      ? "spectrum-btn-primary"
                      : "bg-rose-600 hover:bg-rose-500 text-white"
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
