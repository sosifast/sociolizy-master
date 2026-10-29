"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Coins,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

export interface SyncBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: number;
    name: string;
    slug: string;
    url: string;
    balance: number | string;
  } | null;
  onSuccess: (providerId: number, newBalance: number) => void;
}

export default function SyncBalanceModal({
  isOpen,
  onClose,
  provider,
  onSuccess,
}: SyncBalanceModalProps) {
  const { toast } = useToast();

  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data from API
  const [apiBalance, setApiBalance] = useState<string | null>(null);
  const [targetBalance, setTargetBalance] = useState<number>(0);

  // Fetch balance function
  const fetchBalanceFromApi = async () => {
    if (!provider) return;
    setIsLoadingApi(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/provider/${provider.id}/sync-balance`, {
        method: "POST",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.message || "Gagal mengambil saldo dari server provider");
        setIsLoadingApi(false);
        return;
      }

      const balanceStr = String(json.data.balance || "0");
      setApiBalance(balanceStr);
      setTargetBalance(parseFloat(balanceStr) || 0);
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan jaringan saat menghubungi API provider.");
    } finally {
      setIsLoadingApi(false);
    }
  };

  // When modal opens, auto-fetch balance
  useEffect(() => {
    if (isOpen && provider) {
      setError(null);
      setApiBalance(null);
      setTargetBalance(Number(provider.balance || 0));
      fetchBalanceFromApi();
    }
  }, [isOpen, provider?.id]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSaving) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isSaving, onClose]);

  // Save new balance to database
  const handleSaveToDatabase = async () => {
    if (!provider) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/provider/${provider.id}/sync-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          save: true,
          balance: targetBalance,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.message || "Gagal menyimpan saldo ke database");
        toast.error("Gagal Menyimpan", json.message || "Gagal mengupdate saldo");
        setIsSaving(false);
        return;
      }

      toast.success(
        "Saldo Berhasil Disinkronkan",
        `Saldo "${provider.name}" diperbarui menjadi $${Number(targetBalance).toFixed(2)}`
      );
      onSuccess(provider.id, targetBalance);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan jaringan saat menyimpan data saldo.");
      toast.error("Kesalahan Jaringan", "Tidak dapat menyimpan data ke database");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !provider) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={() => {
          if (!isSaving && !isLoadingApi) onClose();
        }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-6 z-10 animate-in zoom-in-95 fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving || isLoadingApi}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          title="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs flex-shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Sinkronisasi Saldo
            </h3>
            <p className="text-xs text-slate-500">
              Provider: <span className="font-semibold text-slate-800">{provider.name}</span>
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-bold block">Gagal:</span>
              <span className="text-[11px] leading-relaxed break-words">{error}</span>
            </div>
          </div>
        )}

        {/* Balance Comparison Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Saldo Saat Ini
            </span>
            <span className="text-sm font-bold font-mono text-slate-800 mt-1 block">
              ${Number(provider.balance || 0).toFixed(2)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-red-50/50 border border-red-100">
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
              Saldo API Provider
            </span>
            {isLoadingApi ? (
              <div className="flex items-center gap-1.5 mt-1 text-red-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="text-xs font-medium">Memeriksa...</span>
              </div>
            ) : apiBalance !== null ? (
              <span className="text-sm font-bold font-mono text-red-600 mt-1 block">
                ${Number(apiBalance).toFixed(2)}
              </span>
            ) : (
              <span className="text-xs text-slate-400 mt-1 block">-</span>
            )}
          </div>
        </div>

        {/* Target Balance Input */}
        {apiBalance !== null && (
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Saldo yang Disimpan ($):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400 font-mono">
                  $
                </span>
                <input
                  type="number"
                  step="any"
                  value={targetBalance}
                  onChange={(e) => setTargetBalance(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={fetchBalanceFromApi}
            disabled={isLoadingApi || isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApi ? "animate-spin text-red-600" : ""}`} />
            <span>Cek Ulang</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={isSaving || isLoadingApi || apiBalance === null}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Saldo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
