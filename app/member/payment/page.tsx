"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  HelpCircle,
  ExternalLink,
  Sparkles,
  AlertCircle,
  QrCode,
} from "lucide-react";

export default function MemberPaymentPage() {
  const [amount, setAmount] = useState<number | string>(10);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [selectedGateway, setSelectedGateway] = useState("cryptomus");
  const [isProcessing, setIsProcessing] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const presetAmounts = [5, 10, 25, 50, 100, 250];

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setInfoMessage(
      "The Cryptomus payment gateway is ready to process your deposit. You will be redirected to the secure cryptocurrency payment invoice."
    );
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Account Deposit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Deposit &amp; Payment
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Top up your account balance instantly and automatically via official cryptocurrency payment gateways.
          </p>
        </div>

        <Link
          href="/member/history/deposit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0c1222] border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Receipt className="w-4 h-4 text-emerald-400" />
          <span>View Deposit History</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Deposit */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-400" />
              <span>Select Method &amp; Amount</span>
            </h2>

            {/* Gateway Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGateway("cryptomus")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedGateway === "cryptomus"
                      ? "bg-indigo-600/10 border-indigo-500/60 ring-1 ring-indigo-500/40"
                      : "bg-[#070b14] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-white">Cryptomus Gateway</span>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Instant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    USDT (TRC20/ERC20/BEP20), BTC, ETH, TON, LTC, BNB, TRX, SOL &amp; 30+ Cryptos.
                  </p>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleDepositSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Deposit Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400 text-base">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="10.00"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#070b14] border border-slate-800 text-white font-mono font-bold text-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Preset quick buttons */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-2">
                  Quick Select Amount:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        Number(amount) === preset
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-[#070b14] border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {infoMessage && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p>{infoMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !amount || Number(amount) <= 0}
                className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isProcessing ? "Preparing Payment Invoice..." : `Proceed to Deposit $${Number(amount || 0).toFixed(2)}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Instructions & Security */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#0c1222] border border-slate-800 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Deposit Instructions</span>
            </h3>

            <div className="space-y-3 text-slate-400">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <p>Enter the USD amount you wish to deposit (Minimum $5.00).</p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <p>Click Proceed to open the official cryptocurrency payment invoice.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <p>Send cryptocurrency to the provided address and exact amount before expiration.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <p>Once confirmed by the blockchain network, your account balance will update automatically.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Need Payment Help?</span>
            </div>
            <Link
              href="/page/contact-us"
              className="text-indigo-400 hover:underline font-bold text-[11px]"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
