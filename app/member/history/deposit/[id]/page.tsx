"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  Wallet,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  QrCode,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import QRCode from "qrcode";
import { getPusherClient } from "@/lib/pusher-client";
import { useMemberRealtime } from "@/app/member/components/member-realtime-provider";

interface InvoiceData {
  id: number;
  order_id: string;
  amount: number;
  currency: string;
  crypto_amount: number | string | null;
  crypto_currency: string | null;
  payment_status: string;
  address: string | null;
  network: string | null;
  invoice_url: string | null;
  txid: string | null;
  create_at: string;
  user?: {
    username: string;
    email: string;
    uuid: string;
    current_balance: number;
  };
}

export default function MemberDepositInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderIdParam = resolvedParams.id;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const { showMemberToast, setBalance } = useMemberRealtime();

  const fetchInvoice = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);
        setError(null);

        const res = await fetch(`/api/member/payment/invoice/${orderIdParam}`);
        const json = await res.json();

        if (json.success && json.data) {
          setInvoice(json.data);

          // Generate QR code if address is available
          if (json.data.address) {
            const qrTarget = json.data.address;
            QRCode.toDataURL(qrTarget, {
              width: 280,
              margin: 1,
              color: {
                dark: "#0f172a",
                light: "#ffffff",
              },
            })
              .then((url) => setQrCodeDataUrl(url))
              .catch((qrErr) => console.error("QR Code generate error:", qrErr));
          }
        } else {
          setError(json.message || "Deposit invoice not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load deposit invoice details.");
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [orderIdParam]
  );

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Live Pusher listener for auto-updating status when paid
  useEffect(() => {
    if (!invoice?.user?.uuid) return;

    try {
      const pusher = getPusherClient();
      const channel = pusher.subscribe(`member-${invoice.user.uuid}`);

      channel.bind("deposit-status-updated", (data: any) => {
        if (data?.order_id === orderIdParam || data?.order_id === invoice?.order_id) {
          const newStatus = (data.status || data.payment_status || "").toLowerCase();
          const isPaid = newStatus === "paid" || newStatus === "paid_over";

          setInvoice((prev) => (prev ? { ...prev, payment_status: newStatus } : null));

          if (typeof data.new_balance === "number") {
            setBalance(data.new_balance);
          }

          if (isPaid) {
            showMemberToast(
              "Payment Confirmed!",
              `Deposit ${data.order_id} has been verified on the blockchain. Your balance has been updated.`,
              "success"
            );
          }
        }
      });

      return () => {
        channel.unbind("deposit-status-updated");
        pusher.unsubscribe(`member-${invoice.user?.uuid}`);
      };
    } catch (err) {
      console.warn("[Pusher] Realtime sync error on invoice page:", err);
    }
  }, [invoice?.user?.uuid, invoice?.order_id, orderIdParam, setBalance, showMemberToast]);

  // Auto poll every 10 seconds while pending
  useEffect(() => {
    if (!invoice) return;
    const s = invoice.payment_status.toLowerCase();
    if (s === "paid" || s === "paid_over" || s === "cancel" || s === "expired") {
      return;
    }

    const timer = setInterval(() => {
      fetchInvoice(true);
    }, 10000);

    return () => clearInterval(timer);
  }, [invoice, fetchInvoice]);

  const handleManualCheck = async () => {
    if (isCheckingStatus || !invoice) return;
    setIsCheckingStatus(true);
    try {
      const res = await fetch("/api/member/payment/cryptomus/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: invoice.order_id }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setInvoice((prev) =>
          prev
            ? {
                ...prev,
                payment_status: json.data.payment_status || json.data.status,
              }
            : null
        );
        showMemberToast("Sync Completed", "Transaction status successfully updated.", "info");
      } else {
        showMemberToast("Awaiting Blockchain", "Transaction has not yet been confirmed by the network.", "info");
      }
    } catch {
      showMemberToast("Network Error", "Failed to check blockchain status.", "warning");
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const copyToClipboard = (text: string, type: "address" | "amount") => {
    navigator.clipboard.writeText(text);
    if (type === "address") {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
    showMemberToast(
      "Copied",
      `${type === "address" ? "Wallet address" : "Amount"} copied to clipboard!`,
      "info"
    );
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading payment invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-6 h-6" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 mb-1">Invoice Not Found</h1>
        <p className="text-xs text-slate-500 mb-6">{error || "Deposit details are unavailable or have been deleted."}</p>
        <Link
          href="/member/history/deposit"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Deposit History</span>
        </Link>
      </div>
    );
  }

  const statusLower = invoice.payment_status.toLowerCase();
  const isPaid = statusLower === "paid" || statusLower === "paid_over";
  const isExpired = statusLower === "cancel" || statusLower === "expired" || statusLower === "failed";
  const isPending = !isPaid && !isExpired;

  const cryptoSymbol = (invoice.crypto_currency || "USDT").toUpperCase();
  const cryptoAmountDisplay = invoice.crypto_amount
    ? String(invoice.crypto_amount)
    : `${invoice.amount.toFixed(2)}`;
  const networkName = (invoice.network || "TRON").toUpperCase();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/member/history/deposit"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Deposit History</span>
        </Link>

        {/* Status Pill */}
        <div>
          {isPaid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Payment Confirmed</span>
            </span>
          ) : isExpired ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Invoice Expired</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>Awaiting Payment</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Payment Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Payment Header */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-6">
          <p className="text-xs font-bold tracking-wider uppercase text-slate-400">Deposit Invoice</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {invoice.order_id}
          </h1>
          <div className="inline-flex items-center gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {cryptoAmountDisplay} {cryptoSymbol}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              ≈ ${invoice.amount.toFixed(2)} USD
            </span>
          </div>
        </div>

        {isPaid ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Deposit Successfully Received</h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                The amount of ${invoice.amount.toFixed(2)} USD has been credited to your account balance automatically.
              </p>
            </div>
            {invoice.txid && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left max-w-md mx-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Blockchain TXID</span>
                <span className="font-mono text-xs text-slate-700 break-all select-all font-medium">
                  {invoice.txid}
                </span>
              </div>
            )}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/member/order"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
              >
                <span>Place an Order Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/member"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
              >
                <span>Back to Dashboard</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Payment QR & Address Details */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left: QR Code */}
            <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs mb-3">
                {qrCodeDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrCodeDataUrl}
                    alt="Wallet QR Code"
                    className="w-56 h-56 object-contain"
                  />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-300" />
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-700">Scan QR Code with your crypto wallet</span>
              <span className="text-[11px] text-slate-400">TrustWallet, Binance, OKX, TronLink, Metamask</span>
            </div>

            {/* Right: Payment Instructions & Details */}
            <div className="md:col-span-7 space-y-4">
              {/* Network Warning Banner */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Network Transfer Warning:</span>
                  <p className="mt-0.5 text-amber-800 text-[11px] leading-relaxed">
                    Send only <strong>{cryptoSymbol}</strong> via the{" "}
                    <strong className="underline uppercase">{networkName}</strong> network. Sending any other asset or
                    using a different network will result in permanent loss of funds.
                  </p>
                </div>
              </div>

              {/* Deposit Wallet Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Deposit Wallet Address ({networkName})
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-900 break-all select-all font-semibold">
                    {invoice.address || "Loading wallet address..."}
                  </div>
                  {invoice.address && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(invoice.address || "", "address")}
                      className={`shrink-0 px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        copiedAddress
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                      title="Copy Wallet Address"
                    >
                      {copiedAddress ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAddress ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Exact Amount to Send */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Exact Amount to Send
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-900 font-bold">
                    {cryptoAmountDisplay} {cryptoSymbol}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cryptoAmountDisplay, "amount")}
                    className={`shrink-0 px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedAmount
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                    title="Copy Amount"
                  >
                    {copiedAmount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAmount ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isCheckingStatus}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? "animate-spin" : ""}`} />
                  <span>{isCheckingStatus ? "Checking Blockchain..." : "Check Payment Status"}</span>
                </button>

                {invoice.invoice_url && invoice.invoice_url.startsWith("http") && (
                  <a
                    href={invoice.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <span>View Explorer / Invoice</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Live sync note */}
              <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Status will automatically update once the transaction is confirmed on the blockchain.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
