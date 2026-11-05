"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  TrendingUp,
  DollarSign,
  Wallet,
  Users,
  PackageCheck,
  Server,
  Layers,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  ShieldCheck,
  Database,
  Sparkles,
  LifeBuoy,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  Radio,
  Zap,
  BarChart3,
  ArrowUpRight,
  HardDrive,
  Filter,
  Pause,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

// Data types matching /api/admin/stats
interface ProviderData {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  url: string;
  balance: number;
  update_at: string;
  status: "healthy" | "low" | "critical";
}

interface ServerNodeData {
  id: string;
  group: string;
  regionName: string;
  flag: string;
  isOnline: boolean;
  pingMs: number | null;
  ordersCount: number;
}

interface RecentOrderData {
  id: number;
  invoice: string;
  order_id: string | null;
  service_id: string;
  service_name: string;
  category_name: string;
  user_username: string;
  user_level: string;
  target: string;
  amount: number;
  price_sale: number;
  price_api: number;
  profit: number;
  status: string;
  server_area?: string | null;
  create_at: string;
}

interface RecentUserData {
  id: number;
  username: string;
  email: string;
  level: string;
  balance: number | string;
  create_at: string;
}

interface PlatformData {
  id: number;
  name: string;
  slug: string;
  _count: { categories: number };
}

interface SystemAlert {
  type: "info" | "warning" | "danger" | "success";
  title: string;
  message: string;
  actionLink?: string;
  actionText?: string;
}

interface DashboardStats {
  // Orders & Volume
  totalOrders: number;
  todayOrdersCount: number;
  totalOmset: number;
  todayOmset: number;
  totalModal: number;
  totalProfit: number;
  todayProfit: number;
  statusCounts: Record<string, number>;
  recentOrders: RecentOrderData[];

  // Server Clusters
  activeServers: ServerNodeData[];

  // Providers
  providers: ProviderData[];
  totalProviderBalance: number;
  lowBalanceCount: number;

  // Users
  usersCount: number;
  usersTodayCount: number;
  totalUserBalance: number;
  recentUsers: RecentUserData[];

  // Catalog
  servicesCount: number;
  platformsCount: number;
  categoriesCount: number;
  platforms: PlatformData[];

  // Financials & Deposits
  totalDepositsPaid: number;
  totalDepositsCount: number;
  pendingDepositsCount: number;

  // Support
  openTicketsCount: number;
  urgentTicketsCount: number;
  totalTicketsCount: number;

  // Diagnostics
  systemStatus: "operational" | "warning" | "critical";
  systemAlerts: SystemAlert[];
  lastUpdated: string;
}

export default function AdminDashboardPage() {
  const { toast } = useToast();

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh configuration
  const [refreshInterval, setRefreshInterval] = useState<number>(30); // 0 (pause), 10, 30, 60
  const [countdown, setCountdown] = useState<number>(30);

  // Provider sync state
  const [syncingProviderId, setSyncingProviderId] = useState<number | null>(null);
  const [isSyncingAllProviders, setIsSyncingAllProviders] = useState(false);

  // Copied clipboard helper
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  // Filter for recent orders table
  const [orderFilter, setOrderFilter] = useState<string>("ALL");

  // Format currency helper
  const formatUSD = (val: number | string | null | undefined) => {
    return `$${Number(val || 0).toFixed(2)}`;
  };

  // Format relative time helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "Baru saja";
      if (mins < 60) return `${mins} mnt lalu`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours} jam lalu`;
      const days = Math.floor(hours / 24);
      return `${days} hari lalu`;
    } catch {
      return "-";
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedInvoice(text);
      toast.success("Tersalin", `Invoice ${text} berhasil disalin ke clipboard`);
      setTimeout(() => setCopiedInvoice(null), 2500);
    }
  };

  // Fetch Dashboard Stats
  const fetchStats = useCallback(
    async (isManual = false) => {
      if (isManual) {
        setIsRefreshing(true);
      }
      try {
        const url = isManual ? "/api/admin/stats?fresh=1" : "/api/admin/stats";
        const res = await fetch(url, { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
          if (isManual) {
            toast.success("Data Diperbarui", "Analitik dan monitoring sistem berhasil disegarkan.");
          }
        } else {
          if (isManual) {
            toast.error("Gagal Memuat", json.message || "Gagal mengambil data statistik.");
          }
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        if (isManual) {
          toast.error("Koneksi Error", "Tidak dapat terhubung ke server API.");
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        if (refreshInterval > 0) {
          setCountdown(refreshInterval);
        }
      }
    },
    [refreshInterval, toast]
  );

  // Initial load
  useEffect(() => {
    fetchStats(false);
  }, []);

  // Realtime countdown ticker
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchStats(false);
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval, fetchStats]);

  // Sync single provider balance
  const handleSyncProvider = async (id: number, name: string) => {
    setSyncingProviderId(id);
    try {
      const res = await fetch(`/api/admin/provider/${id}/sync-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auto_save: true }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          "Saldo Diperbarui",
          `${name}: Saldo riil $${Number(json.balance || 0).toFixed(2)} berhasil disimpan.`
        );
        fetchStats(true);
      } else {
        toast.error("Gagal Sync", json.message || "Gagal mengambil saldo dari API supplier");
      }
    } catch (err: any) {
      toast.error("Error Koneksi", err.message || "Gagal terhubung ke API provider");
    } finally {
      setSyncingProviderId(null);
    }
  };

  // Sync all providers
  const handleSyncAllProviders = async () => {
    if (!stats?.providers || stats.providers.length === 0) return;
    setIsSyncingAllProviders(true);
    let successCount = 0;
    try {
      for (const prov of stats.providers) {
        try {
          const res = await fetch(`/api/admin/provider/${prov.id}/sync-balance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ auto_save: true }),
          });
          const json = await res.json();
          if (json.success) successCount++;
        } catch {
          // ignore single fail and continue
        }
      }
      toast.success(
        "Sync Provider Selesai",
        `Berhasil menyinkronkan saldo ${successCount} dari ${stats.providers.length} provider.`
      );
      fetchStats(true);
    } catch (err: any) {
      toast.error("Gagal", err.message || "Proses sinkronisasi massal gagal.");
    } finally {
      setIsSyncingAllProviders(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "success") {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
        dot: "bg-emerald-500",
        label: "Completed",
      };
    }
    if (s === "processing" || s === "in progress" || s === "in_progress") {
      return {
        bg: "bg-sky-50 text-sky-700 border-sky-200/80",
        dot: "bg-sky-500 animate-pulse",
        label: "Processing",
      };
    }
    if (s === "pending") {
      return {
        bg: "bg-amber-50 text-amber-700 border-amber-200/80",
        dot: "bg-amber-500",
        label: "Pending",
      };
    }
    if (s === "partial") {
      return {
        bg: "bg-orange-50 text-orange-700 border-orange-200/80",
        dot: "bg-orange-500",
        label: "Partial",
      };
    }
    if (s === "canceled" || s === "cancelled" || s === "error") {
      return {
        bg: "bg-rose-50 text-rose-700 border-rose-200/80",
        dot: "bg-rose-500",
        label: "Canceled",
      };
    }
    return {
      bg: "bg-slate-100 text-slate-700 border-slate-200/80",
      dot: "bg-slate-400",
      label: status,
    };
  };

  // Calculations for pipeline distribution
  const totalOrdersCount = stats?.totalOrders || 0;
  const statusCounts = stats?.statusCounts || {};
  const completedCount = statusCounts["Completed"] || 0;
  const processingCount =
    (statusCounts["Processing"] || 0) + (statusCounts["In progress"] || 0);
  const pendingCount = statusCounts["Pending"] || 0;
  const errorCount =
    (statusCounts["Canceled"] || 0) + (statusCounts["Partial"] || 0);

  const completedPct = totalOrdersCount > 0 ? (completedCount / totalOrdersCount) * 100 : 0;
  const processingPct = totalOrdersCount > 0 ? (processingCount / totalOrdersCount) * 100 : 0;
  const pendingPct = totalOrdersCount > 0 ? (pendingCount / totalOrdersCount) * 100 : 0;
  const errorPct = totalOrdersCount > 0 ? (errorCount / totalOrdersCount) * 100 : 0;

  // Margin calculation
  const marginPct =
    stats && stats.totalOmset > 0
      ? ((stats.totalProfit / stats.totalOmset) * 100).toFixed(1)
      : "0.0";

  // Filtered recent orders
  const filteredRecentOrders = (stats?.recentOrders || []).filter((ord) => {
    if (orderFilter === "ALL") return true;
    return ord.status.toLowerCase() === orderFilter.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header & Realtime Command Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              Dashboard Command Center
            </h1>

            {/* Realtime Health Status Beacon */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase border ${
                stats?.systemStatus === "operational"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                  : stats?.systemStatus === "warning"
                  ? "bg-amber-50 text-amber-700 border-amber-200/80"
                  : "bg-rose-50 text-rose-700 border-rose-200/80"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    stats?.systemStatus === "operational"
                      ? "bg-emerald-400"
                      : stats?.systemStatus === "warning"
                      ? "bg-amber-400"
                      : "bg-rose-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    stats?.systemStatus === "operational"
                      ? "bg-emerald-500"
                      : stats?.systemStatus === "warning"
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                />
              </span>
              <span>
                {stats?.systemStatus === "operational"
                  ? "Sistem Operational"
                  : stats?.systemStatus === "warning"
                  ? "Perhatian Sistem"
                  : "Status Kritis"}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Monitoring live cluster multi-server MongoDB, agregasi pesanan, saldo gateway provider, dan analitik profit.
          </p>
        </div>

        {/* Realtime Controls & Quick Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Auto Refresh Interval Selector */}
          <div className="flex items-center bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-600">
            <span className="px-2 text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
              Live:
            </span>
            {[
              { label: "Off", value: 0 },
              { label: "10s", value: 10 },
              { label: "30s", value: 30 },
              { label: "60s", value: 60 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setRefreshInterval(opt.value);
                  if (opt.value > 0) setCountdown(opt.value);
                }}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  refreshInterval === opt.value
                    ? "bg-white text-emerald-700 shadow-xs font-extrabold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Manual Refresh Button with Countdown Progress */}
          <button
            onClick={() => fetchStats(true)}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 bg-white border border-slate-200/80 hover:border-emerald-300 hover:text-emerald-700 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
            title="Segarkan data sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-emerald-600" : ""}`} />
            <span>Segarkan</span>
            {refreshInterval > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-500 font-mono">
                {countdown}s
              </span>
            )}
          </button>

          {/* Sync All Provider Balances Button */}
          <button
            onClick={handleSyncAllProviders}
            disabled={isSyncingAllProviders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 bg-emerald-50/80 border border-emerald-200/80 hover:bg-emerald-100/80 hover:text-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60"
            title="Tarik saldo terbaru dari seluruh API Provider"
          >
            <Zap className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingAllProviders ? "animate-bounce" : ""}`} />
            <span>{isSyncingAllProviders ? "Syncing..." : "Sync Provider"}</span>
          </button>

          {/* Quick Create Service */}
          <Link
            href="/admin/service/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer shadow-xs shadow-emerald-600/20"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>+ Layanan</span>
          </Link>
        </div>
      </div>

      {/* 2. System Diagnostic & Alert Banners */}
      {stats?.systemAlerts && stats.systemAlerts.length > 0 && (
        <div className="space-y-2.5">
          {stats.systemAlerts.map((alert, idx) => {
            const isDanger = alert.type === "danger";
            const isWarning = alert.type === "warning";
            const isSuccess = alert.type === "success";

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDanger
                    ? "bg-rose-50/90 border-rose-200 text-rose-900"
                    : isWarning
                    ? "bg-amber-50/90 border-amber-200 text-amber-900"
                    : isSuccess
                    ? "bg-emerald-50/90 border-emerald-200 text-emerald-900"
                    : "bg-sky-50/90 border-sky-200 text-sky-900"
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isDanger
                        ? "bg-rose-100 border-rose-300 text-rose-700"
                        : isWarning
                        ? "bg-amber-100 border-amber-300 text-amber-700"
                        : isSuccess
                        ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                        : "bg-sky-100 border-sky-300 text-sky-700"
                    }`}
                  >
                    {isDanger ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isWarning ? (
                      <Clock className="w-4 h-4" />
                    ) : isSuccess ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <LifeBuoy className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">{alert.title}</h4>
                    <p className="text-xs opacity-90 font-medium mt-0.5">{alert.message}</p>
                  </div>
                </div>

                {alert.actionLink && alert.actionText && (
                  <Link
                    href={alert.actionLink}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 self-start sm:self-auto shadow-xs ${
                      isDanger
                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                        : isWarning
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    <span>{alert.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Core Executive Analytics HUD (6 Cards Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Gross Sales / Turnover */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Omset
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats ? formatUSD(stats.totalOmset) : "..."}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Hari ini:</span>
            <span className="font-bold text-emerald-600 font-mono">
              +{stats ? formatUSD(stats.todayOmset) : "..."}
            </span>
          </div>
        </div>

        {/* Card 2: Net Profit & Margin */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Keuntungan Bersih
              </span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats ? formatUSD(stats.totalProfit) : "..."}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Margin: {marginPct}%</span>
            <span className="font-bold text-teal-600 font-mono">
              +{stats ? formatUSD(stats.todayProfit) : "..."}
            </span>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Pesanan
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats ? stats.totalOrders.toLocaleString() : "..."}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Hari ini:</span>
            <span className="font-bold text-sky-600 font-mono">
              +{stats ? stats.todayOrdersCount.toLocaleString() : "..."} order
            </span>
          </div>
        </div>

        {/* Card 4: Provider API Balance */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Saldo Provider
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats ? formatUSD(stats.totalProviderBalance) : "..."}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {stats ? `${stats.providers.length} Supplier` : "..."}
            </span>
            {stats && stats.lowBalanceCount > 0 ? (
              <span className="font-bold text-amber-600 text-[11px] bg-amber-50 px-1.5 py-0.5 rounded">
                {stats.lowBalanceCount} Menipis
              </span>
            ) : (
              <span className="font-bold text-emerald-600 text-[11px]">Aman</span>
            )}
          </div>
        </div>

        {/* Card 5: Registered Users */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Member
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats ? stats.usersCount.toLocaleString() : "..."}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Hari ini:</span>
            <span className="font-bold text-indigo-600 font-mono">
              +{stats ? stats.usersTodayCount : "..."} baru
            </span>
          </div>
        </div>

        {/* Card 6: Support Tickets */}
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pusat Bantuan
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <LifeBuoy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {stats ? `${stats.openTicketsCount} Tiket` : "..."}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href="/admin/ticket"
              className="text-slate-500 hover:text-emerald-600 font-medium flex items-center gap-1"
            >
              <span>Kelola Tiket</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            {stats && stats.urgentTicketsCount > 0 ? (
              <span className="font-bold text-rose-600 text-[11px] bg-rose-50 px-1.5 py-0.5 rounded animate-pulse">
                {stats.urgentTicketsCount} Urgent
              </span>
            ) : (
              <span className="font-bold text-slate-400 text-[11px]">Normal</span>
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Order Pipeline & Queue Distribution */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Pipeline & Alur Status Pesanan
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Distribusi status seluruh pesanan SMM pada cluster database multi-shard.
            </p>
          </div>

          <Link
            href="/admin/history-order"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Buka Riwayat Order Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Visual Multi-Segment Distribution Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4 border border-slate-200/50">
          <div
            style={{ width: `${completedPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Completed: ${completedCount} (${completedPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${processingPct}%` }}
            className="bg-sky-500 transition-all duration-500"
            title={`Processing: ${processingCount} (${processingPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${pendingPct}%` }}
            className="bg-amber-400 transition-all duration-500"
            title={`Pending: ${pendingCount} (${pendingPct.toFixed(1)}%)`}
          />
          <div
            style={{ width: `${errorPct}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Canceled/Partial: ${errorCount} (${errorPct.toFixed(1)}%)`}
          />
        </div>

        {/* Status Category Badges with Direct Filter links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/history-order?status=Completed"
            className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 hover:bg-emerald-100/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-emerald-700 uppercase">Selesai (Completed)</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-lg font-black text-emerald-950 font-mono">
              {completedCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              {completedPct.toFixed(1)}% dari total
            </span>
          </Link>

          <Link
            href="/admin/history-order?status=Processing"
            className="p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 hover:bg-sky-100/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-sky-700 uppercase">Diproses (Processing)</span>
              <RefreshCw className="w-3.5 h-3.5 text-sky-600 group-hover:animate-spin" />
            </div>
            <div className="text-lg font-black text-sky-950 font-mono">
              {processingCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-sky-600 font-medium">
              {processingPct.toFixed(1)}% di API Provider
            </span>
          </Link>

          <Link
            href="/admin/history-order?status=Pending"
            className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 hover:bg-amber-100/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-700 uppercase">Antrian (Pending)</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-lg font-black text-amber-950 font-mono">
              {pendingCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-amber-600 font-medium">
              {pendingPct.toFixed(1)}% menunggu kirim
            </span>
          </Link>

          <Link
            href="/admin/history-order?status=Canceled"
            className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 hover:bg-rose-100/60 transition-all group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-rose-700 uppercase">Gagal / Dibatalkan</span>
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <div className="text-lg font-black text-rose-950 font-mono">
              {errorCount.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-600 font-medium">
              {errorPct.toFixed(1)}% pengembalian dana
            </span>
          </Link>
        </div>
      </div>

      {/* 5. Middle Grid: Multi-Cluster MongoDB Monitoring + API Provider Gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): API Provider Real-Time Gateway & 1-Click Sync */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-600" />
                  Saldo Gateway API Provider
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Konektivitas langsung ke supplier & sinkronisasi saldo riil ($)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncAllProviders}
                  disabled={isSyncingAllProviders}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 transition-all cursor-pointer"
                >
                  {isSyncingAllProviders ? "Menyinkronkan..." : "Sync Semua"}
                </button>
                <Link
                  href="/admin/provider"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <span>Kelola</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Provider List */}
            <div className="space-y-3">
              {stats && stats.providers.length > 0 ? (
                stats.providers.map((prov) => {
                  const isSyncingThis = syncingProviderId === prov.id;
                  const isLow = prov.status === "low";
                  const isCrit = prov.status === "critical";

                  return (
                    <div
                      key={prov.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCrit
                          ? "bg-rose-50/50 border-rose-200 hover:border-rose-300"
                          : isLow
                          ? "bg-amber-50/50 border-amber-200 hover:border-amber-300"
                          : "bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                            isCrit
                              ? "bg-rose-100 border-rose-200 text-rose-600"
                              : isLow
                              ? "bg-amber-100 border-amber-200 text-amber-600"
                              : "bg-emerald-50 border-emerald-100 text-emerald-600"
                          }`}
                        >
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{prov.name}</h4>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 font-semibold">
                              {prov.slug}
                            </span>
                            {isCrit && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                                Kritis
                              </span>
                            )}
                            {isLow && (
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                                Menipis
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs mt-0.5">
                            {prov.url || "URL belum dikonfigurasi"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Saldo Riil API</span>
                          <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                            {formatUSD(prov.balance)}
                          </span>
                        </div>

                        {/* 1-Click Sync Button */}
                        <button
                          onClick={() => handleSyncProvider(prov.id, prov.name)}
                          disabled={isSyncingThis || isSyncingAllProviders}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-600 hover:text-emerald-700 text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
                          title="Tarik saldo terbaru dari API provider ini"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${isSyncingThis ? "animate-spin text-emerald-600" : ""}`}
                          />
                          <span className="hidden sm:inline">Sync</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Belum ada API Provider yang terhubung.</p>
                  <Link
                    href="/admin/provider"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                  >
                    <span>Tambah Provider Sekarang</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Alokasi Modal Provider:</span>
            <span className="font-mono font-bold text-slate-900">
              {stats ? formatUSD(stats.totalProviderBalance) : "..."}
            </span>
          </div>
        </div>

        {/* Right Column (5 cols): Multi-Cluster MongoDB Infrastructure Health */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  Cluster Database Node
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Monitoring latensi dan beban server multi-shard
                </p>
              </div>

              <Link
                href="/admin/server"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Konfigurasi</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Server Nodes Grid */}
            <div className="space-y-2.5">
              {stats && stats.activeServers.length > 0 ? (
                stats.activeServers.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-xl">{srv.flag || "🌐"}</div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{srv.id}</span>
                          <span className="text-[10px] font-mono text-slate-400">({srv.group})</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block">
                          {srv.regionName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-800 block">
                          {srv.ordersCount.toLocaleString()} doc
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Beban Shard</span>
                      </div>

                      <div
                        className={`px-2 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 font-mono ${
                          srv.isOnline
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            srv.isOnline ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        <span>{srv.isOnline ? `${srv.pingMs || 10}ms` : "Offline"}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  Tidak ada cluster node yang terdaftar.
                </div>
              )}
            </div>
          </div>

          {/* Quick Management Shortcuts */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/admin/user"
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold border border-slate-200/80 transition-all flex flex-col items-center justify-center text-center gap-1 shadow-xs"
              >
                <Users className="w-4 h-4 text-slate-400" />
                <span>Pengguna</span>
              </Link>
              <Link
                href="/admin/cryptomus/setup"
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold border border-slate-200/80 transition-all flex flex-col items-center justify-center text-center gap-1 shadow-xs"
              >
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Cryptomus</span>
              </Link>
              <Link
                href="/admin/page-builder"
                className="p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold border border-slate-200/80 transition-all flex flex-col items-center justify-center text-center gap-1 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Page Builder</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Real-Time Live Order Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                Aliran Pesanan Realtime (Live Orders Stream)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase">
                Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pesanan pengguna terbaru yang masuk dan diproses secara otomatis oleh sistem.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter Chips */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold text-slate-600">
              {["ALL", "Pending", "Processing", "Completed", "Canceled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderFilter(s)}
                  className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer text-[11px] ${
                    orderFilter === s
                      ? "bg-white text-emerald-700 shadow-xs font-extrabold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <Link
              href="/admin/history-order"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <span>Semua Pesanan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Live Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice / ID</th>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Layanan & Target</th>
                <th className="py-3 px-4 text-center">Jumlah</th>
                <th className="py-3 px-4 text-right">Harga Jual</th>
                <th className="py-3 px-4 text-right">Profit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredRecentOrders.length > 0 ? (
                filteredRecentOrders.map((ord) => {
                  const badge = getStatusBadge(ord.status);
                  const isCopied = copiedInvoice === ord.invoice;

                  return (
                    <tr key={ord.id || ord.invoice} className="hover:bg-slate-50/80 transition-colors">
                      {/* Invoice */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(ord.invoice)}
                            className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                            title="Salin invoice"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span className="text-slate-800">{ord.invoice}</span>
                        </div>
                        {ord.order_id && (
                          <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                            API ID: {ord.order_id}
                          </span>
                        )}
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{ord.user_username}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {ord.user_level}
                        </span>
                      </td>

                      {/* Service & Target */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-bold text-slate-800 block truncate" title={ord.service_name}>
                          {ord.service_name}
                        </span>
                        <span
                          className="text-[11px] text-slate-400 font-mono block truncate mt-0.5"
                          title={ord.target}
                        >
                          Target: {ord.target}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        {ord.amount.toLocaleString()}
                      </td>

                      {/* Sale Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatUSD(ord.price_sale)}
                      </td>

                      {/* Profit */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                        +{formatUSD(ord.profit)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4 text-right text-slate-400 font-medium whitespace-nowrap">
                        {formatTimeAgo(ord.create_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    {isLoading ? "Memuat aliran pesanan..." : "Tidak ada pesanan pada filter ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Bottom Grid: Platform Breakdown + Recent Users */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Platform Category Distribution */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-600" />
                  Katalog & Platform
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Platform sosial media yang didukung</p>
              </div>

              <Link
                href="/admin/platform"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Semua Platform</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {stats && stats.platforms.length > 0 ? (
                stats.platforms.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">{p.name}</p>
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">
                      {p._count.categories} Kategori Layanan
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  Belum ada platform yang terdaftar.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Layanan Aktif:</span>
            <span className="font-mono font-bold text-slate-900">
              {stats ? `${stats.servicesCount} Layanan` : "..."}
            </span>
          </div>
        </div>

        {/* Right Column (7 cols): Latest Registered Users */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Pengguna Terdaftar Terbaru
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Akun member yang baru saja mendaftar di situs
                </p>
              </div>

              <Link
                href="/admin/user"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/80 transition-colors"
              >
                <span>Kelola User</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Pengguna</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4 text-right">Saldo</th>
                    <th className="py-3 px-4 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {stats && stats.recentUsers.length > 0 ? (
                    stats.recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {u.username}
                        </td>
                        <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{u.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.level === "Admin"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {u.level}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 text-right">
                          {formatUSD(Number(u.balance || 0))}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                          {new Date(u.create_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Belum ada data pengguna.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium bg-slate-50/40">
            <span>Total Saldo Dompet Member:</span>
            <span className="font-mono font-bold text-slate-900">
              {stats ? formatUSD(stats.totalUserBalance) : "..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
