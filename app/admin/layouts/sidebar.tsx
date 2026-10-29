"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/logout-button";
import {
  LayoutDashboard,
  Layers,
  FolderTree,
  PackageCheck,
  Server,
  FileDown,
  Users,
  BarChart3,
  Settings,
  Zap,
  ChevronRight,
  Shield,
  Activity,
  Coins,
  Receipt,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuGroups = [
    {
      group: "UTAMA",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          badge: null,
        },
        {
          name: "Laporan & Transaksi",
          href: "/admin/report",
          icon: BarChart3,
          badge: "Baru",
        },
      ],
    },
    {
      group: "KATALOG & LAYANAN",
      items: [
        {
          name: "Platform",
          href: "/admin/platform",
          icon: Layers,
          badge: null,
        },
        {
          name: "Kategori",
          href: "/admin/category",
          icon: FolderTree,
          badge: null,
        },
        {
          name: "Daftar Layanan",
          href: "/admin/service",
          icon: PackageCheck,
          badge: null,
        },
        {
          name: "Import Layanan",
          href: "/admin/import",
          icon: FileDown,
          badge: "Otomatis",
        },
      ],
    },
    {
      group: "PAYMENT GATEWAY",
      items: [
        {
          name: "Setup Cryptomus",
          href: "/admin/cryptomus/setup",
          icon: Coins,
          badge: "Kripto",
        },
        {
          name: "Riwayat Deposit",
          href: "/admin/cryptomus/history",
          icon: Receipt,
          badge: null,
        },
      ],
    },
    {
      group: "INFRASTRUKTUR & SERVER",
      items: [
        {
          name: "Monitoring Server",
          href: "/admin/server",
          icon: Activity,
          badge: "Cluster",
        },
        {
          name: "API Provider",
          href: "/admin/provider",
          icon: Server,
          badge: null,
        },
      ],
    },
    {
      group: "PENGGUNA & SISTEM",
      items: [
        {
          name: "Kelola Pengguna",
          href: "/admin/user",
          icon: Users,
          badge: null,
        },
        {
          name: "Pengaturan Sistem",
          href: "/admin/setting",
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-[1px] shadow-md shadow-indigo-600/20">
              <div className="w-full h-full bg-indigo-600 rounded-[11px] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  MASTER<span className="text-indigo-600">SMM</span>
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block -mt-1">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 bg-white">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2">
                {group.group}
              </h3>
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 ${
                      active
                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 font-semibold"
                        : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-indigo-600"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            active
                              ? "bg-white/20 text-white"
                              : "bg-indigo-50 text-indigo-600 border border-indigo-200/60"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {active && (
                        <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200/80 flex items-center justify-center font-bold text-indigo-700 text-xs shadow-inner">
                SA
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">
                  Super Admin
                </p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>

            <LogoutButton
              title="Keluar dari Panel Admin"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer flex items-center justify-center"
              iconClassName="w-4 h-4"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
