"use client";

import React, { useState } from "react";
import {
  Server,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Radio,
  Zap,
  RefreshCw,
  X,
  Database,
  ArrowUpRight,
  Gauge,
  Users,
} from "lucide-react";
import { useToast } from "@/app/admin/components/toast-context";

export interface ServerData {
  id: string;
  group: string;
  serverIndex: number;
  regionName: string;
  flag: string;
  uri: string | null;
  maskedUri: string;
  host: string;
  isConfigured: boolean;
  isActive: boolean;
  assignedUsers?: number;
  clusterMode?: string;
  status: "online" | "standby" | "maintenance";
  latencyMs: number;
  qps: number;
  bandwidthMbps: number;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  activeConnections: number;
  maxConnections: number;
  iops: number;
  uptime: string;
  uptimeDays: number;
  replicaRole: string;
  replicationLagMs: number;
  database: {
    engine: string;
    replicaRole: string;
    replicationLagMs: number;
    wireProtocol: string;
    readPreference: string;
  };
}

interface ServerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  server: ServerData | null;
}

export default function ServerDetailModal({
  isOpen,
  onClose,
  server,
}: ServerDetailModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [liveLatency, setLiveLatency] = useState<number | null>(null);
  const [pingResult, setPingResult] = useState<{
    isRealPing?: boolean;
    resolvedShard?: string | null;
    pingType?: string;
  } | null>(null);

  if (!isOpen || !server) return null;

  const currentLatency = liveLatency !== null ? liveLatency : server.latencyMs;

  const handleCopyUri = () => {
    if (server.uri) {
      navigator.clipboard.writeText(server.uri);
      setCopied(true);
      toast.success("Tersalin", `Koneksi URI untuk server ${server.id} telah disalin.`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePingTest = async () => {
    setIsPinging(true);
    try {
      const res = await fetch("/api/admin/server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ping", serverId: server.id }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setLiveLatency(json.data.latencyMs);
        setPingResult({
          isRealPing: json.data.isRealPing,
          resolvedShard: json.data.resolvedShard,
          pingType: json.data.pingType,
        });
        if (json.data.isRealPing) {
          toast.success("Live Ping Sukses", `Koneksi TCP asli ke ${json.data.resolvedShard}: ${json.data.latencyMs} ms`);
        } else {
          toast.success("Ping Selesai", `${server.id} merespon dalam ${json.data.latencyMs} ms`);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal Melakukan Ping", "Koneksi ke node server timeout.");
    } finally {
      setIsPinging(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center text-2xl shadow-md">
              <span>{server.flag}</span>
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Server Node: {server.id}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  NODE AKTIF (MULTI-ACTIVE PARALEL)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Users className="w-3.5 h-3.5" />
                  {server.assignedUsers ?? 0} Pengguna Tersegmentasi
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
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
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Wilayah Cluster: <strong className="text-slate-800">{server.regionName}</strong> &bull; Host: <code className="text-slate-700 font-mono text-xs">{server.host}</code>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Realtime KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Latency (RTT)</span>
              <Activity className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1">
              <span>{currentLatency}</span>
              <span className="text-xs font-bold text-slate-500">ms</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">
              {currentLatency < 50 ? "Sangat Cepat" : currentLatency < 120 ? "Normal" : "Jarak Jauh"}
            </span>
            {pingResult?.isRealPing && (
              <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded mt-1.5 block truncate" title={pingResult.resolvedShard || ""}>
                Live Shard: {pingResult.resolvedShard}
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Query Throughput</span>
              <Zap className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1">
              <span>{server.qps.toLocaleString("id-ID")}</span>
              <span className="text-xs font-bold text-slate-500">QPS</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-1 block">
              Trafik Permintaan / Detik
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Bandwidth I/O</span>
              <Network className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1">
              <span>{server.bandwidthMbps}</span>
              <span className="text-xs font-bold text-slate-500">MB/s</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-1 block">
              In/Out Data Stream
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>SLA Uptime</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">
              {server.uptime}
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-1 block">
              Aktif {server.uptimeDays} Hari Berturut-turut
            </span>
          </div>
        </div>

        {/* Resource Allocation Bars */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-red-600" />
            <span>Alokasi & Utilisasi Hardware Server</span>
          </h3>

          <div className="grid sm:grid-cols-3 gap-5">
            {/* CPU */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">CPU Compute Load</span>
                <span className={server.cpuPercent > 75 ? "text-amber-600" : "text-emerald-600"}>
                  {server.cpuPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    server.cpuPercent > 75 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${server.cpuPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">4 vCPU Cores &bull; Peak 2.8 GHz</p>
            </div>

            {/* RAM */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">Memory (RAM)</span>
                <span className={server.memoryPercent > 80 ? "text-amber-600" : "text-indigo-600"}>
                  {server.memoryPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    server.memoryPercent > 80 ? "bg-amber-500" : "bg-indigo-600"
                  }`}
                  style={{ width: `${server.memoryPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {((server.memoryPercent * 16) / 100).toFixed(1)} GB / 16 GB Terpakai
              </p>
            </div>

            {/* Storage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-700">NVMe SSD Storage</span>
                <span className="text-cyan-600">{server.diskPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-cyan-500 transition-all duration-500"
                  style={{ width: `${server.diskPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {((server.diskPercent * 250) / 100).toFixed(0)} GB / 250 GB Digunakan
              </p>
            </div>
          </div>
        </div>

        {/* Database Engine & Protocol Specs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Spesifikasi Database Engine</span>
            </h4>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Engine Type:</span>
                <span className="font-semibold text-slate-800">{server.database.engine}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Cluster Role:</span>
                <span className="font-bold text-indigo-600">{server.database.replicaRole}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Replication Lag:</span>
                <span className="font-mono text-emerald-600 font-bold">{server.database.replicationLagMs} ms</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Read Preference:</span>
                <span className="font-mono text-slate-800">{server.database.readPreference}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Protokol & Keamanan Koneksi</span>
            </h4>
            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Wire Encryption:</span>
                <span className="font-semibold text-slate-800">{server.database.wireProtocol}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Active Connection Pool:</span>
                <span className="font-bold text-slate-800">{server.activeConnections} / {server.maxConnections}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-400">Disk I/O Speed:</span>
                <span className="font-mono text-slate-800">{server.iops} IOPS</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">SSL Certificate:</span>
                <span className="text-emerald-600 font-bold">Valid &bull; TLS 1.3 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection String Preview */}
        <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-red-400" />
              <span>Connection URI (Masked)</span>
            </span>
            <button
              onClick={handleCopyUri}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin URI</span>
                </>
              )}
            </button>
          </div>
          <div className="p-2.5 rounded-xl bg-black/40 font-mono text-xs text-slate-300 break-all select-all">
            {server.maskedUri}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={handlePingTest}
            disabled={isPinging}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin" : ""}`} />
            <span>{isPinging ? "Menguji Latensi..." : "Uji Ping Realtime"}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Node Aktif dalam Auto-Rolling Pool</span>
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
