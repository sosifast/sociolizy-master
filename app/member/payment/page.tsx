"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Receipt,
  ExternalLink,
  AlertCircle,
  Loader2,
  X,
  Shield,
  HelpCircle,
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

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function MemberPaymentPage() {
  const [amount, setAmount] = useState<number | string>(25);
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
  const [userBalance, setUserBalance] = useState<number>(0);

  // Success modal
  const [createdInvoice, setCreatedInvoice] = useState<{
    order_id: string;
    amount: number;
    currency: string;
    invoice_url: string;
  } | null>(null);

  const fetchGatewayData = async () => {
    try {
      const res = await fetch("/api/member/payment/cryptomus");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.setting) setSetting(json.data.setting);
        if (json.data.user?.balance !== undefined) setUserBalance(json.data.user.balance);
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

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || !isAmountValid) return;
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/member/payment/cryptomus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parsedAmount, currency: setting.currency || "USD" }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create invoice");
      }

      setCreatedInvoice({
        order_id: json.data.order_id,
        amount: json.data.amount,
        currency: json.data.currency,
        invoice_url: json.data.invoice_url,
      });

      fetchGatewayData();
    } catch (err: any) {
      setError(err.message || "Failed to connect to payment gateway.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 bg-white text-slate-900">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>Deposit Funds</span>
          </h1>
        </div>

        <Link
          href="/member/history/deposit"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Receipt className="w-3.5 h-3.5 text-emerald-600" />
          <span>Deposit History</span>
        </Link>
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
              {pendingInvoices[0].invoice_url && (
                <a
                  href={pendingInvoices[0].invoice_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-colors text-center shadow-xs"
                >
                  Pay Now
                </a>
              )}
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
                <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}


            <form onSubmit={handleDepositSubmit} className="space-y-4">
              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Amount (USD)
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

              {/* Total Calculation */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-600 font-medium">Total to Pay:</span>
                <span className="font-mono font-bold text-slate-900 text-base sm:text-lg">
                  ${totalToPay.toFixed(2)} USD
                </span>
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
                    <span>Connecting Gateway...</span>
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
              <span>Deposit Notes</span>
            </h3>

            <ul className="space-y-2 text-slate-600 text-xs leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Minimum deposit is <strong>${setting.min_deposit.toFixed(2)} USD</strong>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Invoices are valid for <strong>60 minutes</strong>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-600 font-bold">•</span>
                <span>Your account balance will be credited automatically once the blockchain transaction is confirmed.</span>
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

      {/* Invoice Generated Modal */}
      {createdInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl p-5 sm:p-6 space-y-4 text-center animate-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Invoice Created Successfully</h3>
              <p className="text-xs text-slate-500">
                Complete your cryptocurrency payment using the secure link below.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice ID:</span>
                <span className="font-mono font-bold text-slate-900">{createdInvoice.order_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-mono font-bold text-emerald-600 text-sm">
                  ${createdInvoice.amount.toFixed(2)} {createdInvoice.currency}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={createdInvoice.invoice_url}
                target="_blank"
                rel="noreferrer"
                onClick={() => setCreatedInvoice(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Pay via Cryptomus</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setCreatedInvoice(null)}
                className="w-full py-2 px-3 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
