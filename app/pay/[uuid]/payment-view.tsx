"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  QrCode,
} from "lucide-react";
import Image from "next/image";

interface SupportedCoin {
  symbol: string;
  network: string;
  name: string;
}

interface PaymentViewProps {
  initialTx: {
    uuid: string;
    orderId: string;
    amountUsd: number;
    description: string | null;
    paymentStatus: string;
    cryptoCurrency: string | null;
    cryptoNetwork: string | null;
    cryptoAmount: number | null;
    payAddress: string | null;
    expiresAt: string | null;
    returnUrl: string | null;
    merchantName: string;
  };
  supportedCoins: SupportedCoin[];
  initialQrCode: string;
  siteName: string;
  logo: string;
}

export default function PaymentView({
  initialTx,
  supportedCoins,
  initialQrCode,
  siteName,
  logo,
}: PaymentViewProps) {
  const [selectedCoin, setSelectedCoin] = useState<SupportedCoin | null>(() => {
    if (initialTx.cryptoCurrency && initialTx.cryptoNetwork) {
      const match = supportedCoins.find(
        (c) =>
          c.symbol.toLowerCase() === initialTx.cryptoCurrency?.toLowerCase() &&
          c.network.toLowerCase() === initialTx.cryptoNetwork?.toLowerCase()
      );
      if (match) return match;
    }
    return supportedCoins[0] || null;
  });

  const [paymentData, setPaymentData] = useState({
    payAddress: initialTx.payAddress,
    cryptoAmount: initialTx.cryptoAmount,
    cryptoCurrency: initialTx.cryptoCurrency,
    cryptoNetwork: initialTx.cryptoNetwork,
    qrCodeUrl: initialQrCode,
    status: initialTx.paymentStatus,
    expiresAt: initialTx.expiresAt,
    returnUrl: initialTx.returnUrl,
  });

  const [isLoadingCoin, setIsLoadingCoin] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(3600);

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Timer countdown
  useEffect(() => {
    if (!paymentData.expiresAt || paymentData.status === "PAID") return;
    const expiry = new Date(paymentData.expiresAt).getTime();

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        setPaymentData((prev) => ({ ...prev, status: "EXPIRED" }));
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentData.expiresAt, paymentData.status]);

  // Request new coin payment address if none or changed
  const handleSelectCoin = async (coin: SupportedCoin) => {
    if (
      coin.symbol === paymentData.cryptoCurrency &&
      coin.network === paymentData.cryptoNetwork &&
      paymentData.payAddress
    ) {
      setSelectedCoin(coin);
      return;
    }

    setSelectedCoin(coin);
    setIsLoadingCoin(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/pay/${initialTx.uuid}/select-coin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coin: coin.symbol,
          network: coin.network,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to generate payment address");
      }

      setPaymentData((prev) => ({
        ...prev,
        payAddress: json.data.payAddress,
        cryptoAmount: json.data.cryptoAmount,
        cryptoCurrency: json.data.cryptoCurrency,
        cryptoNetwork: json.data.cryptoNetwork,
        qrCodeUrl: json.data.qrCodeUrl,
        expiresAt: json.data.expiresAt,
        status: json.data.status,
      }));
    } catch (err: any) {
      setErrorMsg(err?.message || "Error loading dynamic crypto address.");
    } finally {
      setIsLoadingCoin(false);
    }
  };

  // Auto trigger first coin if no address yet
  useEffect(() => {
    if (!paymentData.payAddress && selectedCoin && paymentData.status === "PENDING") {
      handleSelectCoin(selectedCoin);
    }
  }, []);

  // Poll status every 4 seconds
  useEffect(() => {
    if (paymentData.status === "PAID" || paymentData.status === "EXPIRED") return;

    const poller = setInterval(async () => {
      try {
        const res = await fetch(`/api/pay/${initialTx.uuid}/status`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.status !== paymentData.status) {
            setPaymentData((prev) => ({
              ...prev,
              status: json.data.status,
              returnUrl: json.data.returnUrl || prev.returnUrl,
            }));
          }
        }
      } catch {
        // silent polling
      }
    }, 4000);

    return () => clearInterval(poller);
  }, [initialTx.uuid, paymentData.status]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar with Matched Logo */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={logo || "/logo/logo.png"}
              alt={siteName || "Logo"}
              width={130}
              height={38}
              className="h-8 w-auto object-contain"
              priority
            />
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              Secure Direct Checkout
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit Encrypted</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1">
        {/* SUCCESS STATE */}
        {paymentData.status === "PAID" ? (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl shadow-emerald-500/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-500/10 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Payment Confirmed!
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
              Your payment for order <span className="text-white font-medium">#{initialTx.orderId}</span> has been confirmed on the blockchain and credited successfully.
            </p>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 max-w-sm mx-auto mb-8 text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Merchant:</span>
                <span className="text-white font-medium">{initialTx.merchantName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Paid:</span>
                <span className="text-emerald-400 font-semibold">${Number(initialTx.amountUsd).toFixed(2)} USD</span>
              </div>
              {paymentData.cryptoAmount && (
                <div className="flex justify-between text-slate-400">
                  <span>Crypto Asset:</span>
                  <span className="text-white">
                    {paymentData.cryptoAmount} {paymentData.cryptoCurrency} ({paymentData.cryptoNetwork?.toUpperCase()})
                  </span>
                </div>
              )}
            </div>

            {paymentData.returnUrl ? (
              <a
                href={paymentData.returnUrl}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm"
              >
                <span>Return to Merchant Store</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            ) : (
              <div className="text-slate-400 text-xs">
                You may now safely close this window. Thank you!
              </div>
            )}
          </div>
        ) : paymentData.status === "EXPIRED" ? (
          /* EXPIRED STATE */
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 sm:p-12 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Invoice Expired</h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              The payment window for this invoice has expired. Please initiate a new order at the merchant store.
            </p>
            {paymentData.returnUrl && (
              <a
                href={paymentData.returnUrl}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-3 rounded-xl text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Merchant</span>
              </a>
            )}
          </div>
        ) : (
          /* ACTIVE PAYMENT SCREEN */
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  {initialTx.merchantName}
                </div>
                <h2 className="text-lg font-bold text-white">
                  {initialTx.description || `Invoice #${initialTx.orderId}`}
                </h2>
                <div className="text-xs text-slate-400 mt-0.5">
                  Order ID: <span className="font-mono text-slate-300">{initialTx.orderId}</span>
                </div>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                <span className="text-xs text-slate-400">Total Due</span>
                <span className="text-2xl font-black text-white">
                  ${Number(initialTx.amountUsd).toFixed(2)}{" "}
                  <span className="text-xs font-medium text-slate-400">USD</span>
                </span>
              </div>
            </div>

            {/* Currency Selector (Requirement A.8) */}
            <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select Cryptocurrency & Network
                </label>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time left: {formatSeconds(timeLeft)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {supportedCoins.map((coin) => {
                  const isSelected =
                    selectedCoin?.symbol === coin.symbol &&
                    selectedCoin?.network === coin.network;

                  return (
                    <button
                      key={`${coin.symbol}-${coin.network}`}
                      type="button"
                      onClick={() => handleSelectCoin(coin)}
                      disabled={isLoadingCoin}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500"
                          : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 text-slate-300 hover:bg-slate-800/40"
                      } ${isLoadingCoin ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm">{coin.symbol}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wide">
                        {coin.network}
                      </span>
                    </button>
                  );
                })}
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Payment Details & QR Code (Requirement A.7 Direct Transaction) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
              {isLoadingCoin && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-10">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                  <span className="text-xs text-slate-300">Generating direct payment address...</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                {/* QR Code Section */}
                <div className="md:col-span-5 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-3.5 rounded-2xl shadow-xl shadow-black/40 ring-4 ring-slate-800">
                    {paymentData.qrCodeUrl ? (
                      <img
                        src={paymentData.qrCodeUrl}
                        alt="Crypto Payment QR Code"
                        className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 sm:w-52 sm:h-52 flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded-xl">
                        <QrCode className="w-12 h-12 text-slate-400 mb-2" />
                        <span className="text-xs text-slate-500">Select a coin above</span>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-3">
                    Scan using your mobile crypto wallet
                  </span>
                </div>

                {/* Address & Amount Section */}
                <div className="md:col-span-7 space-y-4">
                  {/* Amount to Send */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Exact Amount to Transfer
                    </label>
                    <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl p-3 px-4">
                      <div className="font-mono text-lg sm:text-xl font-bold text-emerald-400 tracking-tight">
                        {paymentData.cryptoAmount !== null && paymentData.cryptoAmount !== undefined
                          ? paymentData.cryptoAmount
                          : "---"}{" "}
                        <span className="text-sm font-semibold text-white">
                          {paymentData.cryptoCurrency || selectedCoin?.symbol}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(String(paymentData.cryptoAmount || ""), "amount")
                        }
                        className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Copy Amount"
                      >
                        {copiedField === "amount" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Address */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Destination Address ({paymentData.cryptoNetwork?.toUpperCase() || selectedCoin?.network.toUpperCase()})
                      </label>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        Network: {paymentData.cryptoNetwork || selectedCoin?.network}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-xl p-3 px-4 gap-2">
                      <span className="font-mono text-xs sm:text-sm text-slate-200 break-all select-all">
                        {paymentData.payAddress || "Generating address..."}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(paymentData.payAddress || "", "address")
                        }
                        className="p-2 shrink-0 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Copy Address"
                      >
                        {copiedField === "address" ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Tips */}
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        Send strictly via the{" "}
                        <strong className="text-white">
                          {paymentData.cryptoNetwork?.toUpperCase() || selectedCoin?.network.toUpperCase()}
                        </strong>{" "}
                        network.
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        Transactions confirm automatically within 1-3 blockchain blocks.
                      </span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    <span>Awaiting incoming blockchain transfer...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} {siteName || "Payment Gateway"}. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Direct White-Label Gateway</span>
            <span>•</span>
            <span>Instant Settlement</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
