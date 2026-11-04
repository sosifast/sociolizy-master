"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Server,
  Activity,
  Zap,
  Globe,
  Radio,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  HardDrive,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Layers,
  ArrowUpRight,
  Gauge,
  ShieldCheck,
  Network,
  Users,
  Eye,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import { useCachedFetch } from "@/lib/client-cache";
import ServerDetailModal, { ServerData } from "./server-detail-modal";

export default function AdminServerMonitoringPage() {
  const { toast } = useToast();

  const {
    data,
    setData,
    isLoading,
    isRefreshing,
    refresh: fetchServers,
  } = useCachedFetch<{
    active: {
      group: string;
      server: string;
      regionName: string;
      flag: string;
      maskedUri: string;
    };
    stats: {
      totalRegions: number;
      totalServers: number;
      onlineCount: number;
      standbyCount: number;
      maintenanceCount: number;
      avgLatency: number;
      totalThroughput: number;
      totalBandwidth: number;
      totalAssignedUsers: number;
    };
    regions: Array<{
      code: string;
      name: string;
      flag: string;
      serversCount: number;
    }>;
    servers: ServerData[];
  }>("/api/admin/server", { ttlMs: 10_000 });

  // Filters & Pagination State
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail Modal State
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    server: ServerData | null;
  }>({
    isOpen: false,
    server: null,
  });

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRegion, selectedStatus, searchQuery, pageSize]);

  // Auto-refresh interval (every 10s if toggled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchServers();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchServers]);

  // Ping single server
  const handleQuickPing = async (e: React.MouseEvent, serverId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/admin/server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping", serverId }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        toast.success("Ping Responsif", `${serverId}: ${json.data.latencyMs} ms (${json.data.jitter} jitter)`);
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            servers: prev.servers.map((s) =>
              s.id === serverId ? { ...s, latencyMs: json.data.latencyMs } : s
            ),
          };
        });
      }
    } catch {
      toast.error("Ping Gagal", `Server ${serverId} tidak merespon.`);
    }
  };

  // Copy URI
  const handleCopyUri = (e: React.MouseEvent, uri: string | null, id: string) => {
    e.stopPropagation();
    if (uri) {
      navigator.clipboard.writeText(uri);
      setCopiedId(id);
      toast.success("Tersalin", `Koneksi URI ${id} telah disalin.`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filtered servers calculation
  const filteredServers = useMemo(() => {
    if (!data?.servers) return [];
    return data.servers.filter((s) => {
      // Region filter
      if (selectedRegion !== "ALL" && s.group !== selectedRegion) return false;
      // Status filter
      if (selectedStatus !== "ALL" && s.status !== selectedStatus) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = s.id.toLowerCase().includes(query);
        const matchesRegion = s.regionName.toLowerCase().includes(query);
        const matchesHost = s.host.toLowerCase().includes(query);
        if (!matchesId && !matchesRegion && !matchesHost) return false;
      }
      return true;
    });
  }, [data?.servers, selectedRegion, selectedStatus, searchQuery]);

  // Paginated servers
  const totalPages = pageSize === 0 ? 1 : Math.ceil(filteredServers.length / pageSize);
  const paginatedServers = useMemo(() => {
    if (pageSize === 0) return filteredServers;
    const start = (currentPage - 1) * pageSize;
    return filteredServers.slice(start, start + pageSize);
  }, [filteredServers, currentPage, pageSize]);

  return (
    <div className="space-y-6">
      {/* Unified Table Section Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header Toolbar: Region Tabs, Controls & Search/Filters */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3.5 bg-white">
          {/* Top Row: Region Selector Tabs + Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Region Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin scrollbar-thumb-slate-200">
              <button
                onClick={() => setSelectedRegion("ALL")}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedRegion === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>Semua Wilayah ({data?.stats.totalServers ?? 0})</span>
              </button>

              {data?.regions.map((reg) => {
                const isSelected = selectedRegion === reg.code;
                return (
                  <button
                    key={reg.code}
                    onClick={() => setSelectedRegion(reg.code)}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span>{reg.flag}</span>
                    <span>{reg.name}</span>
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-white text-slate-500 border border-slate-200"
                      }`}
                    >
                      {reg.serversCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Action Buttons inside Card */}
            <div className="flex items-center gap-2 flex-shrink-0 justify-end">
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  autoRefresh
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                <span>Auto Refresh: {autoRefresh ? "ON" : "OFF"}</span>
              </button>

              {/* Manual Refresh */}
              <button
                onClick={() => fetchServers()}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Menyegarkan..." : "Segarkan"}</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID server (SG_1), cluster host, region..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>

            {/* Status Filter & Page Size Selector */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap">
              {/* Status Select */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <Filter className="w-3.5 h-3.5" />
                <span>Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="online">Online</option>
                  <option value="standby">Standby</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              {/* Rows per page */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                <span>Tampilkan:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 Baris</option>
                  <option value={25}>25 Baris</option>
                  <option value={50}>50 Baris</option>
                  <option value={100}>100 Baris</option>
                  <option value={0}>Semua Server</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table Body / Loading / Empty */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
            <p className="text-sm font-bold text-slate-700">Menghubungkan ke Node Database Server...</p>
            <p className="text-xs text-slate-400 mt-1">Mengambil status latensi, trafik, dan alokasi realtime.</p>
          </div>
        ) : filteredServers.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Server className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-700">Tidak ada server yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau filter wilayah di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-3.5 text-center w-10">#</th>
                  <th className="py-3.5 px-4">Node Server</th>
                  <th className="py-3.5 px-4">Wilayah &amp; Host Cluster</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Alokasi User</th>
                  <th className="py-3.5 px-4">Latensi</th>
                  <th className="py-3.5 px-4">Throughput</th>
                  <th className="py-3.5 px-4">Beban CPU / RAM</th>
                  <th className="py-3.5 px-4">Koneksi</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedServers.map((server, idx) => {
                  const globalIndex = pageSize === 0 ? idx + 1 : (currentPage - 1) * pageSize + idx + 1;
                  return (
                    <tr
                      key={server.id}
                      onClick={() => setDetailModal({ isOpen: true, server })}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                        server.isActive ? "bg-emerald-50/20" : ""
                      }`}
                    >
                      {/* # */}
                      <td className="py-3 px-3.5 text-slate-400 font-mono text-[11px] text-center">
                        {globalIndex}
                      </td>

                      {/* Node Server */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl shrink-0" role="img" aria-label={server.regionName}>
                            {server.flag}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-xs font-mono">
                                {server.id}
                              </span>
                              {server.isActive && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  AKTIF
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Node #{server.serverIndex}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Wilayah & Host */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 text-xs">{server.regionName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] font-mono text-slate-500 truncate max-w-[180px] sm:max-w-[220px]" title={server.host}>
                            {server.host}
                          </span>
                          <button
                            onClick={(e) => handleCopyUri(e, server.uri, server.id)}
                            title="Salin URI Koneksi"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            {copiedId === server.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {server.status === "online" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ONLINE
                          </span>
                        ) : server.status === "standby" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            STANDBY
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            MAINTENANCE
                          </span>
                        )}
                      </td>

                      {/* Alokasi User */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                          <Users className="w-3 h-3 text-emerald-600" />
                          <span>{server.assignedUsers?.toLocaleString("id-ID") ?? 0} User</span>
                        </span>
                      </td>

                      {/* Latensi */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md inline-block ${
                            server.latencyMs < 50
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : server.latencyMs < 120
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {server.latencyMs} ms
                        </span>
                      </td>

                      {/* Throughput */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800 text-xs">
                          {server.qps.toLocaleString("id-ID")} QPS
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {server.bandwidthMbps} MB/s
                        </div>
                      </td>

                      {/* Resource CPU & RAM */}
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="space-y-1.5">
                          {/* CPU bar */}
                          <div>
                            <div className="flex justify-between text-[10px] font-bold mb-0.5">
                              <span className="text-slate-400">CPU</span>
                              <span className="text-slate-700">{server.cpuPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  server.cpuPercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.min(100, server.cpuPercent)}%` }}
                              />
                            </div>
                          </div>

                          {/* RAM bar */}
                          <div>
                            <div className="flex justify-between text-[10px] font-bold mb-0.5">
                              <span className="text-slate-400">RAM</span>
                              <span className="text-slate-700">{server.memoryPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal-500 transition-all duration-300"
                                style={{ width: `${Math.min(100, server.memoryPercent)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Connection Pool */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-slate-800">
                          {server.activeConnections} <span className="text-slate-400 font-normal">/ 100</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {server.iops} IOPS
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleQuickPing(e, server.id)}
                            title="Uji responsif ping server ini"
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                          >
                            Ping
                          </button>
                          <button
                            onClick={() => setDetailModal({ isOpen: true, server })}
                            title="Lihat detail lengkap server"
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Summary & Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50/50">
            <div>
              Menampilkan{" "}
              <strong>
                {filteredServers.length === 0
                  ? 0
                  : pageSize === 0
                  ? 1
                  : (currentPage - 1) * pageSize + 1}
              </strong>{" "}
              -{" "}
              <strong>
                {pageSize === 0
                  ? filteredServers.length
                  : Math.min(currentPage * pageSize, filteredServers.length)}
              </strong>{" "}
              dari <strong>{filteredServers.length}</strong> server
              {selectedRegion !== "ALL" || selectedStatus !== "ALL" || searchQuery ? (
                <span className="text-slate-400 ml-1">
                  (difilter dari total {data?.stats.totalServers ?? 0} server)
                </span>
              ) : null}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    // Show first, last, and current +/- 1 pages
                    if (
                      p === 1 ||
                      p === totalPages ||
                      (p >= currentPage - 1 && p <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            currentPage === p
                              ? "bg-slate-900 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    }
                    if (p === currentPage - 2 || p === currentPage + 2) {
                      return (
                        <span key={p} className="text-slate-400 text-xs px-0.5">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Detail Modal Component */}
      <ServerDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, server: null })}
        server={detailModal.server}
      />
    </div>
  );
}
