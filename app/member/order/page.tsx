"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Wallet,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info,
  Clock,
  RefreshCw,
  Search,
} from "lucide-react";

interface ServiceItem {
  id: number;
  uuid: string;
  service_id: string;
  service_name: string;
  slug: string;
  min: number;
  max: number;
  desc: string | null;
  rate_sale: string | number;
  rate_api: string | number;
  id_category: number;
  id_api_provider: number | null;
}

interface CategoryWithServices {
  id: number;
  name: string;
  slug: string;
  platform?: {
    id: number;
    name: string;
    slug: string;
    icon?: string | null;
  };
  services: ServiceItem[];
}

interface OrderHistoryItem {
  id: number;
  invoice: string;
  order_id: string | null;
  service_id: string;
  amount: number;
  price_sale: string | number;
  target: string;
  status: string;
  server_area?: string;
  create_at: string;
}

export default function MemberOrderPage() {
  const [categories, setCategories] = useState<CategoryWithServices[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // User State
  const [userBalance, setUserBalance] = useState<number>(0);
  const [serverArea, setServerArea] = useState<string>("SG");

  // Form State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "">("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");
  const [target, setTarget] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status & Feedback
  const [alertInfo, setAlertInfo] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Order History State
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Category search filter
  const [searchCategory, setSearchCategory] = useState("");

  // 1. Fetch catalog services
  const fetchServices = async () => {
    try {
      setLoadingCatalog(true);
      const res = await fetch("/api/member/services");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setCategories(json.data);
        if (json.data.length > 0 && selectedCategoryId === "") {
          setSelectedCategoryId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoadingCatalog(false);
    }
  };

  // 2. Fetch user balance & recent orders
  const fetchOrderHistory = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch("/api/member/order?limit=20");
      const json = await res.json();
      if (json.success) {
        if (json.user) {
          setUserBalance(Number(json.user.balance || 0));
          setServerArea(json.user.server_area || "SG");
        }
        if (Array.isArray(json.data)) {
          setOrders(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to load order history:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchOrderHistory();
  }, []);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!searchCategory.trim()) return categories;
    const term = searchCategory.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.platform?.name && c.platform.name.toLowerCase().includes(term))
    );
  }, [categories, searchCategory]);

  // Active Category & Services
  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === Number(selectedCategoryId));
  }, [categories, selectedCategoryId]);

  const activeServices = useMemo(() => {
    return currentCategory ? currentCategory.services : [];
  }, [currentCategory]);

  // Selected Service
  const currentService = useMemo(() => {
    if (!selectedServiceId) return null;
    return activeServices.find((s) => s.id === Number(selectedServiceId)) || null;
  }, [activeServices, selectedServiceId]);

  // Set default service when category changes
  useEffect(() => {
    if (activeServices.length > 0) {
      // Keep existing selection if it belongs to current category, else select first
      const stillValid = activeServices.some((s) => s.id === Number(selectedServiceId));
      if (!stillValid) {
        setSelectedServiceId(activeServices[0].id);
      }
    } else {
      setSelectedServiceId("");
    }
  }, [activeServices]);

  // Price calculations
  const parsedQty = parseInt(quantity, 10) || 0;
  const rateSale = currentService ? Number(currentService.rate_sale) : 0;
  const totalPrice = parsedQty > 0 && rateSale > 0 ? (parsedQty / 1000) * rateSale : 0;
  const remainingBalanceAfter = userBalance - totalPrice;
  const isBalanceSufficient = remainingBalanceAfter >= 0;

  // Form validity check
  const isQtyValid =
    currentService &&
    parsedQty >= (currentService.min || 1) &&
    (currentService.max === 0 || parsedQty <= currentService.max);

  const canSubmit =
    !isSubmitting &&
    currentService &&
    target.trim().length > 0 &&
    isQtyValid &&
    isBalanceSufficient;

  // Handle Order Submit
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setAlertInfo(null);

    try {
      const res = await fetch("/api/member/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: currentService.id,
          target: target.trim(),
          amount: parsedQty,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setAlertInfo({
          type: "success",
          message: `Pesanan berhasil dibuat! Invoice: ${json.data.invoice} (Order ID: ${json.data.order_id || "Diproses"})`,
        });
        // Reset form input
        setTarget("");
        setQuantity("");
        // Refresh balance and history
        if (typeof json.data?.remaining_balance === "number") {
          setUserBalance(json.data.remaining_balance);
        }
        fetchOrderHistory();
      } else {
        setAlertInfo({
          type: "error",
          message: json.message || "Gagal membuat pesanan. Silakan coba lagi.",
        });
      }
    } catch (err: any) {
      setAlertInfo({
        type: "error",
        message: err?.message || "Terjadi kesalahan jaringan.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-[#0c1222]/90 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/member"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-base leading-tight text-white flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              Pesanan Baru
            </h1>
            <span className="text-xs text-slate-400">Pemesanan Layanan SMM Instan</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Node:</span>
            <span className="font-bold text-white">{serverArea}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Saldo:</span>
            <span className="font-bold text-emerald-400 font-mono">
              ${userBalance.toFixed(2)}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8">
        {/* Notification Alert */}
        {alertInfo && (
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
              alertInfo.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/30 text-rose-300"
            }`}
          >
            {alertInfo.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            )}
            <div className="text-sm font-medium flex-1">{alertInfo.message}</div>
            <button
              onClick={() => setAlertInfo(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Order Form & Live Summary Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* Left: Order Form (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0c1222] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
              <span>Formulir Pesanan</span>
            </h2>

            {loadingCatalog ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-sm">Memuat katalog layanan...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                Belum ada layanan yang aktif. Silakan hubungi admin.
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="space-y-5">
                {/* 1. Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Kategori Layanan
                  </label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.platform?.name ? `[${cat.platform.name}] ` : ""}
                        {cat.name} ({cat.services.length} layanan)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Layanan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Layanan
                  </label>
                  <select
                    value={selectedServiceId}
                    onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {activeServices.map((svc) => (
                      <option key={svc.id} value={svc.id}>
                        {svc.service_name} — ${Number(svc.rate_sale).toFixed(4)} / 1K
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Details Card */}
                {currentService && (
                  <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-2">
                    <div className="grid grid-cols-3 gap-2 text-center border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-slate-400 block">Harga / 1K</span>
                        <span className="font-bold text-emerald-400 font-mono text-sm">
                          ${Number(currentService.rate_sale).toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Min Order</span>
                        <span className="font-bold text-white">
                          {currentService.min.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Max Order</span>
                        <span className="font-bold text-white">
                          {currentService.max > 0
                            ? currentService.max.toLocaleString()
                            : "Unlimited"}
                        </span>
                      </div>
                    </div>
                    {currentService.desc && (
                      <div className="text-slate-400 pt-1 leading-relaxed whitespace-pre-line text-[11px]">
                        {currentService.desc}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Target / Link */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Target / Link / Username
                  </label>
                  <input
                    type="text"
                    required
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="https://instagram.com/p/... atau username"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Pastikan akun atau postingan tidak dalam status privat.
                  </span>
                </div>

                {/* 4. Jumlah (Quantity) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Jumlah Pemesanan
                    </label>
                    {currentService && (
                      <span className="text-[11px] text-slate-400">
                        Min: {currentService.min.toLocaleString()} | Max:{" "}
                        {currentService.max > 0
                          ? currentService.max.toLocaleString()
                          : "Unlimited"}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    min={currentService?.min || 1}
                    max={currentService?.max || undefined}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Masukkan kuantitas..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                  />
                  {quantity && !isQtyValid && (
                    <span className="text-[11px] text-rose-400 mt-1 block">
                      Jumlah harus antara {currentService?.min.toLocaleString()} dan{" "}
                      {currentService?.max.toLocaleString()}.
                    </span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Pesanan...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Buat Pesanan Sekarang</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Live Summary & Guide (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Order Summary Card */}
            <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                Ringkasan Pemesanan
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Layanan:</span>
                  <span className="text-white font-medium text-right max-w-[200px] truncate">
                    {currentService?.service_name || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Target:</span>
                  <span className="text-white font-medium text-right max-w-[200px] truncate">
                    {target.trim() || "-"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Jumlah:</span>
                  <span className="text-white font-mono font-bold">
                    {parsedQty > 0 ? parsedQty.toLocaleString() : "0"}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Harga per 1K:</span>
                  <span className="text-white font-mono font-medium">
                    ${rateSale.toFixed(4)}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800/80 text-sm">
                  <span className="text-slate-200 font-semibold">Total Biaya:</span>
                  <span className="text-emerald-400 font-mono font-extrabold">
                    ${totalPrice.toFixed(4)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 text-xs">
                  <span className="text-slate-400">Sisa Saldo:</span>
                  <span
                    className={`font-mono font-bold ${
                      isBalanceSufficient ? "text-slate-300" : "text-rose-400"
                    }`}
                  >
                    ${remainingBalanceAfter.toFixed(2)}
                  </span>
                </div>
              </div>

              {!isBalanceSufficient && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  Saldo Anda tidak mencukupi untuk melakukan pesanan ini.
                </div>
              )}
            </div>

            {/* Quick Rules */}
            <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-5 text-xs space-y-2 text-slate-400">
              <span className="font-bold text-slate-300 block mb-1">Ketentuan Pemesanan:</span>
              <p>• Akun target wajib publik (tidak diprivat).</p>
              <p>• Jangan memasukkan pesanan baru untuk target yang sama sebelum proses selesai.</p>
              <p>• Pesanan langsung diteruskan secara otomatis ke server provider.</p>
            </div>
          </div>
        </div>

        {/* Bottom: Recent Orders History */}
        <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Riwayat Pesanan Terkini
              </h3>
              <span className="text-xs text-slate-400">Daftar transaksi pesanan Anda</span>
            </div>
            <button
              onClick={fetchOrderHistory}
              disabled={loadingOrders}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loadingOrders ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-xs">Memuat riwayat...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Belum ada riwayat pesanan. Lakukan pesanan pertama Anda pada form di atas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                    <th className="py-3 px-3">Invoice</th>
                    <th className="py-3 px-3">Node</th>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Target</th>
                    <th className="py-3 px-3 text-right">Jumlah</th>
                    <th className="py-3 px-3 text-right">Harga ($)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-indigo-400">
                        {ord.invoice}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 font-mono border border-slate-700">
                          {ord.server_area || "SG"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {ord.order_id || "-"}
                      </td>
                      <td className="py-3 px-3 max-w-[200px] truncate text-slate-300" title={ord.target}>
                        {ord.target}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white">
                        {ord.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 font-medium">
                        ${Number(ord.price_sale).toFixed(4)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            ord.status === "Processing" || ord.status === "In progress"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : ord.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : ord.status === "Canceled" || ord.status === "Error"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                        {new Date(ord.create_at).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

