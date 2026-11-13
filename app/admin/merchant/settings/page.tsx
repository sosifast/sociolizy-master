"use client";

import React, { useState, useEffect } from "react";
import {
  Percent,
  ArrowDownToLine,
  RefreshCw,
  Check,
  AlertCircle,
  Coins,
} from "lucide-react";

export default function AdminMerchantSettingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        throw new Error(json.message || "Gagal memuat");
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
        throw new Error(json.message || "Gagal menyimpan");
      }

      setSuccessMsg("Pengaturan tersimpan");
      setTimeout(() => setSuccessMsg(""), 3000);
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
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
        <span className="text-xs font-normal text-slate-500">Memuat...</span>
      </div>
    );
  }

  const { availableCoins = [] } = data || {};

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Pengaturan Merchant Gateway
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {formError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Section 1: Fee */}
        <div className="spectrum-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-2 border-b border-slate-100">
            <Percent className="w-4 h-4 text-emerald-600" />
            <span>Fee Transaksi</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Fee Persentase (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  value={feePercent}
                  onChange={(e) => setFeePercent(e.target.value)}
                  className="spectrum-input w-full bg-white text-slate-800 text-xs py-2 px-3 pr-8"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Fee Tetap ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={feeFixed}
                  onChange={(e) => setFeeFixed(e.target.value)}
                  className="spectrum-input w-full bg-white text-slate-800 text-xs py-2 pl-7 pr-3"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Withdrawal */}
        <div className="spectrum-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-2 border-b border-slate-100">
            <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
            <span>Batas Penarikan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Minimum ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={minWithdrawal}
                  onChange={(e) => setMinWithdrawal(e.target.value)}
                  className="spectrum-input w-full bg-white text-slate-800 text-xs py-2 pl-7 pr-3"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Maksimum ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  value={maxWithdrawal}
                  onChange={(e) => setMaxWithdrawal(e.target.value)}
                  className="spectrum-input w-full bg-white text-slate-800 text-xs py-2 pl-7 pr-3"
                  required
                />
              </div>
            </div>
          </div>

          {/* Auto-Withdrawal Switch */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-800">
              Auto-Withdrawal
            </span>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoEnabled}
                onChange={(e) => setAutoEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>

        {/* Section 3: Allowed Coins */}
        <div className="spectrum-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs pb-2 border-b border-slate-100">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Koin & Jaringan</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {availableCoins.map((coin: any) => {
              const key = `${coin.symbol}_${coin.network}`;
              const isChecked = allowedCoins.includes(key);
              return (
                <label
                  key={key}
                  onClick={() => toggleCoin(key)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? "bg-emerald-50/80 border-emerald-500 text-slate-900 ring-1 ring-emerald-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-0"
                  />
                  <div>
                    <div className="font-bold text-xs text-slate-900">{coin.symbol}</div>
                    <div className="text-[10px] text-slate-500 uppercase">{coin.network}</div>
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
          className="spectrum-btn-primary w-full py-2.5 text-xs font-bold cursor-pointer disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </form>
    </div>
  );
}
