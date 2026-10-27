"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowRightLeft,
  DollarSign,
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
  const [apiCurrency, setApiCurrency] = useState<string>("USD");

  // Conversion state
  const [exchangeRate, setExchangeRate] = useState<number>(16500); // Kurs default $ -> IDR
  const [calculatedIdr, setCalculatedIdr] = useState<number>(0);

  // Quick exchange rate presets
  const presetRates = [16000, 16250, 16500, 16800];

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
      const curr = String(json.data.currency || "USD").toUpperCase();

      setApiBalance(balanceStr);
      setApiCurrency(curr);

      const numBalance = parseFloat(balanceStr) || 0;

      if (curr === "IDR") {
        setCalculatedIdr(Math.round(numBalance));
      } else {
        // Default USD or other currency: convert with exchange rate
        setCalculatedIdr(Math.round(numBalance * exchangeRate));
      }
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan jaringan saat menghubungi API provider.");
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Recalculate when exchange rate or balance changes
  useEffect(() => {
    if (apiBalance !== null) {
      const numBalance = parseFloat(apiBalance) || 0;
      if (apiCurrency === "IDR") {
        setCalculatedIdr(Math.round(numBalance));
      } else {
        setCalculatedIdr(Math.round(numBalance * exchangeRate));
      }
    }
  }, [exchangeRate, apiBalance, apiCurrency]);

  // When modal opens, auto-fetch balance
  useEffect(() => {
    if (isOpen && provider) {
      setError(null);
      setApiBalance(null);
      setApiCurrency("USD");
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
          balance_idr: calculatedIdr,
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
        `Saldo "${provider.name}" diperbarui menjadi Rp ${calculatedIdr.toLocaleString("id-ID")}`
      );
      onSuccess(provider.id, calculatedIdr);
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
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95 fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSaving || isLoadingApi}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          title="Tutup dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shadow-xs flex-shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div className="pt-0.5">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
              Sync Saldo Provider
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Provider: <span className="font-bold text-slate-800">{provider.name}</span>
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-800 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="font-bold block">Gagal Sinkronisasi Saldo:</span>
              <span className="text-[11px] leading-relaxed break-words">{error}</span>
            </div>
          </div>
        )}

        {/* Current Database Balance Card */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Saldo di Database
            </span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-slate-800 mt-1 block">
              Rp {Number(provider.balance || 0).toLocaleString("id-ID")}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100">
            <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">
              Saldo API Terdeteksi
            </span>
            {isLoadingApi ? (
              <div className="flex items-center gap-1.5 mt-1.5 text-red-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-semibold">Mengambil...</span>
              </div>
            ) : apiBalance !== null ? (
              <span className="text-sm sm:text-base font-extrabold font-mono text-red-600 mt-1 block">
                {apiCurrency === "USD" ? "$" : ""} {Number(apiBalance).toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 5 })} {apiCurrency !== "USD" ? apiCurrency : ""}
              </span>
            ) : (
              <span className="text-xs text-slate-400 mt-1.5 block">Belum ada respon</span>
            )}
          </div>
        </div>

        {/* Currency Converter Form */}
        {apiBalance !== null && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            {apiCurrency === "USD" ? (
              <div className="space-y-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                    <span>Konversi Kurs Dollar ($) ke IDR (Rp)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-800">
                    Mata Uang API: USD
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kurs 1 USD = Berapa Rupiah? (IDR)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-400 font-mono">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(Number(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Rate Presets */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset Kurs:</span>
                    {presetRates.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setExchangeRate(rate)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                          exchangeRate === rate
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:border-amber-400"
                        }`}
                      >
                        Rp {rate.toLocaleString("id-ID")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation breakdown */}
                <div className="p-2.5 rounded-xl bg-white border border-amber-200/50 text-[11px] text-slate-600 flex items-center justify-between font-mono">
                  <span>
                    ${Number(apiBalance).toFixed(2)} × Rp {exchangeRate.toLocaleString("id-ID")}
                  </span>
                  <span className="font-extrabold text-amber-900 text-xs">
                    = Rp {calculatedIdr.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Mata uang provider terdeteksi langsung dalam <strong>{apiCurrency}</strong> (tanpa perlu konversi kurs USD).</span>
              </div>
            )}

            {/* Final Target Balance to Save */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Saldo Akhir yang Akan Disimpan ke Database (IDR):
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500 font-mono">
                  Rp
                </span>
                <input
                  type="number"
                  value={calculatedIdr}
                  onChange={(e) => setCalculatedIdr(Number(e.target.value) || 0)}
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl text-sm font-mono font-bold bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Terbaca: <strong>Rp {calculatedIdr.toLocaleString("id-ID")}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={fetchBalanceFromApi}
            disabled={isLoadingApi || isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
            title="Cek ulang saldo ke API provider"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApi ? "animate-spin text-red-600" : ""}`} />
            <span>Cek Ulang</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSaveToDatabase}
              disabled={isSaving || isLoadingApi || apiBalance === null}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm shadow-red-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Saldo ke Database</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
