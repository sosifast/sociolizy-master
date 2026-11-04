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
  Eye,
  Edit,
  Trash2,
  X,
  Save,
  Copy,
  Check,
  User,
  Hash,
  FileText,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import { isCryptomusEditDisabled } from "@/lib/cryptomus-status";

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
  raw_response?: string | null;
  create_at: string;
  update_at?: string;
  user?: {
    id: number;
    username: string;
    email: string;
    name?: string | null;
    balance?: number;
  } | null;
}

export default function AdminCryptomusHistoryPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<CryptomusTx[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal States
  const [detailModalTx, setDetailModalTx] = useState<CryptomusTx | null>(null);
  const [editModalTx, setEditModalTx] = useState<CryptomusTx | null>(null);
  const [deleteModalTx, setDeleteModalTx] = useState<CryptomusTx | null>(null);

  // Edit Form States
  const [editStatus, setEditStatus] = useState("pending");
  const [editAmount, setEditAmount] = useState("");
  const [editTxid, setEditTxid] = useState("");
  const [editCreditBalance, setEditCreditBalance] = useState(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

    const handleDepositUpdate = (e: any) => {
      const data = e.detail;
      if (!data?.order_id) return;
      setTransactions((prev) =>
        prev.map((t) =>
          t.order_id === data.order_id ? { ...t, payment_status: data.status } : t
        )
      );
    };

    const handleNewDeposit = () => {
      fetchTransactions();
    };

    window.addEventListener("master_smm:admin_deposit_updated", handleDepositUpdate);
    window.addEventListener("master_smm:admin_deposit_created", handleNewDeposit);

    return () => {
      window.removeEventListener("master_smm:admin_deposit_updated", handleDepositUpdate);
      window.removeEventListener("master_smm:admin_deposit_created", handleNewDeposit);
    };
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    toast.success("Tersalin", `${label} berhasil disalin`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const openEditModal = (tx: CryptomusTx) => {
    if (isCryptomusEditDisabled(tx.payment_status)) {
      toast.error(
        "Edit Dinonaktifkan",
        `Transaksi dengan status "${tx.payment_status}" sudah final dan tidak dapat diedit.`
      );
      return;
    }
    setEditModalTx(tx);
    setEditStatus(tx.payment_status || "pending");
    setEditAmount(String(tx.amount || ""));
    setEditTxid(tx.txid || "");
    setEditCreditBalance(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalTx) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/cryptomus/history/${editModalTx.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_status: editStatus,
          amount: parseFloat(editAmount) || Number(editModalTx.amount),
          txid: editTxid.trim() || null,
          credit_balance: editCreditBalance,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Berhasil", "Status dan data transaksi berhasil diperbarui");
        setEditModalTx(null);
        fetchTransactions();
      } else {
        toast.error("Gagal", json.message || "Gagal memperbarui transaksi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan", "Gagal menghubungi server");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalTx) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/cryptomus/history/${deleteModalTx.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success("Berhasil", "Transaksi deposit berhasil dihapus");
        setDeleteModalTx(null);
        fetchTransactions();
      } else {
        toast.error("Gagal Menghapus", json.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan", "Gagal menghubungi server");
    } finally {
      setIsDeleting(false);
    }
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
    if (s === "pending" || s === "check" || s === "process") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Menunggu</span>
        </span>
      );
    }
    if (s === "expired" || s === "cancel" || s === "fail") {
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
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Riwayat Deposit Cryptomus
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Daftar seluruh faktur, status transaksi, aksi detail, edit, dan hapus
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors border border-emerald-200"
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
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
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
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-emerald-500 focus:outline-none transition-all cursor-pointer w-full md:w-auto"
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
                <th className="py-3 px-4">Order ID / User</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Kripto</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">TXID / Invoice</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                    <span>Memuat data riwayat transaksi...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
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
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{tx.order_id}</div>
                      {tx.user ? (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-emerald-600" />
                          <span>@{tx.user.username}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400">ID #{tx.user_id || "-"}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ${Number(tx.amount).toFixed(2)}{" "}
                      <span className="text-[11px] text-slate-500 font-semibold">{tx.currency}</span>
                    </td>
                    <td className="py-3 px-4">
                      {tx.crypto_currency ? (
                        <span className="font-bold text-emerald-600 font-mono">
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
                          <span className="font-mono text-xs text-slate-600 truncate max-w-[100px]" title={tx.txid}>
                            {tx.txid}
                          </span>
                        ) : null}
                        <Link
                          href={`/admin/cryptomus/history/${tx.id}/invoice`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-bold"
                          title="Lihat Faktur Pembayaran Resmi"
                        >
                          <span>Faktur</span>
                          <FileText className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(tx.create_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    {/* Action Column */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Detail Action */}
                        <button
                          onClick={() => setDetailModalTx(tx)}
                          title="Lihat Detail Transaksi"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Action */}
                        {isCryptomusEditDisabled(tx.payment_status) ? (
                          <button
                            type="button"
                            disabled
                            title={`Edit dinonaktifkan: status "${tx.payment_status}" sudah final`}
                            className="p-1.5 text-slate-300 cursor-not-allowed rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEditModal(tx)}
                            title="Edit Transaksi"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Action */}
                        <button
                          onClick={() => setDeleteModalTx(tx)}
                          title="Hapus Transaksi"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Total: <strong>{total}</strong> transaksi tercatat</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700"
            >
              Sebelumnya
            </button>
            <span className="font-semibold text-slate-700">Halaman {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={transactions.length < 20}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {detailModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    {detailModalTx.order_id}
                  </h3>
                  <p className="text-[11px] text-slate-400">Detail Deposit Cryptomus</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Banner */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-medium">Status Pembayaran</p>
                <div className="mt-1">{renderStatusBadge(detailModalTx.payment_status)}</div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium">Nominal Transaksi</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  ${Number(detailModalTx.amount).toFixed(2)}{" "}
                  <span className="text-xs text-slate-500 font-bold">{detailModalTx.currency}</span>
                </p>
              </div>
            </div>

            {/* Key-Value Details */}
            <div className="space-y-2.5 text-xs divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Kripto / Nominal:</span>
                <span className="font-bold font-mono text-emerald-700">
                  {detailModalTx.crypto_amount ? `${detailModalTx.crypto_amount} ` : ""}
                  {detailModalTx.crypto_currency || "-"}
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-500">Order ID:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-slate-900">
                  <span>{detailModalTx.order_id}</span>
                  <button
                    onClick={() => copyToClipboard(detailModalTx.order_id, "Order ID")}
                    className="p-1 text-slate-400 hover:text-slate-600"
                  >
                    {copiedKey === "Order ID" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-500">TXID Hash:</span>
                <div className="flex items-center gap-1 font-mono text-slate-800 max-w-[240px]">
                  {detailModalTx.txid ? (
                    <>
                      <span className="truncate">{detailModalTx.txid}</span>
                      <button
                        onClick={() => copyToClipboard(detailModalTx.txid!, "TXID")}
                        className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                      >
                        {copiedKey === "TXID" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Pengguna Terkait:</span>
                <span className="font-semibold text-slate-900">
                  {detailModalTx.user
                    ? `@${detailModalTx.user.username} (${detailModalTx.user.email})`
                    : `User ID #${detailModalTx.user_id || "-"}`}
                </span>
              </div>

              <div className="pt-2 flex justify-between">
                <span className="text-slate-500">Tanggal Faktur:</span>
                <span className="text-slate-700">
                  {new Date(detailModalTx.create_at).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "medium",
                  })}
                </span>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-slate-500">Faktur Resmi:</span>
                <Link
                  href={`/admin/cryptomus/history/${detailModalTx.id}/invoice`}
                  className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Buka Halaman Faktur</span>
                </Link>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <Link
                href={`/admin/cryptomus/history/${detailModalTx.id}`}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-1"
              >
                <span>Lihat Halaman Penuh</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <div className="flex items-center gap-2">
                {isCryptomusEditDisabled(detailModalTx.payment_status) ? (
                  <button
                    type="button"
                    disabled
                    title={`Edit dinonaktifkan: status "${detailModalTx.payment_status}" sudah final`}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed inline-flex items-center gap-1 border border-slate-200"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit (Terkunci)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const txToEdit = detailModalTx;
                      setDetailModalTx(null);
                      openEditModal(txToEdit);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailModalTx(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      {editModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Transaksi #{editModalTx.order_id}
                  </h3>
                  <p className="text-[11px] text-slate-400">Ubah status, nominal, atau blockchain hash</p>
                </div>
              </div>
              <button
                onClick={() => setEditModalTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                >
                  <option value="pending">Menunggu Pembayaran (Pending)</option>
                  <option value="check">Pengecekan Blockchain (Check)</option>
                  <option value="process">Sedang Diproses (Process)</option>
                  <option value="paid">Lunas (Paid)</option>
                  <option value="paid_over">Kelebihan Bayar (Paid Over)</option>
                  <option value="cancel">Dibatalkan (Cancel)</option>
                  <option value="fail">Gagal (Fail)</option>
                  <option value="expired">Kedaluwarsa (Expired)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Faktur (${editModalTx.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Blockchain TXID Hash
                </label>
                <input
                  type="text"
                  value={editTxid}
                  onChange={(e) => setEditTxid(e.target.value)}
                  placeholder="0x938abc48..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white border border-slate-300 text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editCreditBalance}
                    onChange={(e) => setEditCreditBalance(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-xs text-slate-600">
                    Otomatis tambahkan saldo ke pengguna jika status diubah ke <strong>Lunas (Paid)</strong>
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <Link
                  href={`/admin/cryptomus/history/${editModalTx.id}/edit`}
                  className="text-xs text-slate-500 hover:text-slate-800 font-bold underline"
                >
                  Buka Form Lengkap
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModalTx(null)}
                    disabled={isSavingEdit}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isSavingEdit ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Simpan</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Transaksi</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus transaksi deposit{" "}
                <strong className="text-slate-800 font-mono">{deleteModalTx.order_id}</strong>?
                Data yang dihapus tidak dapat dipulihkan.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalTx(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
