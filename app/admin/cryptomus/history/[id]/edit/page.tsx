"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Coins,
  CheckCircle2,
  User,
  Hash,
  Globe,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import { isCryptomusEditDisabled } from "@/lib/cryptomus-status";

export default function EditCryptomusTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const [orderId, setOrderId] = useState("");
  const [userId, setUserId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [cryptoAmount, setCryptoAmount] = useState<string>("");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("");
  const [originalStatus, setOriginalStatus] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [txid, setTxid] = useState<string>("");
  const [invoiceUrl, setInvoiceUrl] = useState<string>("");
  const [creditBalance, setCreditBalance] = useState(true);

  const [userInfo, setUserInfo] = useState<{
    id: number;
    username: string;
    email: string;
    balance: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLocked = isCryptomusEditDisabled(originalStatus);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/cryptomus/history/${id}`);
        const json = await res.json();

        if (json.success && json.data) {
          const t = json.data;
          setOrderId(t.order_id || "");
          setUserId(t.user_id ? String(t.user_id) : "");
          setAmount(String(t.amount || "0"));
          setCurrency(t.currency || "USD");
          setCryptoAmount(t.crypto_amount ? String(t.crypto_amount) : "");
          setCryptoCurrency(t.crypto_currency || "");
          setPaymentStatus(t.payment_status || "pending");
          setOriginalStatus(t.payment_status || "pending");
          setTxid(t.txid || "");
          setInvoiceUrl(t.invoice_url || "");
          if (t.user) {
            setUserInfo(t.user);
          }
        } else {
          setError(json.message || "Gagal memuat transaksi");
          toast.error("Error", json.message || "Gagal memuat transaksi");
        }
      } catch (err) {
        console.error(err);
        setError("Gagal menghubungi server");
        toast.error("Error", "Gagal menghubungi server");
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isLocked) {
      toast.error(
        "Edit Dinonaktifkan",
        `Transaksi dengan status "${originalStatus}" sudah final dan tidak dapat diubah.`
      );
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Nominal harus berupa angka valid di atas 0.");
      toast.error("Validasi Gagal", "Nominal harus di atas 0");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/cryptomus/history/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          currency: currency.trim().toUpperCase(),
          crypto_amount: cryptoAmount.trim() ? parseFloat(cryptoAmount) : null,
          crypto_currency: cryptoCurrency.trim().toUpperCase() || null,
          payment_status: paymentStatus,
          txid: txid.trim() || null,
          invoice_url: invoiceUrl.trim() || null,
          user_id: userId.trim() ? parseInt(userId, 10) : null,
          credit_balance: creditBalance,
        }),
      });

      const json = await res.json();

      if (json.success) {
        toast.success("Berhasil Disimpan", json.message || "Transaksi berhasil diperbarui");
        router.push("/admin/cryptomus/history");
      } else {
        setError(json.message || "Gagal memperbarui transaksi");
        toast.error("Gagal", json.message);
      }
    } catch (err) {
      console.error(err);
      setError("Kesalahan jaringan saat menyimpan");
      toast.error("Gagal", "Kesalahan jaringan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-slate-600 font-semibold">Memuat formulir edit transaksi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cryptomus/history"
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Edit Transaksi #{orderId}
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Alert if locked */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-sm text-amber-900">
              Transaksi Terkunci (Edit Dinonaktifkan)
            </h3>
            <p className="text-amber-800 leading-relaxed">
              Status transaksi ini saat ini adalah{" "}
              <strong className="font-mono bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">
                {originalStatus.toUpperCase()}
              </strong>
              . Transaksi dengan status final seperti <em>cancel, error / fail, selesai / paid, dan finish</em> tidak dapat diubah kembali demi menjaga integritas data keuangan dan saldo.
            </p>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>Detail Transaksi &amp; Gateway</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order ID (Read Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Order ID Faktur
              </label>
              <input
                type="text"
                value={orderId}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono bg-slate-100 border border-slate-200 text-slate-500 font-bold cursor-not-allowed"
              />
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status Pembayaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentStatus}
                disabled={isLocked || isSaving}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border font-bold transition-all ${
                  isLocked
                    ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
                }`}
              >
                <option value="pending">Menunggu Pembayaran (Pending)</option>
                <option value="check">Pengecekan Blockchain (Check)</option>
                <option value="process">Sedang Diproses (Process)</option>
                <option value="confirm_check">Konfirmasi Blok (Confirm Check)</option>
                <option value="paid">Lunas (Paid)</option>
                <option value="paid_over">Kelebihan Bayar (Paid Over)</option>
                <option value="cancel">Dibatalkan (Cancel)</option>
                <option value="fail">Gagal (Fail)</option>
                <option value="expired">Kedaluwarsa (Expired)</option>
                <option value="wrong_amount">Nominal Salah (Wrong Amount)</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nominal Fiat <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                disabled={isLocked || isSaving}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Contoh: 10.00"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border font-bold transition-all ${
                  isLocked
                    ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                }`}
              />
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Mata Uang Fiat
              </label>
              <input
                type="text"
                disabled={isLocked || isSaving}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border font-bold transition-all uppercase ${
                  isLocked
                    ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                }`}
              />
            </div>

            {/* Crypto Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nominal Kripto (Opsional)
              </label>
              <input
                type="text"
                disabled={isLocked || isSaving}
                value={cryptoAmount}
                onChange={(e) => setCryptoAmount(e.target.value)}
                placeholder="Contoh: 9.95"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border font-mono transition-all ${
                  isLocked
                    ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                }`}
              />
            </div>

            {/* Crypto Currency */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Koin / Simbol Kripto
              </label>
              <input
                type="text"
                disabled={isLocked || isSaving}
                value={cryptoCurrency}
                onChange={(e) => setCryptoCurrency(e.target.value.toUpperCase())}
                placeholder="USDT / BTC / ETH / TRX"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border font-bold transition-all uppercase ${
                  isLocked
                    ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                }`}
              />
            </div>
          </div>

          {/* TXID */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Blockchain TXID / Transaction Hash
            </label>
            <input
              type="text"
              disabled={isLocked || isSaving}
              value={txid}
              onChange={(e) => setTxid(e.target.value)}
              placeholder="Contoh: 0x938abc4810283f..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border font-mono transition-all ${
                isLocked
                  ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              }`}
            />
          </div>

          {/* Invoice URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              URL Halaman Faktur Cryptomus
            </label>
            <input
              type="url"
              disabled={isLocked || isSaving}
              value={invoiceUrl}
              onChange={(e) => setInvoiceUrl(e.target.value)}
              placeholder="https://pay.cryptomus.com/pay/..."
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border font-mono transition-all ${
                isLocked
                  ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
              }`}
            />
          </div>
        </div>

        {/* User Assignment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>Kaitan Pengguna (User ID)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                User ID Pemilik Deposit
              </label>
              <input
                type="number"
                disabled={isLocked || isSaving}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="ID User (misal: 1)"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border font-bold transition-all ${
                  isLocked
                    ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-white border-slate-300 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                }`}
              />
            </div>

            {userInfo && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <p className="font-bold text-slate-900">
                  User Terkait: {userInfo.username} (#{userInfo.id})
                </p>
                <p className="text-slate-500">{userInfo.email}</p>
                <p className="text-emerald-700 font-bold font-mono">
                  Saldo Saat Ini: ${userInfo.balance.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Credit balance checkbox */}
          <div className="pt-2">
            <label className={`flex items-start gap-2.5 select-none ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
              <input
                type="checkbox"
                disabled={isLocked || isSaving}
                checked={creditBalance}
                onChange={(e) => setCreditBalance(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs text-slate-700 font-medium">
                <strong>Otomatis tambahkan saldo ke akun pengguna</strong> jika status transaksi diubah menjadi <strong>Lunas (Paid / Paid Over)</strong>.
              </span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href={`/admin/cryptomus/history/${id}`}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors"
          >
            {isLocked ? "Kembali ke Detail" : "Batal"}
          </Link>
          {isLocked ? (
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Edit Terkunci ({originalStatus})</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

