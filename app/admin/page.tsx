"use client";

import React from "react";
import Link from "next/link";
import { useCachedFetch } from "@/lib/client-cache";
import {
  Users,
  Wallet,
  PackageCheck,
  TrendingUp,
  Server,
  Layers,
  ArrowRight,
  FileDown,
  ChevronRight,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface StatsData {
  usersCount: number;
  servicesCount: number;
  platformsCount: number;
  categoriesCount: number;
  totalProviderBalance: number;
  providers: Array<{
    id: number;
    name: string;
    slug: string;
    balance: number | string;
  }>;
  platforms: Array<{
    id: number;
    name: string;
    slug: string;
    _count: { categories: number };
  }>;
  recentUsers: Array<{
    id: number;
    username: string;
    email: string;
    level: string;
    balance: number | string;
    create_at: string;
  }>;
}

export default function AdminDashboardPage() {
  const {
    data: stats,
    isLoading,
    isRefreshing,
    refresh: fetchStats,
  } = useCachedFetch<StatsData>("/api/admin/stats", { ttlMs: 30_000 });

  const formatUSD = (val: number) => {
    return `$${Number(val || 0).toFixed(2)}`;
  };

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats ? stats.usersCount.toLocaleString() : "...",
      subtext: "Pengguna terdaftar",
      trend: stats ? `${stats.usersCount} Akun` : "",
      icon: Users,
    },
    {
      title: "Saldo Provider API",
      value: stats ? formatUSD(stats.totalProviderBalance) : "...",
      subtext: stats ? `${stats.providers.length} provider` : "Provider API",
      trend: "Total",
      icon: Wallet,
    },
    {
      title: "Total Layanan",
      value: stats ? stats.servicesCount.toLocaleString() : "...",
      subtext: stats ? `${stats.categoriesCount} kategori` : "Layanan SMM",
      trend: "Aktif",
      icon: PackageCheck,
    },
    {
      title: "Platform Medsos",
      value: stats ? stats.platformsCount.toLocaleString() : "...",
      subtext: "Platform aktif",
      trend: "Aktif",
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan data platform, layanan, provider API, dan pengguna.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchStats()}
            disabled={isLoading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/service/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Tambah Layanan</span>
          </Link>
          <Link
            href="/admin/provider"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-red-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            <Server className="w-4 h-4 text-slate-500" />
            <span>Kelola Provider</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-red-300 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 truncate">{card.subtext}</span>
                <span className="font-semibold text-red-600 flex-shrink-0 ml-1">
                  {card.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Row: Provider Status + Platform Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Providers Status */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Saldo API Provider
              </h3>
            </div>
            <Link
              href="/admin/provider"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {stats && stats.providers.length > 0 ? (
              stats.providers.map((prov) => (
                <div
                  key={prov.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-red-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{prov.name}</h4>
                      <span className="font-mono text-slate-400 text-[11px]">{prov.slug}</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-400 block">Saldo</span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {formatUSD(Number(prov.balance || 0))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500">Belum ada API Provider.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Platform Categories & Quick Access */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Platform
                </h3>
              </div>
              <Link
                href="/admin/platform"
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <span>Kelola</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {stats && stats.platforms.length > 0 ? (
                stats.platforms.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                  >
                    <p className="font-bold text-slate-800 text-xs">{p.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {p._count.categories} Kategori
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada platform.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/user"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Pengguna</span>
              </Link>
              <Link
                href="/admin/setting"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-semibold border border-slate-200 transition-all flex items-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Pengaturan</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Pengguna Terbaru */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Pengguna Terbaru
            </h3>
          </div>
          <Link
            href="/admin/user"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <span>Semua Pengguna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Saldo</th>
                <th className="py-3 px-4">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold font-mono text-slate-900">
                      #{u.id}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {u.username}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.level === "Admin"
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}
                      >
                        {u.level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatUSD(Number(u.balance || 0))}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(u.create_at).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
