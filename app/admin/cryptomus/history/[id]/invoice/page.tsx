"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Coins,
  User,
  Calendar,
  Wallet,
  Hash,
  Globe,
} from "lucide-react";
import QRCode from "qrcode";
import { useToast } from "@/app/admin/components/toast-context";

interface InvoiceData {
  id: number;
  uuid: string;
  order_id: string;
  user_id?: number | null;
  merchant_id?: string | null;
  amount: number;
  currency: string;
  crypto_amount?: number | string | null;
  crypto_currency?: string | null;
  payment_status: string;
  invoice_url?: string | null;
  txid?: string | null;
  raw_response?: string | null;
  create_at: string;
  update_at: string;
  user?: {
    id: number;
    uuid: string;
    username: string;
    email: string;
    name?: string | null;
    balance: number;
    server_area?: string | null;
  } | null;
}

export default function AdminCryptomusInvoiceViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/cryptomus/history/${id}`);
        const json = await res.json();

        if (json.success && json.data) {
          setInvoice(json.data);

          // Extract wallet address from raw_response if available
          let parsedRaw: any = null;
          if (json.data.raw_response) {
            try {
              parsedRaw = JSON.parse(json.data.raw_response);
            } catch {
              parsedRaw = null;
            }
          }

          const address = parsedRaw?.address || parsedRaw?.result?.address || null;
          if (address) {
            QRCode.toDataURL(address, {
              width: 240,
              margin: 1,
              color: {
                dark: "#0f172a",
                light: "#ffffff",
              },
            })
              .then((url) => setQrCodeUrl(url))
              .catch(() => {});
          }
        } else {
          setError(json.message || "Faktur tidak ditemukan");
        }
      } catch (err: any) {
        console.error("Error loading invoice:", err);
        setError("Gagal menghubungi server untuk memuat faktur");
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [id]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success("Tersalin", `${label} berhasil disalin ke clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-9 h-9 animate-spin text-emerald-600 mx-auto" />
        <p className="text-slate-600 font-semibold text-sm">Memuat dokumen faktur...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <XCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Faktur Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">{error || "Data faktur tidak tersedia atau telah dihapus."}</p>
        <Link
          href="/admin/cryptomus/history"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Riwayat</span>
        </Link>
      </div>
    );
  }

  const s = invoice.payment_status.toLowerCase();
  const isPaid = s === "paid" || s === "paid_over";
  const isExpired = s === "cancel" || s === "failed" || s === "expired" || s === "system_fail";
  const isPending = !isPaid && !isExpired;

  // Parse raw response for detailed network and address
  let rawData: any = null;
  if (invoice.raw_response) {
    try {
      rawData = JSON.parse(invoice.raw_response);
    } catch {
      rawData = null;
    }
  }

  const depositAddress = rawData?.address || rawData?.result?.address || null;
  const depositNetwork = (rawData?.network || rawData?.result?.network || "TRON").toUpperCase();
  const cryptoSymbol = (invoice.crypto_currency || rawData?.payer_currency || "USDT").toUpperCase();
  const cryptoAmountDisplay = invoice.crypto_amount
    ? String(invoice.crypto_amount)
    : rawData?.payer_amount
    ? String(rawData.payer_amount)
    : `${invoice.amount.toFixed(2)}`;

  // Determine blockchain explorer URL based on network & TXID
  const getExplorerUrl = (txidStr: string, networkStr: string) => {
    const net = networkStr.toLowerCase();
    if (net.includes("tron") || net.includes("trc")) {
      return `https://tronscan.org/#/transaction/${txidStr}`;
    }
    if (net.includes("eth") || net.includes("erc")) {
      return `https://etherscan.io/tx/${txidStr}`;
    }
    if (net.includes("bsc") || net.includes("bep")) {
      return `https://bscscan.com/tx/${txidStr}`;
    }
    if (net.includes("sol")) {
      return `https://solscan.io/tx/${txidStr}`;
    }
    if (net.includes("btc")) {
      return `https://www.blockchain.com/explorer/transactions/btc/${txidStr}`;
    }
    return `https://tronscan.org/#/transaction/${txidStr}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar - Controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/cryptomus/history/${invoice.id}`}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
            title="Kembali ke Detail"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Faktur Pembayaran #{invoice.order_id}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/cryptomus/history/${invoice.id}`}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Detail Transaksi</span>
          </Link>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* INVOICE CARD (Printable Area) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Decorative Stamp (Watermark) */}
        {isPaid && (
          <div className="absolute top-10 right-10 pointer-events-none select-none opacity-20 sm:opacity-25 rotate-[-12deg] z-0">
            <div className="border-4 border-emerald-600 text-emerald-700 rounded-2xl px-6 py-2.5 font-black text-2xl sm:text-3xl tracking-widest uppercase text-center">
              LUNAS / PAID
            </div>
          </div>
        )}
        {isExpired && (
          <div className="absolute top-10 right-10 pointer-events-none select-none opacity-20 rotate-[-12deg] z-0">
            <div className="border-4 border-rose-600 text-rose-700 rounded-2xl px-6 py-2.5 font-black text-2xl sm:text-3xl tracking-widest uppercase text-center">
              DIBATALKAN
            </div>
          </div>
        )}

        <div className="relative z-10 space-y-8">
          {/* Header Row: Company Info & Invoice Meta */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">MASTER SMM</h2>
                  <p className="text-[11px] font-semibold text-slate-400">Payment Gateway Deposit</p>
                </div>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Nomor Faktur
              </span>
              <div className="font-mono text-lg sm:text-xl font-black text-slate-900">
                {invoice.order_id}
              </div>
              <div className="text-xs text-slate-500 pt-1">
                Tanggal:{" "}
                <span className="font-medium text-slate-700">
                  {new Date(invoice.create_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <div className="pt-2">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lunas (Terkonfirmasi)</span>
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Dibatalkan / Kadaluwarsa</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Menunggu Pembayaran</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info Customer / Pengguna */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Ditujukan Kepada
              </span>
              {invoice.user ? (
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm">
                    {invoice.user.name || invoice.user.username}
                  </p>
                  <p className="text-slate-600 font-mono">@{invoice.user.username}</p>
                  <p className="text-slate-500">{invoice.user.email}</p>
                  <p className="text-slate-400 text-[11px]">User ID: #{invoice.user.id}</p>
                </div>
              ) : (
                <p className="text-slate-500 font-semibold">User ID: #{invoice.user_id || "-"}</p>
              )}
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Metode Pembayaran
              </span>
              <p className="font-bold text-slate-900 text-sm flex items-center sm:justify-end gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Cryptomus Cryptocurrency Gateway</span>
              </p>
              <p className="text-slate-600 font-mono font-medium">
                {cryptoSymbol} ({depositNetwork})
              </p>
              <p className="text-slate-400 text-[11px]">
                UUID Transaksi: <span className="font-mono">{invoice.uuid.slice(0, 16)}...</span>
              </p>
            </div>
          </div>

          {/* Tabel Rincian Nominal */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-2">Deskripsi Layanan</th>
                  <th className="py-3 px-2 text-center">Jaringan</th>
                  <th className="py-3 px-2 text-right">Nominal Kripto</th>
                  <th className="py-3 px-2 text-right">Jumlah Saldo (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                <tr>
                  <td className="py-4 px-2">
                    <div className="font-bold text-slate-900">Deposit Saldo Akun Pengguna</div>
                    <div className="text-slate-500 text-[11px]">
                      Pengisian saldo instan melalui pembayaran gateway Cryptomus
                    </div>
                  </td>
                  <td className="py-4 px-2 text-center font-mono font-bold text-slate-700">
                    {depositNetwork}
                  </td>
                  <td className="py-4 px-2 text-right font-mono font-bold text-emerald-700">
                    {cryptoAmountDisplay} {cryptoSymbol}
                  </td>
                  <td className="py-4 px-2 text-right font-bold text-slate-900">
                    ${invoice.amount.toFixed(2)} {invoice.currency}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Summary */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500 max-w-sm">
              <span className="font-bold text-slate-700">Catatan:</span> Saldo dikreditkan secara otomatis setelah transaksi mendapatkan konfirmasi blok yang diperlukan dari jaringan blockchain.
            </div>

            <div className="w-full sm:w-auto bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:min-w-[260px] text-right space-y-1">
              <div className="flex justify-between sm:justify-end gap-6 text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">${invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-xs text-slate-600">
                <span>Biaya Gateway:</span>
                <span className="font-mono font-bold">$0.00</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-6 text-sm font-black text-slate-900 pt-2 border-t border-emerald-200/80">
                <span>Total Saldo Masuk:</span>
                <span className="text-emerald-700 font-mono text-base">
                  ${invoice.amount.toFixed(2)} {invoice.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Blockchain & Verification Details */}
          {isPaid && invoice.txid && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Bukti Pembayaran Terverifikasi di Blockchain</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-100">
                <div className="space-y-0.5 max-w-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Transaction Hash (TXID)
                  </span>
                  <div className="font-mono font-bold text-slate-900 break-all text-xs">
                    {invoice.txid}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(invoice.txid!, "TXID")}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors inline-flex items-center gap-1 font-bold text-xs"
                    title="Salin TXID"
                  >
                    {copiedField === "TXID" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Salin</span>
                  </button>
                  <a
                    href={getExplorerUrl(invoice.txid, depositNetwork)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1 shadow-xs"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Payment Instructions & QR Code (If pending) */}
          {isPending && depositAddress && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Alamat Dompet Pembayaran Kripto</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {qrCodeUrl && (
                  <div className="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-xs shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrCodeUrl}
                      alt="QR Code Alamat Pembayaran"
                      className="w-36 h-36 rounded-lg"
                    />
                  </div>
                )}

                <div className="space-y-3 w-full text-xs">
                  <div>
                    <label className="text-slate-500 font-medium block mb-1">
                      Kirim tepat sesuai nominal berikut:
                    </label>
                    <div className="font-mono text-base font-black text-slate-900 flex items-center gap-2">
                      <span>{cryptoAmountDisplay} {cryptoSymbol}</span>
                      <button
                        onClick={() => copyToClipboard(cryptoAmountDisplay, "Nominal Kripto")}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Salin Nominal"
                      >
                        {copiedField === "Nominal Kripto" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-500 font-medium block mb-1">
                      Ke Alamat Wallet Penerima ({depositNetwork}):
                    </label>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-xs font-bold text-slate-900 break-all">
                      <span className="flex-1">{depositAddress}</span>
                      <button
                        onClick={() => copyToClipboard(depositAddress, "Alamat Wallet")}
                        className="p-1.5 text-slate-500 hover:text-slate-800 rounded bg-slate-50 shrink-0 border border-slate-200"
                        title="Salin Alamat"
                      >
                        {copiedField === "Alamat Wallet" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Signature & Timestamp */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-2">
            <div>
              Dicetak otomatis pada: {new Date().toLocaleString("id-ID")}
            </div>
            <div>
              ID Internal: #{invoice.id} • Order: {invoice.order_id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

