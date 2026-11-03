"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
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

  // 2. Fetch user balance
  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/member/order?limit=1");
      const json = await res.json();
      if (json.success && json.user) {
        setUserBalance(Number(json.user.balance || 0));
        setServerArea(json.user.server_area || "SG");
      }
    } catch (err) {
      console.error("Failed to load user info:", err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchUserData();
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
          message: `Order placed successfully! Invoice: ${json.data.invoice} (Order ID: ${json.data.order_id || "Processing"})`,
        });
        setTarget("");
        setQuantity("");
        if (typeof json.data?.remaining_balance === "number") {
          setUserBalance(json.data.remaining_balance);
        }
        fetchUserData();
      } else {
        setAlertInfo({
          type: "error",
          message: json.message || "Failed to place order. Please try again.",
        });
      }
    } catch (err: any) {
      setAlertInfo({
        type: "error",
        message: err?.message || "A network error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <span>New Order</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/member/payment"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deposit</span>
          </Link>
        </div>
      </div>

      {/* Notification Alert */}
      {alertInfo && (
        <div
          className={`p-3.5 sm:p-4 rounded-xl border flex items-start gap-2.5 transition-all text-xs sm:text-sm ${
            alertInfo.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {alertInfo.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          )}
          <div className="font-medium flex-1">{alertInfo.message}</div>
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
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span>Order Configuration</span>
          </h2>

          {loadingCatalog ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs">Loading service catalog...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="py-10 text-center text-slate-500 text-xs sm:text-sm">
              No active services available. Please contact support.
            </div>
          ) : (
            <form onSubmit={handleOrderSubmit} className="space-y-4">
              {/* 1. Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Service Category
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  {filteredCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.platform?.name ? `[${cat.platform.name}] ` : ""}
                      {cat.name} ({cat.services.length} services)
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Service */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
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
                <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                  <div className="grid grid-cols-3 gap-2 text-center border-b border-slate-200 pb-2.5">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Rate / 1K</span>
                      <span className="font-bold text-emerald-600 font-mono text-sm">
                        ${Number(currentService.rate_sale).toFixed(4)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Min Order</span>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm font-mono">
                        {currentService.min.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Max Order</span>
                      <span className="font-bold text-slate-800 text-xs sm:text-sm font-mono">
                        {currentService.max > 0
                          ? currentService.max.toLocaleString()
                          : "Unlimited"}
                      </span>
                    </div>
                  </div>
                  {currentService.desc && (
                    <div className="text-slate-600 pt-0.5 leading-relaxed whitespace-pre-line text-[11px]">
                      {currentService.desc}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Target / Link */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Link / Username
                </label>
                <input
                  type="text"
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="https://instagram.com/p/... or username"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Ensure the target account or post is set to public (not private).
                </span>
              </div>

              {/* 4. Quantity */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Quantity
                  </label>
                  {currentService && (
                    <span className="text-[11px] text-slate-500 font-mono">
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
                  placeholder="Enter quantity..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors font-mono font-bold"
                />
                {quantity && !isQtyValid && (
                  <span className="text-[11px] text-rose-500 mt-1 block font-medium">
                    Quantity must be between {currentService?.min.toLocaleString()} and{" "}
                    {currentService?.max.toLocaleString()}.
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs sm:text-sm text-white shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Place Order Now</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Live Summary & Guide (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Order Summary Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Order Summary</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Service:</span>
                <span className="text-slate-800 font-medium text-right max-w-[200px] truncate">
                  {currentService?.service_name || "-"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Target:</span>
                <span className="text-slate-800 font-medium text-right max-w-[200px] truncate">
                  {target.trim() || "-"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Quantity:</span>
                <span className="text-slate-900 font-mono font-bold">
                  {parsedQty > 0 ? parsedQty.toLocaleString() : "0"}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Price per 1K:</span>
                <span className="text-slate-900 font-mono font-medium">
                  ${rateSale.toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-800 font-bold text-xs sm:text-sm">Total Cost:</span>
                <span className="text-emerald-600 font-mono font-bold text-base sm:text-lg">
                  ${totalPrice.toFixed(4)}
                </span>
              </div>

              <div className="flex justify-between py-1.5 text-xs">
                <span className="text-slate-500">Remaining Balance:</span>
                <span
                  className={`font-mono font-bold text-xs sm:text-sm ${
                    isBalanceSufficient ? "text-slate-800" : "text-rose-600"
                  }`}
                >
                  ${remainingBalanceAfter.toFixed(2)}
                </span>
              </div>
            </div>

            {!isBalanceSufficient && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                Insufficient balance to place this order. Please deposit funds first.
              </div>
            )}
          </div>

          {/* Quick Rules */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
            <span className="font-bold text-slate-900 text-xs block">Order Guidelines:</span>
            <p>• Target account or post must be public (not private).</p>
            <p>• Do not place duplicate orders for the same target link before completion.</p>
            <p>• Orders are automatically dispatched to the server provider clusters.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
