"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  Key,
  ShieldCheck,
  Save,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Globe,
  DollarSign,
  Percent,
  CheckCircle2,
  FileText,
  Lock,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import { useCachedFetch, clientCache } from "@/lib/client-cache";

export default function AdminCryptomusSetupPage() {
  const { toast } = useToast();

  // State
  const [merchantId, setMerchantId] = useState("");
  const [paymentKey, setPaymentKey] = useState("");
  const [payoutKey, setPayoutKey] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [returnUrl, setReturnUrl] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [rateUsd, setRateUsd] = useState<string | number>("16000");
  const [minDeposit, setMinDeposit] = useState<string | number>("5");
  const [maxDeposit, setMaxDeposit] = useState<string | number>("5000");
  const [feePercent, setFeePercent] = useState<string | number>("0");
  const [isActive, setIsActive] = useState(false);
  const [isTestMode, setIsTestMode] = useState(true);

  // UI state
  const [showPaymentKey, setShowPaymentKey] = useState(false);
  const [showPayoutKey, setShowPayoutKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedReturn, setCopiedReturn] = useState(false);

  // Fetch setup data
  const { data: cryptomusData, isLoading, refresh } = useCachedFetch<any>(
    "/api/admin/cryptomus/setup",
    {
      ttlMs: 60_000,
      onSuccess: (data) => {
        if (data) {
          populateForm(data);
        }
      },
    }
  );

  const populateForm = (data: any) => {
    if (data.merchant_id !== undefined) setMerchantId(data.merchant_id || "");
    if (data.payment_key !== undefined) setPaymentKey(data.payment_key || "");
    if (data.payout_key !== undefined) setPayoutKey(data.payout_key || "");
    if (data.webhook_url !== undefined) setWebhookUrl(data.webhook_url || "");
    if (data.return_url !== undefined) setReturnUrl(data.return_url || "");
    if (data.currency) setCurrency(data.currency);
    if (data.rate_usd !== undefined) setRateUsd(String(data.rate_usd));
    if (data.min_deposit !== undefined) setMinDeposit(String(data.min_deposit));
    if (data.max_deposit !== undefined) setMaxDeposit(String(data.max_deposit));
    if (data.fee_percent !== undefined) setFeePercent(String(data.fee_percent));
    if (data.is_active !== undefined) setIsActive(Boolean(data.is_active));
    if (data.is_test_mode !== undefined) setIsTestMode(Boolean(data.is_test_mode));
  };

  useEffect(() => {
    if (cryptomusData) {
      populateForm(cryptomusData);
    }
  }, [cryptomusData]);

  // Fallback defaults for URL based on current origin if empty
  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      if (!webhookUrl) {
        setWebhookUrl(`${origin}/api/payment/cryptomus/webhook`);
      }
      if (!returnUrl) {
        setReturnUrl(`${origin}/member/history/deposit`);
      }
    }
  }, [webhookUrl, returnUrl]);

  const handleCopy = (text: string, type: "webhook" | "return") => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === "webhook") {
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
      } else {
        setCopiedReturn(true);
        setTimeout(() => setCopiedReturn(false), 2000);
      }
      toast.success("Berhasil Disalin", `${type === "webhook" ? "Webhook" : "Return"} URL disalin ke clipboard.`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/cryptomus/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          payment_key: paymentKey,
          payout_key: payoutKey,
          webhook_url: webhookUrl,
          return_url: returnUrl,
          currency,
          rate_usd: Number(rateUsd) || 16000,
          min_deposit: Number(minDeposit) || 1,
          max_deposit: Number(maxDeposit) || 10000,
          fee_percent: Number(feePercent) || 0,
          is_active: isActive,
          is_test_mode: isTestMode,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyimpan konfigurasi");
      }

      clientCache.invalidate("/api/admin/cryptomus/setup");
      toast.success("Berhasil Disimpan", "Pengaturan payment gateway Cryptomus berhasil diperbarui.");
    } catch (err) {
      console.error("Save Cryptomus error:", err);
      toast.error("Gagal Menyimpan", err instanceof Error ? err.message : "Terjadi kesalahan koneksi");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Setup Cryptomus Gateway
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Konfigurasi merchant, API keys, webhook callback, dan aturan kurs deposit kripto
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {isActive ? "Gateway Aktif" : "Gateway Non-Aktif"}
          </span>

          <span
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isTestMode
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-indigo-50 text-indigo-700 border border-indigo-200"
            }`}
          >
            {isTestMode ? "Sandbox (Test)" : "Live (Production)"}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Memuat konfigurasi Cryptomus...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Status & Mode Operasional */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Status & Mode Operasional</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Toggle Aktif */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-900 block cursor-pointer">
                    Aktifkan Pembayaran Cryptomus
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Izinkan member melakukan deposit otomatis menggunakan mata uang kripto
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Toggle Sandbox / Live */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-slate-900 block cursor-pointer">
                    Mode Sandbox (Test Payment)
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gunakan lingkungan uji coba Cryptomus sebelum beralih ke transaksi nyata
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={isTestMode}
                    onChange={(e) => setIsTestMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. Kredensial API Cryptomus */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Kredensial API Cryptomus</span>
            </h3>

            <div className="space-y-4">
              {/* Merchant ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Merchant ID (UUID)</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Didapat dari dashboard Cryptomus &gt; Settings
                  </span>
                </label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  placeholder="Contoh: a8f7c9e0-1234-5678-9abc-def012345678"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Payment API Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Payment API Key</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Digunakan untuk membuat invoice & verifikasi signature IPN
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPaymentKey ? "text" : "password"}
                    value={paymentKey}
                    onChange={(e) => setPaymentKey(e.target.value)}
                    placeholder="Masukkan kunci API Payment Cryptomus"
                    className="w-full pr-10 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPaymentKey(!showPaymentKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPaymentKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Payout API Key */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Payout API Key (Opsional)</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Diperlukan jika mengaktifkan fitur penarikan/refund otomatis
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPayoutKey ? "text" : "password"}
                    value={payoutKey}
                    onChange={(e) => setPayoutKey(e.target.value)}
                    placeholder="Masukkan kunci API Payout Cryptomus (opsional)"
                    className="w-full pr-10 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPayoutKey(!showPayoutKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPayoutKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. URL Webhook Callback & Redirect */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>Integrasi Webhook Callback & Pengalihan</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Webhook Callback URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Webhook Callback URL (IPN)</span>
                  <span className="text-[11px] text-amber-600 font-medium">
                    Wajib didaftarkan di dashboard Cryptomus
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://domain.com/api/payment/cryptomus/webhook"
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(webhookUrl, "webhook")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWebhook ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Cryptomus akan mengirimkan notifikasi status pembayaran (paid, expired, failed) ke URL ini.
                </p>
              </div>

              {/* Return / Redirect URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Return / Success Redirect URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={returnUrl}
                    onChange={(e) => setReturnUrl(e.target.value)}
                    placeholder="https://domain.com/member/history/deposit"
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-mono font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(returnUrl, "return")}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    {copiedReturn ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedReturn ? "Tersalin" : "Salin"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Halaman tujuan member setelah menyelesaikan pembayaran di checkout Cryptomus.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Mata Uang, Kurs & Batasan Deposit */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              <span>Mata Uang, Kurs Konversi & Batasan Nominal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Base Currency */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mata Uang Faktur
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="USD">USD (United States Dollar)</option>
                  <option value="USDT">USDT (Tether USD)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              {/* Rate USD */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Kurs Konversi (1 {currency} = Saldo)
                </label>
                <input
                  type="number"
                  step="any"
                  value={rateUsd}
                  onChange={(e) => setRateUsd(e.target.value)}
                  required
                  placeholder="16000"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Minimal Deposit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Minimal Deposit ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={minDeposit}
                  onChange={(e) => setMinDeposit(e.target.value)}
                  required
                  placeholder="5"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              {/* Maksimal Deposit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Maksimal Deposit ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={maxDeposit}
                  onChange={(e) => setMaxDeposit(e.target.value)}
                  required
                  placeholder="5000"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Biaya Admin / Fee % */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-slate-500" />
                  <span>Biaya Admin / Fee Markup (%)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Masukkan nilai 0 jika tidak mengenakan biaya admin tambahan kepada pengguna.
                </p>
              </div>

              {/* Estimasi Kalkulasi Contoh */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-center text-xs text-slate-600">
                <span className="font-bold text-slate-800 mb-1">Simulasi Deposit:</span>
                <span>
                  Deposit <strong>10 {currency}</strong> = Saldo Masuk:{" "}
                  <strong className="text-emerald-600">
                    Rp {(10 * Number(rateUsd || 16000)).toLocaleString("id-ID")}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* 5. Panduan Singkat Cryptomus */}
          <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1.5 text-xs text-indigo-900 leading-relaxed">
              <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Panduan Menghubungkan Cryptomus:</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-indigo-800 pl-1">
                <li>Buka akun merchant di dashboard Cryptomus dan selesaikan verifikasi profil.</li>
                <li>Buat Merchant baru di menu <strong>Merchant &gt; Create</strong>.</li>
                <li>Salin <strong>Merchant ID</strong> dan buat <strong>Payment API Key</strong>.</li>
                <li>Tempelkan Webhook Callback URL di atas pada kolom <strong>Webhook URL</strong> di pengaturan Cryptomus.</li>
                <li>Uji pembayaran menggunakan mode Sandbox sebelum beralih ke Live.</li>
              </ol>
            </div>

            <a
              href="https://cryptomus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100/50 shadow-xs transition-colors shrink-0"
            >
              <span>Dashboard Cryptomus</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Submit Button Bar */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Konfigurasi</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
