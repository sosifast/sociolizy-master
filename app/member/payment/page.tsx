"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Loader2,
  X,
  Shield,
  HelpCircle,
  Coins,
} from "lucide-react";

interface GatewaySetting {
  min_deposit: number;
  max_deposit: number;
  fee_percent: number;
  currency: string;
  is_active: boolean;
  is_test_mode: boolean;
}

interface PendingInvoice {
  id: number;
  order_id: string;
  amount: number;
  currency: string;
  payment_status: string;
  invoice_url: string | null;
  create_at: string;
}

interface CryptoOption {
  id: string;
  name: string;
  symbol: string;
  network: string;
  networkLabel: string;
  badge?: string;
}

const CRYPTO_OPTIONS: CryptoOption[] = [
  { id: "usdt-trc20", name: "Tether USD", symbol: "USDT", network: "tron", networkLabel: "Tron (TRC-20)", badge: "Popular" },
  { id: "usdt-bep20", name: "Tether USD", symbol: "USDT", network: "bsc", networkLabel: "BNB Smart Chain (BEP-20)" },
  { id: "usdt-polygon", name: "Tether USD", symbol: "USDT", network: "polygon", networkLabel: "Polygon Network" },
  { id: "usdt-ton", name: "Tether USD", symbol: "USDT", network: "ton", networkLabel: "TON Network" },
  { id: "btc", name: "Bitcoin", symbol: "BTC", network: "btc", networkLabel: "Bitcoin Network" },
  { id: "eth", name: "Ethereum", symbol: "ETH", network: "eth", networkLabel: "Ethereum (ERC-20)" },
  { id: "sol", name: "Solana", symbol: "SOL", network: "sol", networkLabel: "Solana Network" },
  { id: "trx", name: "Tron", symbol: "TRX", network: "tron", networkLabel: "Tron Network" },
  { id: "ltc", name: "Litecoin", symbol: "LTC", network: "ltc", networkLabel: "Litecoin Network" },
  { id: "doge", name: "Dogecoin", symbol: "DOGE", network: "doge", networkLabel: "Dogecoin Network" },
];

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function MemberPaymentPage() {
  const router = useRouter();
  const [amount, setAmount] = useState<number | string>(25);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(CRYPTO_OPTIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [setting, setSetting] = useState<GatewaySetting>({
    min_deposit: 5,
    max_deposit: 5000,
    fee_percent: 0,
    currency: "USD",
    is_active: true,
    is_test_mode: false,
  });

  const [pendingInvoices, setPendingInvoices] = useState<PendingInvoice[]>([]);

  const fetchGatewayData = async () => {
    try {
      const res = await fetch("/api/member/payment/cryptomus");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.setting) setSetting(json.data.setting);
        if (Array.isArray(json.data.pending_invoices)) setPendingInvoices(json.data.pending_invoices);
      }
    } catch (err) {
      console.error("Failed to load Cryptomus settings:", err);
    }
  };

  useEffect(() => {
    fetchGatewayData();
  }, []);

  const parsedAmount = typeof amount === "number" ? amount : parseFloat(amount) || 0;
  const feeAmount = useMemo(() => {
    if (!parsedAmount || parsedAmount <= 0) return 0;
    return (parsedAmount * (setting.fee_percent || 0)) / 100;
  }, [parsedAmount, setting.fee_percent]);

  const totalToPay = parsedAmount + feeAmount;
  const isAmountValid = parsedAmount >= setting.min_deposit && parsedAmount <= setting.max_deposit;

  const estimatedCrypto = useMemo(() => {
    if (!totalToPay || totalToPay <= 0) return "0.00";
    if (selectedCrypto.symbol === "USDT") return totalToPay.toFixed(2);
    if (selectedCrypto.symbol === "BTC") return (totalToPay / 95000).toFixed(6);
    if (selectedCrypto.symbol === "ETH") return (totalToPay / 3400).toFixed(6);
    if (selectedCrypto.symbol === "SOL") return (totalToPay / 185).toFixed(4);
    if (selectedCrypto.symbol === "TRX") return (totalToPay / 0.2).toFixed(2);
    if (selectedCrypto.symbol === "LTC") return (totalToPay / 100).toFixed(4);
    if (selectedCrypto.symbol === "DOGE") return (totalToPay / 0.25).toFixed(2);
    return totalToPay.toFixed(2);
  }, [totalToPay, selectedCrypto.symbol]);

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || !isAmountValid) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/member/payment/cryptomus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          currency: setting.currency || "USD",
          to_currency: selectedCrypto.symbol,
          network: selectedCrypto.network,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success || !json.data?.order_id) {
        throw new Error(json.message || "Failed to create deposit invoice.");
      }

      // Direct to our own website invoice page with Wallet Address and QR Code
      router.push(`/member/history/deposit/${json.data.order_id}`);
    } catch (err: any) {
      setError(err.message || "Failed to connect to payment gateway.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 bg-white text-slate-900">
      {/* Header section - Clean without fluff */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>Deposit Funds</span>
          </h1>
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Form (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Pending Invoice Notice (if any) */}
          {pendingInvoices.length > 0 && (
            <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">Pending Invoice:</span>{" "}
                  <span className="font-mono text-emerald-700 font-bold">
                    ${pendingInvoices[0].amount.toFixed(2)}
                  </span>{" "}
                  <span className="text-[11px] text-slate-500 font-mono">
                    ({pendingInvoices[0].order_id})
                  </span>
                </div>
              </div>
              <Link
                href={`/member/history/deposit/${pendingInvoices[0].order_id}`}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-colors text-center shadow-xs"
              >
                Pay Now
              </Link>
            </div>
          )}

          {/* Deposit Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-5">
              {/* 1. Crypto Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Select Cryptocurrency &amp; Network</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CRYPTO_OPTIONS.map((crypto) => {
                    const isSelected = selectedCrypto.id === crypto.id;
                    return (
                      <button
                        key={crypto.id}
                        type="button"
                        onClick={() => setSelectedCrypto(crypto)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500 text-slate-900 shadow-2xs"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs">{crypto.symbol}</span>
                            <span className="text-[11px] text-slate-500">({crypto.name})</span>
                            {crypto.badge && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                {crypto.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono">{crypto.networkLabel}</p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Deposit Amount (USD)
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Min: ${setting.min_deposit.toFixed(2)} | Max: ${setting.max_deposit.toLocaleString()}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold font-mono text-base text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    min={setting.min_deposit}
                    max={setting.max_deposit}
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="25.00"
                    className="w-full pl-8 pr-16 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono text-slate-400">
                    USD
                  </span>
                </div>
              </div>

              {/* Preset Amounts */}
              <div>
                <span className="text-xs text-slate-500 block mb-1.5 font-medium">Quick Select Amount:</span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset)}
                      className={`py-1.5 sm:py-2 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer text-center ${
                        Number(amount) === preset
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-50 border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimation Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Payment Currency:</span>
                  <span className="font-bold text-slate-900">{selectedCrypto.name} ({selectedCrypto.symbol})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Network:</span>
                  <span className="font-semibold text-emerald-700 font-mono">{selectedCrypto.networkLabel}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-slate-700 font-bold">Estimated Crypto to Send:</span>
                  <span className="font-mono font-extrabold text-emerald-600 text-sm sm:text-base">
                    ≈ {estimatedCrypto} {selectedCrypto.symbol}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing || !isAmountValid}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Payment Invoice...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ${parsedAmount > 0 ? totalToPay.toFixed(2) : "0.00"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Deposit Terms</span>
            </h3>

            <ul className="space-y-2 text-slate-600 text-xs leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Minimum deposit is <strong>${setting.min_deposit.toFixed(2)} USD</strong>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Invoices directly generate an official deposit wallet address and QR code.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Your account balance will be credited automatically once the transaction is confirmed on the blockchain.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-600">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Need payment assistance?</span>
            </div>
            <Link
              href="/member/ticket/create"
              className="text-emerald-600 hover:text-emerald-700 font-bold text-xs"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
