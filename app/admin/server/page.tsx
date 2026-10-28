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
  Loader2,
  Layers,
  ArrowUpRight,
  Gauge,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  Network,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";
import ServerDetailModal, { ServerData } from "./server-detail-modal";

export default function AdminServerMonitoringPage() {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<{
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
    };
    regions: Array<{
      code: string;
      name: string;
      flag: string;
      serversCount: number;
    }>;
    servers: ServerData[];
  } | null>(null);

  // Filters & State
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Detail Modal
  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    server: ServerData | null;
  }>({
    isOpen: false,
    server: null,
  });

  // Fetch servers data
  const fetchServers = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/server");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        toast.error("Gagal Memuat Data", json.message || "Gagal mengambil data cluster server.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Kesalahan Jaringan", "Tidak dapat terhubung ke server API monitoring.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  // Auto-refresh interval (every 10s if toggled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchServers(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Set active routing handler
  const handleSetActive = async (group: string, serverId: string) => {
    try {
      const res = await fetch("/api/admin/server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_active", group, server: serverId }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          "Routing Server Berubah",
          `Server aktif dialihkan ke ${group} - ${serverId}`
        );
        fetchServers(true);
        if (detailModal.isOpen && detailModal.server) {
          setDetailModal((prev) => ({
            ...prev,
            server: prev.server ? { ...prev.server, isActive: prev.server.id === serverId } : null,
          }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal Mengubah Routing", "Terjadi kesalahan saat mengupdate server aktif.");
    }
  };

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
        // Update local latency in state
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
    } catch (err) {
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
              Cluster Database Infrastructure
            </span>
            {data?.active && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ROUTING AKTIF: {data.active.server} ({data.active.regionName})</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Server &amp; Cluster Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoring realtime <span className="font-bold text-slate-800">{data?.stats.totalServers ?? "..."} node database</span> di <span className="font-bold text-slate-800">{data?.stats.totalRegions ?? "..."} zona global</span> yang terdeteksi otomatis langsung dari file <code className="font-mono text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs">.env</code>.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              autoRefresh
                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span>Auto Refresh (10s): {autoRefresh ? "ON" : "OFF"}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchServers()}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 shadow-sm shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Perbarui Data</span>
          </button>
        </div>
      </div>

      {/* Global Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Nodes */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">Total Database Node</span>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {data?.stats.totalServers || 45}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Terdistribusi di <strong className="text-slate-800">{data?.stats.totalRegions || 9} Wilayah Global</strong>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
            <Server className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Cluster Health */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">Status Kesehatan Cluster</span>
            <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
              {data ? Math.round((data.stats.onlineCount / data.stats.totalServers) * 100) : 93}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">{data?.stats.onlineCount || 42} Online</span> &bull; 
              <span className="text-amber-600 font-bold">{data?.stats.standbyCount || 2} Standby</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Avg Global Latency */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">Rata-rata Latensi Jaringan</span>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1">
              <span>{data?.stats.avgLatency || 38}</span>
              <span className="text-sm font-bold text-slate-500">ms</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">
              Cluster Responsif &bull; Jitter Rendah
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Throughput */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">Total Throughput Trafik</span>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {data?.stats.totalThroughput.toLocaleString("id-ID") || "48.250"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              Bandwidth: <strong className="text-slate-800">{data?.stats.totalBandwidth || 156.4} MB/s</strong>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shadow-xs">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Region Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
        <button
          onClick={() => setSelectedRegion("ALL")}
          className={`flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            selectedRegion === "ALL"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
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
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-red-600 text-white shadow-sm shadow-red-600/30"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{reg.flag}</span>
              <span>{reg.name}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {reg.serversCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID server (SG_1), cluster host..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Status Filter & View Toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="online">Online</option>
              <option value="standby">Standby</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Loading / Empty / Server Display */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600 mb-3" />
          <p className="text-sm font-bold text-slate-700">Menghubungkan ke 45 Database Server Nodes...</p>
          <p className="text-xs text-slate-400 mt-1">Mengambil status latensi, trafik, dan throughput realtime.</p>
        </div>
      ) : filteredServers.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400">
          <Server className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-bold text-slate-700">Tidak ada server yang cocok</p>
          <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau filter wilayah.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredServers.map((server) => (
            <div
              key={server.id}
              onClick={() => setDetailModal({ isOpen: true, server })}
              className={`group relative p-5 rounded-3xl bg-white border transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 ${
                server.isActive
                  ? "border-red-300 ring-2 ring-red-500/20 shadow-md"
                  : "border-slate-200/90 hover:border-slate-300"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                    <span>{server.flag}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-red-600 transition-colors">
                        {server.id}
                      </h3>
                      {server.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-600 border border-red-200">
                          ROUTED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {server.regionName} &bull; Node {server.serverIndex}
                    </p>
                  </div>
                </div>

                {/* Status & Latency Badges */}
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      server.status === "online"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : server.status === "standby"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        server.status === "online"
                          ? "bg-emerald-500 animate-pulse"
                          : server.status === "standby"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {server.status.toUpperCase()}
                  </span>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      server.latencyMs < 50
                        ? "bg-emerald-50 text-emerald-700"
                        : server.latencyMs < 120
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {server.latencyMs} ms
                  </span>
                </div>
              </div>

              {/* Hostname info */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 mb-3 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600 truncate text-[11px]">
                  {server.host}
                </span>
                <button
                  onClick={(e) => handleCopyUri(e, server.uri, server.id)}
                  title="Salin URI Koneksi"
                  className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors"
                >
                  {copiedId === server.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Resource Bars */}
              <div className="space-y-2 mb-4">
                {/* CPU */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">CPU Compute</span>
                    <span className="text-slate-800">{server.cpuPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        server.cpuPercent > 70 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${server.cpuPercent}%` }}
                    />
                  </div>
                </div>

                {/* RAM */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Memory (RAM)</span>
                    <span className="text-slate-800">{server.memoryPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${server.memoryPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Traffic & Connection metrics */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs mb-4">
                <div>
                  <span className="text-slate-400 text-[10px] block">Query Rate</span>
                  <span className="font-extrabold text-slate-800">{server.qps.toLocaleString("id-ID")} QPS</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Connection Pool</span>
                  <span className="font-extrabold text-slate-800">{server.activeConnections} / 100</span>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={(e) => handleQuickPing(e, server.id)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Uji Ping
                </button>

                <div className="flex items-center gap-1.5">
                  {!server.isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetActive(server.group, server.id);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Pilih Aktif
                    </button>
                  )}
                  <span className="inline-flex items-center text-xs font-bold text-slate-500 group-hover:text-red-600 transition-colors">
                    Detail <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Node Server</th>
                  <th className="py-3.5 px-4">Wilayah &amp; Host</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Latency</th>
                  <th className="py-3.5 px-4">Throughput</th>
                  <th className="py-3.5 px-4">CPU / RAM</th>
                  <th className="py-3.5 px-4">Connection</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServers.map((server) => (
                  <tr
                    key={server.id}
                    onClick={() => setDetailModal({ isOpen: true, server })}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{server.flag}</span>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{server.id}</span>
                          {server.isActive && (
                            <span className="text-[9px] font-bold text-red-600 uppercase">Aktif</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{server.regionName}</p>
                      <p className="text-[10px] font-mono text-slate-400 truncate max-w-xs">{server.host}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          server.status === "online"
                            ? "bg-emerald-50 text-emerald-700"
                            : server.status === "standby"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            server.status === "online" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {server.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {server.latencyMs} ms
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">{server.qps.toLocaleString("id-ID")} QPS</span>
                      <span className="text-[10px] text-slate-400 block">{server.bandwidthMbps} MB/s</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700">CPU: {server.cpuPercent}%</span>
                      <span className="text-slate-400 block">RAM: {server.memoryPercent}%</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {server.activeConnections} / 100
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleQuickPing(e, server.id)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Ping
                        </button>
                        {!server.isActive && (
                          <button
                            onClick={() => handleSetActive(server.group, server.id)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white transition-colors"
                          >
                            Set Aktif
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal Component */}
      <ServerDetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ isOpen: false, server: null })}
        server={detailModal.server}
        onSetActive={handleSetActive}
      />
    </div>
  );
}
