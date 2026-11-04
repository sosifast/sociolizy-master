"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Coins,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  User,
  Calendar,
  CreditCard,
  Hash,
  Globe,
  FileText,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import { isCryptomusEditDisabled } from "@/lib/cryptomus-status";

interface TransactionDetail {
  id: number;
  uuid: string;
  order_id: string;
  user_id?: number | null;
  merchant_id?: string | null;
  amount: number;
  currency: string;
  crypto_amount?: number | null;
  crypto_currency?: string | null;
  payment_status: string;
  invoice_url?: string | null;
  txid?: string | null;
  raw_response?: string | null;
  create_at: string;
  update_at: string;
  user?: {
    id: number;
    uuid: string;
    username: string;
    email: string;
    name?: string | null;
    balance: number;
    server_area?: string | null;
  } | null;
}

export default function CryptomusHistoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [tx, setTx] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/cryptomus/history/${id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setTx(json.data);
      } else {
        toast.error("Gagal", json.message || "Transaksi tidak ditemukan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Tidak dapat mengambil detail transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success("Tersalin", `${fieldName} disalin ke clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/cryptomus/history/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Berhasil", "Transaksi deposit berhasil dihapus");
        router.push("/admin/cryptomus/history");
      } else {
        toast.error("Gagal Menghapus", json.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan", "Gagal menghubungi server");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "paid_over") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Lunas ({status.toUpperCase()})</span>
        </span>
      );
    }
    if (s === "pending" || s === "check" || s === "process") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Menunggu Pembayaran ({status})</span>
        </span>
      );
    }
    if (s === "expired" || s === "cancel" || s === "fail") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          <span>{status.toUpperCase()}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>{status}</span>
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-slate-600 font-semibold">Memuat detail transaksi Cryptomus...</p>
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Transaksi Tidak Ditemukan</h2>
        <p className="text-slate-500 text-sm">Data transaksi dengan ID #{id} tidak ada di database.</p>
        <Link
          href="/admin/cryptomus/history"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cryptomus/history"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                {tx.order_id}
              </h1>
              {renderStatusBadge(tx.payment_status)}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Detail transaksi deposit gateway Cryptomus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/cryptomus/history/${tx.id}/invoice`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Lihat Faktur</span>
          </Link>
          {isCryptomusEditDisabled(tx.payment_status) ? (
            <button
              type="button"
              disabled
              title={`Edit dinonaktifkan: status "${tx.payment_status}" sudah final`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed border border-slate-200"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit (Terkunci)</span>
            </button>
          ) : (
            <Link
              href={`/admin/cryptomus/history/${tx.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Transaksi</span>
            </Link>
          )}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Transaction Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nominal & Crypto Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Informasi Pembayaran</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Nominal Faktur (Fiat)</p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  ${Number(tx.amount).toFixed(2)}{" "}
                  <span className="text-sm font-semibold text-slate-500">{tx.currency}</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <p className="text-xs text-emerald-700 font-medium">Nominal Kripto</p>
                <p className="text-2xl font-black text-emerald-800 mt-1 font-mono">
                  {tx.crypto_amount ? tx.crypto_amount : "-"}{" "}
                  <span className="text-sm font-bold text-emerald-600">
                    {tx.crypto_currency || ""}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3.5 text-xs sm:text-sm divide-y divide-slate-100">
              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-500">Order ID:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{tx.order_id}</span>
                  <button
                    onClick={() => copyToClipboard(tx.order_id, "Order ID")}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    {copiedField === "Order ID" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-500">Blockchain TXID / Hash:</span>
                <div className="flex items-center gap-1.5 font-mono text-slate-800 max-w-[280px]">
                  {tx.txid ? (
                    <>
                      <span className="truncate" title={tx.txid}>{tx.txid}</span>
                      <button
                        onClick={() => copyToClipboard(tx.txid!, "TXID")}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded shrink-0"
                      >
                        {copiedField === "TXID" ? (
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

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-500">Merchant ID:</span>
                <span className="font-mono text-slate-700">{tx.merchant_id || "-"}</span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-500">Status Pembayaran:</span>
                <div>{renderStatusBadge(tx.payment_status)}</div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-500">Waktu Dibuat:</span>
                <span className="text-slate-700 font-medium">
                  {new Date(tx.create_at).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "medium",
                  })}
                </span>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <span className="text-slate-500">Terakhir Diperbarui:</span>
                <span className="text-slate-700 font-medium">
                  {new Date(tx.update_at).toLocaleString("id-ID", {
                    dateStyle: "full",
                    timeStyle: "medium",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Raw Response Gateway */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Raw Response Cryptomus (JSON)</span>
              </h2>
              {tx.raw_response && (
                <button
                  onClick={() => copyToClipboard(tx.raw_response!, "Raw JSON")}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-bold"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin JSON</span>
                </button>
              )}
            </div>

            {tx.raw_response ? (
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-72 leading-relaxed">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(tx.raw_response), null, 2);
                  } catch {
                    return tx.raw_response;
                  }
                })()}
              </pre>
            ) : (
              <p className="text-xs text-slate-400 italic">Tidak ada payload raw response tersimpan.</p>
            )}
          </div>
        </div>

        {/* Right Column: User Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>Pengguna / Pemilik Akun</span>
            </h2>

            {tx.user ? (
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {tx.user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {tx.user.name || tx.user.username}
                    </p>
                    <p className="text-slate-400 text-xs truncate">@{tx.user.username}</p>
                  </div>
                </div>

                <div className="space-y-2.5 divide-y divide-slate-100">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">
                      {tx.user.email}
                    </span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Saldo Akun:</span>
                    <span className="font-bold text-emerald-600 font-mono">
                      ${tx.user.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">Server Cluster:</span>
                    <span className="font-semibold text-slate-800">
                      {tx.user.server_area || "SG"}
                    </span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500">User ID:</span>
                    <span className="font-mono text-slate-800">#{tx.user.id}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/admin/user/${tx.user.id}/edit`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    <span>Lihat Profil User</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">
                <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Tidak terhubung ke pengguna (Guest / Anonymous ID: {tx.user_id || "null"})</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Transaksi</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus transaksi deposit{" "}
                <strong className="text-slate-800 font-mono">{tx.order_id}</strong>? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
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

