"use client";

import React, { useState, useEffect } from "react";
import {
  Wallet,
  ArrowDownToLine,
  RefreshCw,
  Check,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";

export default function MerchantWithdrawPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Setup Form
  const [setupCoin, setSetupCoin] = useState("USDT");
  const [setupNetwork, setSetupNetwork] = useState("tron");
  const [setupAddress, setSetupAddress] = useState("");
  const [setupAuto, setSetupAuto] = useState(false);
  const [setupThreshold, setSetupThreshold] = useState("50");
  const [savingSetup, setSavingSetup] = useState(false);
  const [setupSuccess, setSetupSuccess] = useState("");
  const [setupError, setSetupError] = useState("");

  // Manual Withdraw Form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/merchant/withdraw");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load withdrawal data");
      }
      setData(json.data);

      if (json.data.setting) {
        setSetupCoin(json.data.setting.coin);
        setSetupNetwork(json.data.setting.network);
        setSetupAddress(json.data.setting.address);
        setSetupAuto(json.data.setting.autoWithdraw);
        setSetupThreshold(String(json.data.setting.threshold || 50));
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupAddress.trim()) {
      setSetupError("Crypto destination address is required.");
      return;
    }

    setSavingSetup(true);
    setSetupSuccess("");
    setSetupError("");

    try {
      const res = await fetch("/api/merchant/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setup",
          coin: setupCoin,
          network: setupNetwork,
          address: setupAddress.trim(),
          autoWithdraw: setupAuto,
          threshold: parseFloat(setupThreshold) || 50,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save withdrawal configuration");
      }

      setSetupSuccess("Crypto destination wallet & auto-withdrawal settings saved successfully!");
      setTimeout(() => setSetupSuccess(""), 4000);
      fetchData();
    } catch (err: any) {
      setSetupError(err?.message || "Failed to save settings");
    } finally {
      setSavingSetup(false);
    }
  };

  const handleManualWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);
    if (!amountNum || amountNum <= 0) {
      setWithdrawError("Withdrawal amount must be greater than 0.");
      return;
    }

    if (!setupAddress.trim()) {
      setWithdrawError("Please set your crypto destination address first in the left configuration box.");
      return;
    }

    setWithdrawing(true);
    setWithdrawSuccess("");
    setWithdrawError("");

    try {
      const res = await fetch("/api/merchant/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "withdraw",
          amount: amountNum,
          coin: setupCoin,
          network: setupNetwork,
          address: setupAddress.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to process withdrawal");
      }

      setWithdrawSuccess("Withdrawal request submitted successfully!");
      setWithdrawAmount("");
      setTimeout(() => setWithdrawSuccess(""), 4000);
      fetchData();
    } catch (err: any) {
      setWithdrawError(err?.message || "Failed to process withdrawal");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
        <span className="text-xs">Loading withdrawal settings...</span>
      </div>
    );
  }

  const {
    balance = 0,
    lockedBalance = 0,
    totalWithdrawn = 0,
    minWithdrawal = 10,
    maxWithdrawal = 50000,
    history = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Withdrawals & Auto-Withdraw Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure your crypto destination payout wallet and enable automated background withdrawals.
        </p>
      </div>

      {/* Balance Summary Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-lg shadow-black/20">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold text-emerald-400 uppercase tracking-wider">
              Available Balance
            </span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${Number(balance).toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Minimum withdrawal: ${Number(minWithdrawal).toFixed(2)} USD
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Processing Payouts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${Number(lockedBalance).toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Currently queued for blockchain settlement
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider">Total Withdrawn</span>
            <ArrowDownToLine className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${Number(totalWithdrawn).toFixed(2)}{" "}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Completed payouts to your crypto addresses
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Setup Crypto & Auto-Withdrawal (7 cols) - Requirement A.5 & A.6 */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Setup Crypto & Auto-Withdrawal
              </h2>
              <p className="text-xs text-slate-400">
                Automatically sweep your merchant earnings directly to your personal crypto wallet.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSetup} className="space-y-4">
            {setupSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{setupSuccess}</span>
              </div>
            )}

            {setupError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{setupError}</span>
              </div>
            )}

            {/* Coin & Network Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Payout Coin
                </label>
                <select
                  value={setupCoin}
                  onChange={(e) => setSetupCoin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="USDT">USDT (Tether)</option>
                  <option value="USDC">USDC (USD Coin)</option>
                  <option value="BTC">BTC (Bitcoin)</option>
                  <option value="ETH">ETH (Ethereum)</option>
                  <option value="TRX">TRX (TRON)</option>
                  <option value="SOL">SOL (Solana)</option>
                  <option value="TON">TON (Toncoin)</option>
                  <option value="LTC">LTC (Litecoin)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Network
                </label>
                <select
                  value={setupNetwork}
                  onChange={(e) => setSetupNetwork(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="tron">TRON (TRC20) - Recommended</option>
                  <option value="bsc">BNB Smart Chain (BEP20)</option>
                  <option value="polygon">Polygon (MATIC)</option>
                  <option value="sol">Solana Network</option>
                  <option value="ton">TON Network</option>
                  <option value="btc">Bitcoin Core</option>
                  <option value="eth">Ethereum (ERC20)</option>
                  <option value="ltc">Litecoin Core</option>
                </select>
              </div>
            </div>

            {/* Crypto Address */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Destination Crypto Address *
              </label>
              <input
                type="text"
                value={setupAddress}
                onChange={(e) => setSetupAddress(e.target.value)}
                placeholder="e.g. TXXX... (TRC20) or 0x... (BEP20)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Ensure your wallet address strictly matches the selected network to prevent loss of funds.
              </span>
            </div>

            {/* Auto-Withdrawal Toggle & Threshold (Requirement A.5) */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Enable Auto-Withdrawal</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                      AUTO
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Automatically triggers a payout whenever your balance meets or exceeds the threshold.
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={setupAuto}
                    onChange={(e) => setSetupAuto(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {setupAuto && (
                <div className="pt-3 border-t border-slate-800/80">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Minimum Balance Trigger Threshold ($ USD)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      step="1"
                      min={minWithdrawal}
                      max={maxWithdrawal}
                      value={setupThreshold}
                      onChange={(e) => setSetupThreshold(e.target.value)}
                      className="w-36 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                    <span className="text-[11px] text-slate-400">
                      (Min limit: ${minWithdrawal} USD)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={savingSetup}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {savingSetup ? "Saving..." : "Save Destination & Auto-Withdraw Settings"}
            </button>
          </form>
        </div>

        {/* Right: Manual Instant Withdrawal Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Manual Instant Withdrawal</h2>
              <p className="text-xs text-slate-400">
                Request an immediate payout to your configured crypto address.
              </p>
            </div>
          </div>

          <form onSubmit={handleManualWithdraw} className="space-y-4">
            {withdrawSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            {withdrawError && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-300">Amount (USD) *</label>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(String(balance))}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Withdraw All (${Number(balance).toFixed(2)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min={minWithdrawal}
                  max={Math.min(balance, maxWithdrawal)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Destination Coin:</span>
                <span className="text-white font-mono font-semibold">
                  {setupCoin} ({setupNetwork?.toUpperCase()})
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Address:</span>
                <span className="font-mono text-[11px] text-slate-300 truncate max-w-[200px]">
                  {setupAddress || "(Not configured yet)"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={withdrawing || balance < minWithdrawal || !setupAddress}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-40"
            >
              {withdrawing ? "Processing Withdrawal..." : "Submit Withdrawal Request"}
            </button>
          </form>
        </div>
      </div>

      {/* Withdrawal History Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md">
        <h2 className="text-base font-bold text-white mb-1">Withdrawal Records</h2>
        <p className="text-xs text-slate-400 mb-4">
          History of all manual and automatic crypto payouts along with blockchain status
        </p>

        {history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No withdrawal history recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Amount (USD)</th>
                  <th className="py-3 px-4">Coin & Network</th>
                  <th className="py-3 px-4">Destination Address</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">TxID</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.map((w: any) => {
                  const isCompleted = w.status === "COMPLETED";
                  const isProcessing = w.status === "PROCESSING";
                  return (
                    <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        ${Number(w.amountUsd).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {w.coin}{" "}
                        <span className="text-[10px] text-slate-500 uppercase">
                          ({w.network})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-[180px] truncate">
                        {w.address}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-slate-400">
                          {w.isAuto ? "⚡ Auto" : "👤 Manual"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                        {new Date(w.createdAt).toLocaleDateString("en-US")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
