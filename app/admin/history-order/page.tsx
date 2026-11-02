"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Database,
  Server,
  RefreshCw,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  ExternalLink,
  Download,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
  Layers,
  Globe,
  Shield,
  Sparkles,
  SlidersHorizontal,
  Edit,
  Loader2,
  X,
  FileText,
  Activity,
  ArrowRight,
  Zap,
  RotateCcw,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

interface EnrichedOrder {
  id: number;
  uuid_user: string;
  uuid_api_provider: string | null;
  service_id: string;
  invoice: string;
  order_id: string | null;
  amount: number;
  price_api: number;
  price_sale: number;
  target: string;
  remains: number;
  start: number;
  refill: boolean;
  status: string;
  server_area?: string | null;
  refund_amount?: number;
  refunded?: boolean;
  create_at: string;
  update_at: string;
  user_username: string;
  user_email?: string | null;
  user_level?: string | null;
  user_server_area?: string | null;
  service_name: string;
  category_name: string;
  provider_name?: string | null;
  profit: number;
}

interface ServerInfo {
  id: string;
  group: string;
  regionName: string;
  flag: string;
  isOnline: boolean;
  pingMs: number | null;
  ordersCount: number;
}

interface Metrics {
  totalOrders: number;
  totalOmset: number;
  totalModal: number;
  totalProfit: number;
  serverCounts: Record<string, number>;
  statusCounts: Record<string, number>;
}

export default function AdminHistoryOrderPage() {
  const { toast } = useToast();

  // State
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [activeServers, setActiveServers] = useState<ServerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Pagination
  const [serverNode, setServerNode] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Modals
  const [selectedOrder, setSelectedOrder] = useState<EnrichedOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editRemains, setEditRemains] = useState<number | string>("");
  const [editStart, setEditStart] = useState<number | string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Copied state tracker
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Syncing state with Provider API
  const [syncingInvoices, setSyncingInvoices] = useState<Set<string>>(new Set());
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        serverNode,
        status: statusFilter,
        search: debouncedSearch,
      });

      const res = await fetch(`/api/admin/history-order?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setOrders(json.data || []);
        setMetrics(json.metrics || null);
        setActiveServers(json.activeServers || []);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalOrders(json.pagination?.total || 0);
      } else {
        toast.error("Gagal Memuat Data", json.message || "Gagal mengambil data pesanan MongoDB.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Koneksi Terputus", "Tidak dapat terhubung ke server API.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [page, limit, serverNode, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCopy = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(text);
      toast.success("Tersalin", `${label} berhasil disalin ke clipboard.`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleOpenEdit = (order: EnrichedOrder) => {
    setSelectedOrder(order);
    setEditStatus(order.status);
    setEditRemains(order.remains);
    setEditStart(order.start);
    setIsEditModalOpen(true);
  };

  const handleSaveOrderUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      const res = await fetch("/api/admin/history-order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: selectedOrder.invoice,
          status: editStatus,
          remains: Number(editRemains),
          start: Number(editStart),
          server_area: selectedOrder.server_area,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memperbarui status");
      }

      toast.success("Status Diperbarui", json.message);
      setIsEditModalOpen(false);
      fetchOrders(true);
    } catch (err) {
      toast.error("Gagal Menyimpan", err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Syncs single order status directly with Provider API and refunds user balance if canceled/partial
   */
  const handleSyncProviderStatus = async (order: EnrichedOrder) => {
    if (!order.order_id) {
      toast.warning(
        "Tidak Ada Order ID",
        "Pesanan ini belum memiliki Order ID dari Provider API."
      );
      return;
    }

    setSyncingInvoices((prev) => new Set(prev).add(order.invoice));

    try {
      const res = await fetch("/api/admin/history-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: order.invoice,
          server_area: order.server_area,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal sinkronisasi dengan server provider");
      }

      toast.success("Status Diperbarui", json.message);

      // If detail modal is currently showing this order, update its content in real-time
      if (selectedOrder && selectedOrder.invoice === order.invoice && json.data) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: json.data.newStatus,
                remains: json.data.remains ?? prev.remains,
                start: json.data.start ?? prev.start,
                refund_amount: json.data.refund?.totalRefundDue ?? prev.refund_amount,
                refunded: (json.data.refund?.totalRefundDue || 0) > 0,
              }
            : null
        );
      }

      // Also update edit modal inputs if open
      if (isEditModalOpen && selectedOrder && selectedOrder.invoice === order.invoice && json.data) {
        setEditStatus(json.data.newStatus);
        if (json.data.remains !== undefined) setEditRemains(json.data.remains);
        if (json.data.start !== undefined) setEditStart(json.data.start);
      }

      fetchOrders(true);
    } catch (err) {
      toast.error(
        "Gagal Sinkronisasi",
        err instanceof Error ? err.message : "Terjadi kesalahan saat memeriksa status provider"
      );
    } finally {
      setSyncingInvoices((prev) => {
        const next = new Set(prev);
        next.delete(order.invoice);
        return next;
      });
    }
  };

  /**
   * Bulk sync all visible active/pending/processing orders on this page
   */
  const handleSyncAllVisible = async () => {
    const validInvoices = orders
      .filter((o) => o.order_id && o.status !== "Completed" && o.status !== "Canceled")
      .map((o) => o.invoice);

    if (validInvoices.length === 0) {
      toast.info(
        "Tidak Ada Pesanan Aktif",
        "Semua pesanan yang tampil sudah selesai/dibatalkan atau belum memiliki Order ID provider."
      );
      return;
    }

    setIsBulkSyncing(true);
    try {
      const res = await fetch("/api/admin/history-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoices: validInvoices,
          server_area: serverNode !== "ALL" ? serverNode : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal sinkronisasi massal");
      }

      toast.success("Sinkronisasi Selesai", json.message);
      fetchOrders(true);
    } catch (err) {
      toast.error(
        "Gagal Sinkronisasi Massal",
        err instanceof Error ? err.message : "Terjadi kesalahan"
      );
    } finally {
      setIsBulkSyncing(false);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.info("Data Kosong", "Tidak ada data pesanan untuk diekspor.");
      return;
    }

    const headers = [
      "Invoice",
      "Order ID",
      "Username",
      "Email",
      "Node Server",
      "Layanan",
      "Kategori",
      "Provider",
      "Target",
      "Jumlah",
      "Modal ($)",
      "Jual ($)",
      "Laba ($)",
      "Status",
      "Tanggal",
    ];

    const rows = orders.map((o) => [
      `"${o.invoice}"`,
      `"${o.order_id || "-"}"`,
      `"${o.user_username}"`,
      `"${o.user_email || "-"}"`,
      `"${o.server_area || "-"}"`,
      `"${o.service_name.replace(/"/g, '""')}"`,
      `"${o.category_name.replace(/"/g, '""')}"`,
      `"${o.provider_name || "-"}"`,
      `"${o.target.replace(/"/g, '""')}"`,
      o.amount,
      o.price_api,
      o.price_sale,
      o.profit,
      `"${o.status}"`,
      `"${new Date(o.create_at).toLocaleString("id-ID")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `orders_mongodb_${serverNode}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Ekspor Berhasil", "File CSV pesanan berhasil diunduh.");
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "success") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );
    }
    if (s === "processing" || s === "in progress") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
          <span>{status}</span>
        </span>
      );
    }
    if (s === "pending") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending</span>
        </span>
      );
    }
    if (s === "partial") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
          <AlertTriangle className="w-3 h-3 text-orange-600" />
          <span>Partial</span>
        </span>
      );
    }
    if (s === "canceled" || s === "cancelled" || s === "failed") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Canceled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 bg-white antialiased">
      {/* Search, Server Filter & Status Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3.5">
        {/* Row 1: Search, Filter Status, Limit, and Actions */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Field */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari berdasarkan Invoice (INV-...), Order ID, Target, Username, atau Layanan..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
            />
          </div>

          {/* Filters & Actions Group */}
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="ALL">Semua Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
                <option value="Partial">Partial</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>

            {/* Limit Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-[11px] font-medium text-slate-400">Baris:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent py-1 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchOrders(true)}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Segarkan data transaksi dari seluruh database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
            </button>

            {/* Sync All Provider Button */}
            <button
              onClick={handleSyncAllVisible}
              disabled={isLoading || isBulkSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              title="Perbarui status semua pesanan aktif dari Provider API & refund otomatis"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBulkSyncing ? "animate-spin text-indigo-600" : ""}`} />
              <span>{isBulkSyncing ? "Menyinkronkan..." : "Sinkron Provider"}</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer shadow-xs"
              title="Unduh data dalam format CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Row 2: Klaster Server Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-indigo-600" />
            <span>Server:</span>
          </span>

          <button
            onClick={() => {
              setServerNode("ALL");
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              serverNode === "ALL"
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/20"
                : "bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Semua Klaster</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                serverNode === "ALL" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {metrics?.totalOrders ?? totalOrders}
            </span>
          </button>

          {activeServers.map((srv) => {
            const isSelected = serverNode.toUpperCase() === srv.id.toUpperCase();
            return (
              <button
                key={srv.id}
                onClick={() => {
                  setServerNode(srv.id);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/20"
                    : "bg-slate-50 border border-slate-200/80 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{srv.flag}</span>
                <span>{srv.id}</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    srv.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                  }`}
                  title={srv.isOnline ? `Online (${srv.pingMs}ms)` : "Offline"}
                />
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {srv.ordersCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Invoice &amp; ID</th>
                <th className="py-3.5 px-4">Pengguna</th>
                <th className="py-3.5 px-4">Node Server</th>
                <th className="py-3.5 px-4">Layanan &amp; Target</th>
                <th className="py-3.5 px-4 text-center">Jumlah</th>
                <th className="py-3.5 px-4">Harga Modal ($)</th>
                <th className="py-3.5 px-4">Harga Jual ($)</th>
                <th className="py-3.5 px-4">Laba ($)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Waktu</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                      Memindai data pesanan dari seluruh klaster MongoDB...
                    </p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-16 text-center text-slate-400">
                    <Database className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-slate-700">Tidak ada transaksi ditemukan</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {debouncedSearch || statusFilter !== "ALL" || serverNode !== "ALL"
                        ? "Coba ubah kata kunci pencarian atau filter server/status."
                        : "Belum ada pesanan yang masuk ke klaster database MongoDB."}
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr
                    key={ord.invoice}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Invoice & Order ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {ord.invoice}
                        </span>
                        <button
                          onClick={() => handleCopy(ord.invoice, "Invoice")}
                          className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Salin Invoice"
                        >
                          {copiedKey === ord.invoice ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      {ord.order_id && (
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          API ID: {ord.order_id}
                        </span>
                      )}
                    </td>

                    {/* Pengguna */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shadow-xs">
                          {ord.user_username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{ord.user_username}</p>
                          <span className="text-[10px] text-slate-400 truncate block max-w-[120px]">
                            {ord.user_email || `UUID: ${ord.uuid_user.slice(0, 8)}...`}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Node Server MongoDB */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                        <Server className="w-3 h-3 text-indigo-600" />
                        <span>{ord.server_area || "SG_1"}</span>
                      </span>
                    </td>

                    {/* Layanan & Target */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 text-xs truncate" title={ord.service_name}>
                        {ord.service_name}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        <span className="text-slate-400">Target:</span>
                        <span className="truncate max-w-[160px]" title={ord.target}>
                          {ord.target}
                        </span>
                        <button
                          onClick={() => handleCopy(ord.target, "Target")}
                          className="text-slate-400 hover:text-indigo-600 transition-colors ml-1 cursor-pointer shrink-0"
                          title="Salin Target"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Jumlah */}
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-900">
                      {ord.amount.toLocaleString()}
                    </td>

                    {/* Harga Modal */}
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      ${Number(ord.price_api || 0).toFixed(4)}
                    </td>

                    {/* Harga Jual */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ${Number(ord.price_sale || 0).toFixed(4)}
                    </td>

                    {/* Laba */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      +${Number(ord.profit || 0).toFixed(4)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ord.status)}
                      {ord.refund_amount !== undefined && ord.refund_amount > 0 && (
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-1.5 py-0.5 rounded-md mt-1 block w-fit"
                          title="Sebagian atau seluruh saldo telah dikembalikan ke balance pengguna"
                        >
                          <RotateCcw className="w-2.5 h-2.5" />
                          <span>Refund ${Number(ord.refund_amount).toFixed(4)}</span>
                        </span>
                      )}
                    </td>

                    {/* Waktu */}
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500 whitespace-nowrap">
                      {new Date(ord.create_at).toLocaleString("id-ID", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tombol Update Status Provider */}
                        <button
                          onClick={() => handleSyncProviderStatus(ord)}
                          disabled={!ord.order_id || syncingInvoices.has(ord.invoice)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            syncingInvoices.has(ord.invoice)
                              ? "bg-indigo-100 text-indigo-700"
                              : ord.order_id
                              ? "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                              : "text-slate-300 cursor-not-allowed"
                          }`}
                          title={
                            ord.order_id
                              ? `Perbarui status langsung dari Provider (${ord.provider_name || "API"}) & refund otomatis jika cancel/partial`
                              : "Pesanan ini belum memiliki Order ID dari provider"
                          }
                        >
                          <RefreshCw
                            className={`w-4 h-4 ${
                              syncingInvoices.has(ord.invoice) ? "animate-spin text-indigo-600" : ""
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Lihat Rincian Lengkap"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(ord)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Ubah Status / Data"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Menampilkan <strong>{orders.length}</strong> dari <strong>{totalOrders}</strong> total pesanan tercatat
            {serverNode !== "ALL" && (
              <span className="ml-1 text-indigo-600 font-semibold">(Klaster: {serverNode})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-bold text-slate-800">
              Hal {page} dari {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Halaman Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Rincian Transaksi Pesanan</h3>
                  <p className="text-xs font-mono text-slate-500 font-bold">{selectedOrder.invoice}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedOrder.status)}
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Box 1: Info Server MongoDB */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 text-xs block flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Klaster Database MongoDB</span>
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Node Server Area:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.server_area || "SG_1"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Koleksi Dokumen:</span>
                  <span className="font-mono text-slate-700 font-semibold">order_smm</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">ID Dokumen:</span>
                  <span className="font-mono text-slate-700">#{selectedOrder.id}</span>
                </div>
              </div>

              {/* Box 2: Info Pengguna */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 text-xs block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Informasi Pemesan</span>
                </span>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Username:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.user_username}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-700 truncate max-w-[160px]">{selectedOrder.user_email || "-"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">UUID Pemesan:</span>
                  <span className="font-mono text-slate-500 text-[10px] truncate max-w-[150px]">
                    {selectedOrder.uuid_user}
                  </span>
                </div>
              </div>

              {/* Box 3: Layanan & Provider */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 sm:col-span-2">
                <span className="font-bold text-slate-900 text-xs block flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Detail Layanan &amp; Provider API</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nama Layanan:</span>
                    <span className="font-bold text-slate-900 block mt-0.5">{selectedOrder.service_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Kategori:</span>
                    <span className="font-semibold text-slate-800 block mt-0.5">{selectedOrder.category_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">API Provider:</span>
                    <span className="font-bold text-indigo-600 block mt-0.5">
                      {selectedOrder.provider_name || "Layanan Manual"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Provider Order ID:</span>
                    <span className="font-mono font-bold text-slate-800 block mt-0.5">
                      {selectedOrder.order_id || "Belum ada / Manual"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 4: Finansial Transaksi */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 sm:col-span-2">
                <span className="font-bold text-slate-900 text-xs block flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kalkulasi Biaya &amp; Keuntungan</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Jumlah Pesanan</span>
                    <span className="font-black text-slate-900 text-sm font-mono mt-0.5 block">
                      {selectedOrder.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Harga Modal</span>
                    <span className="font-bold text-slate-700 text-sm font-mono mt-0.5 block">
                      ${Number(selectedOrder.price_api).toFixed(4)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Harga Jual</span>
                    <span className="font-black text-slate-900 text-sm font-mono mt-0.5 block">
                      ${Number(selectedOrder.price_sale).toFixed(4)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80">
                    <span className="text-emerald-700 block text-[10px] uppercase font-bold">Laba Bersih</span>
                    <span className="font-black text-emerald-700 text-sm font-mono mt-0.5 block">
                      +${Number(selectedOrder.profit).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Box 5: Target & Progres */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Target / Link Tujuan:</span>
                  <button
                    onClick={() => handleCopy(selectedOrder.target, "Target")}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Salin Target</span>
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono text-xs break-all">
                  {selectedOrder.target}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Start Count: <strong>{selectedOrder.start}</strong></span>
                  <span>Remains: <strong>{selectedOrder.remains}</strong></span>
                  <span>Refill: <strong>{selectedOrder.refill ? "Aktif" : "Non-Aktif"}</strong></span>
                </div>
              </div>

              {/* Box 6: Status Refund (Jika Ada) */}
              {selectedOrder.refund_amount !== undefined && selectedOrder.refund_amount > 0 && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 sm:col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <RotateCcw className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <p className="font-bold text-rose-900 text-xs">Pengembalian Saldo Pengguna (Refund)</p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        Saldo sebesar <strong>${Number(selectedOrder.refund_amount).toFixed(4)}</strong> telah berhasil dikembalikan ke akun pengguna @{selectedOrder.user_username}.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm text-rose-700 bg-white/70 px-2 py-1 rounded-lg border border-rose-200">
                    +${Number(selectedOrder.refund_amount).toFixed(4)}
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
              <div>
                {selectedOrder.order_id && (
                  <button
                    type="button"
                    onClick={() => handleSyncProviderStatus(selectedOrder)}
                    disabled={syncingInvoices.has(selectedOrder.invoice)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xs shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        syncingInvoices.has(selectedOrder.invoice) ? "animate-spin" : ""
                      }`}
                    />
                    <span>
                      {syncingInvoices.has(selectedOrder.invoice)
                        ? "Menyinkronkan..."
                        : "Perbarui Status dari Provider"}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenEdit(selectedOrder);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Ubah Manual</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STATUS MODAL */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Perbarui Status Pesanan</h3>
                <p className="text-xs font-mono text-slate-500 font-bold">{selectedOrder.invoice}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick action: Sync directly from provider */}
            {selectedOrder.order_id && (
              <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-indigo-950">Ambil Status dari Provider</p>
                  <p className="text-[11px] text-indigo-600 font-mono">ID: {selectedOrder.order_id}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSyncProviderStatus(selectedOrder)}
                  disabled={syncingInvoices.has(selectedOrder.invoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${
                      syncingInvoices.has(selectedOrder.invoice) ? "animate-spin" : ""
                    }`}
                  />
                  <span>Sinkronkan</span>
                </button>
              </div>
            )}

            <form onSubmit={handleSaveOrderUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Status Baru
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="In progress">In progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Partial">Partial</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Start Count
                  </label>
                  <input
                    type="number"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Remains (Sisa)
                  </label>
                  <input
                    type="number"
                    value={editRemains}
                    onChange={(e) => setEditRemains(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Warning for Automatic Refunds */}
              {editStatus === "Canceled" && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Pengembalian Saldo Otomatis (100%)</p>
                    <p className="text-[11px] mt-0.5">
                      Mengubah status ke <strong>Canceled</strong> akan mengembalikan seluruh saldo pesanan sebesar{" "}
                      <strong>${Number(selectedOrder.price_sale).toFixed(4)}</strong> ke akun pengguna @{selectedOrder.user_username}.
                    </p>
                  </div>
                </div>
              )}

              {editStatus === "Partial" && (
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Pengembalian Saldo Proporsional (Partial)</p>
                    <p className="text-[11px] mt-0.5">
                      Mengubah status ke <strong>Partial</strong> akan mengembalikan sisa saldo sesuai jumlah yang belum dikerjakan (remains{" "}
                      <strong>{editRemains || 0}</strong> dari {selectedOrder.amount.toLocaleString()}) ke saldo pengguna @{selectedOrder.user_username}.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed">
                Perubahan status akan langsung disimpan ke dokumen <strong>order_smm</strong> pada klaster MongoDB node{" "}
                <strong>{selectedOrder.server_area || "SG_1"}</strong>.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

