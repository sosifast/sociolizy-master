"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Percent,
  DollarSign,
  ArrowDownToLine,
  RefreshCw,
  Check,
  AlertCircle,
  ShieldCheck,
  Zap,
  Coins,
} from "lucide-react";

export default function AdminMerchantSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [feePercent, setFeePercent] = useState("1.0");
  const [feeFixed, setFeeFixed] = useState("0.10");
  const [minWithdrawal, setMinWithdrawal] = useState("10.00");
  const [maxWithdrawal, setMaxWithdrawal] = useState("50000.00");
  const [autoEnabled, setAutoEnabled] = useState(true);
  const [allowedCoins, setAllowedCoins] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/merchant/settings");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memuat pengaturan");
      }
      setData(json.data);
      setFeePercent(String(json.data.adminFeePercent ?? 1.0));
      setFeeFixed(String(json.data.adminFeeFixed ?? 0.1));
      setMinWithdrawal(String(json.data.minWithdrawal ?? 10.0));
      setMaxWithdrawal(String(json.data.maxWithdrawal ?? 50000.0));
      setAutoEnabled(Boolean(json.data.autoWithdrawalEnabled ?? true));
      setAllowedCoins(
        Array.isArray(json.data.allowedCoins)
          ? json.data.allowedCoins
          : (json.data.availableCoins || []).map((c: any) => `${c.symbol}_${c.network}`)
      );
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const toggleCoin = (key: string) => {
    setAllowedCoins((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setFormError("");

    try {
      const res = await fetch("/api/admin/merchant/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminFeePercent: parseFloat(feePercent) || 0,
          adminFeeFixed: parseFloat(feeFixed) || 0,
          minWithdrawal: parseFloat(minWithdrawal) || 1,
          maxWithdrawal: parseFloat(maxWithdrawal) || 50000,
          autoWithdrawalEnabled: autoEnabled,
          allowedCoins,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyimpan pengaturan");
      }

      setSuccessMsg("Pengaturan Fee Admin & Min Penarikan berhasil disimpan!");
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchSettings();
    } catch (err: any) {
      setFormError(err?.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
        <span className="text-xs">Memuat konfigurasi gateway...</span>
      </div>
    );
  }

  const { availableCoins = [], cryptomusConfigured, cryptomusPayoutConfigured } = data || {};

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Pengaturan Merchant Payment Gateway
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Konfigurasi fee platform admin, batas minimum penarikan saldo, serta koin crypto global.
        </p>
      </div>

      {/* Backend Gateway Status Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Status Backend Engine Crypto Gateway</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                White-Label Mode
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Pembayaran:{" "}
              <strong className={cryptomusConfigured ? "text-emerald-400" : "text-rose-400"}>
                {cryptomusConfigured ? "Siap / Terkonfigurasi" : "Belum Dikonfigurasi"}
              </strong>{" "}
              • Payout:{" "}
              <strong className={cryptomusPayoutConfigured ? "text-emerald-400" : "text-amber-400"}>
                {cryptomusPayoutConfigured ? "Aktif Otomatis" : "Manual Approval Mode"}
              </strong>
            </div>
          </div>
        </div>

        <a
          href="/admin/cryptomus/setup"
          className="text-xs text-emerald-400 hover:underline font-semibold whitespace-nowrap self-start sm:self-auto"
        >
          Konfigurasi Kunci API &rarr;
        </a>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {successMsg && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {formError && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Section B.2: Setup Fee Admin */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Setup Fee Admin Gateway (Fitur B.2)</h2>
              <p className="text-xs text-slate-400">
                Tentukan persentase dan biaya flat yang dipotong platform untuk setiap transaksi pembayaran merchant.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Fee Persentase Admin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Contoh: 1.0% dipotong dari total invoice pelanggan.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Fee Flat Per Transaksi ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={feeFixed}
                  onChange={(e) => setFeeFixed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Biaya tambahan tetap per invoice (contoh: $0.10 USD).
              </span>
            </div>
          </div>
        </div>

        {/* Section B.4: Setup Min Transaction Withdrawal */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <ArrowDownToLine className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Setup Min Transaction Penarikan / Withdrawal (Fitur B.4)
              </h2>
              <p className="text-xs text-slate-400">
                Atur ambang batas minimum dan maksimum dana yang dapat ditarik oleh member.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Minimum Penarikan Saldo ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Member tidak dapat menarik saldo di bawah nominal ini.
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Maksimum Penarikan Per Transaksi ($ USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  value={maxWithdrawal}
                  onChange={(e) => setMaxWithdrawal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Batas maksimum penarikan dalam sekali request.
              </span>
            </div>
          </div>

          {/* Master Auto-Withdrawal Switch */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-white">
                Aktifkan Fitur Auto-Withdrawal Secara Global
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Jika dinonaktifkan, seluruh penarikan member akan dialihkan ke mode persetujuan manual admin.
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => setAutoEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>

        {/* Global Supported Coins */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Daftar Koin Global Platform</h2>
              <p className="text-xs text-slate-400">
                Pilih koin & jaringan crypto yang diizinkan untuk digunakan oleh merchant di platform Anda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {availableCoins.map((coin: any) => {
              const key = `${coin.symbol}_${coin.network}`;
              const isChecked = allowedCoins.includes(key);
              return (
                <label
                  key={key}
                  onClick={() => toggleCoin(key)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/50 text-white shadow-xs"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-xs">{coin.symbol}</div>
                    <div className="text-[10px] text-slate-400 uppercase">{coin.network}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? "Menyimpan Konfigurasi..." : "Simpan Semua Pengaturan Gateway"}
        </button>
      </form>
    </div>
  );
}

