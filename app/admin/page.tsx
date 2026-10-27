"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
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
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Gagal memuat statistik:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const statCards = [
    {
      title: "Total Pengguna",
      value: stats ? stats.usersCount.toLocaleString() : "...",
      subtext: "Terdaftar di database",
      trend: stats ? `${stats.usersCount} Akun` : "",
      icon: Users,
    },
    {
      title: "Saldo Provider API",
      value: stats ? formatIDR(stats.totalProviderBalance) : "...",
      subtext: stats ? `${stats.providers.length} provider terhubung` : "Provider API",
      trend: "Tersedia",
      icon: Wallet,
    },
    {
      title: "Total Layanan",
      value: stats ? stats.servicesCount.toLocaleString() : "...",
      subtext: stats ? `Dari ${stats.categoriesCount} kategori` : "Layanan SMM",
      trend: `${stats?.servicesCount || 0} Aktif`,
      icon: PackageCheck,
    },
    {
      title: "Platform Medsos",
      value: stats ? stats.platformsCount.toLocaleString() : "...",
      subtext: "Platform aktif",
      trend: "Terintegrasi",
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-50 text-red-600 border border-red-200">
              Admin Control Center
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Database: PostgreSQL (Prisma ORM)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Selamat Datang, <span className="text-red-600">Administrator</span>!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kelola data master platform, kategori, layanan, provider API, serta pengguna secara langsung.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/service/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm shadow-red-600/30 transition-all"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Tambah Layanan</span>
          </Link>
          <Link
            href="/admin/provider"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-red-400 hover:text-red-600 transition-colors shadow-xs"
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
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                Status Saldo API Provider
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ketersediaan saldo deposit pada server penyedia dari tabel PostgreSQL.
              </p>
            </div>
            <Link
              href="/admin/provider"
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {stats && stats.providers.length > 0 ? (
              stats.providers.map((prov) => (
                <div
                  key={prov.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-red-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{prov.name}</h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-mono text-slate-400">{prov.slug}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                    <span className="text-xs text-slate-400 block">Sisa Saldo</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      {formatIDR(Number(prov.balance || 0))}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Server className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Belum ada API Provider yang terdaftar.</p>
                <Link
                  href="/admin/provider/create"
                  className="inline-block mt-3 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600"
                >
                  Tambah Provider
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Platform Categories & Quick Access */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Platform Media Sosial
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Platform dan jumlah kategori layanan
                </p>
              </div>
              <Link
                href="/admin/platform"
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <span>Kelola</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {stats && stats.platforms.length > 0 ? (
                stats.platforms.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-red-200 transition-colors"
                  >
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">{p.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {p._count.categories} Kategori
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  Belum ada platform.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-700 mb-2.5 uppercase tracking-wider">
              Aksi Cepat Admin
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/user"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-semibold border border-slate-200 hover:border-red-200 transition-all flex items-center gap-2"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Kelola User</span>
              </Link>
              <Link
                href="/admin/setting"
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-semibold border border-slate-200 hover:border-red-200 transition-all flex items-center gap-2"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Pengaturan Web</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Pengguna Terbaru dari Database */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">
              Pengguna Terdaftar Terbaru
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data akun member & admin langsung dari tabel User PostgreSQL.
            </p>
          </div>
          <Link
            href="/admin/user"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <span>Semua Pengguna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-200/70 text-slate-500 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">ID</th>
                <th className="py-3.5 px-5">Username</th>
                <th className="py-3.5 px-5">Email</th>
                <th className="py-3.5 px-5">Level</th>
                <th className="py-3.5 px-5">Saldo</th>
                <th className="py-3.5 px-5">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {stats && stats.recentUsers.length > 0 ? (
                stats.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold font-mono text-slate-900">
                      #{u.id}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      {u.username}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">{u.email}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.level === "Admin"
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-blue-50 text-blue-600 border border-blue-200"
                        }`}
                      >
                        {u.level}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      {formatIDR(Number(u.balance || 0))}
                    </td>
                    <td className="py-3.5 px-5 text-slate-400">
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
