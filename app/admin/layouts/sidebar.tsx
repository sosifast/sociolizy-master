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
  ChevronRight,
  Activity,
  Coins,
  Receipt,
  Sparkles,
  MessageSquare,
  ShoppingCart,
  Wallet,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const menuSections = [
    {
      title: "RINGKASAN",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "TRANSAKSI & PESANAN",
      items: [
        {
          name: "Riwayat Order",
          href: "/admin/history-order",
          icon: ShoppingCart,
        },
        {
          name: "Riwayat Deposit",
          href: "/admin/cryptomus/history",
          icon: Receipt,
        },
        {
          name: "Laporan & Profit",
          href: "/admin/report",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "KATALOG LAYANAN",
      items: [
        {
          name: "Platform",
          href: "/admin/platform",
          icon: Layers,
        },
        {
          name: "Kategori",
          href: "/admin/category",
          icon: FolderTree,
        },
        {
          name: "Daftar Layanan",
          href: "/admin/service",
          icon: PackageCheck,
        },
        {
          name: "Import Layanan",
          href: "/admin/import",
          icon: FileDown,
        },
      ],
    },
    {
      title: "PENGGUNA & BANTUAN",
      items: [
        {
          name: "Kelola Pengguna",
          href: "/admin/user",
          icon: Users,
        },
        {
          name: "Tiket Dukungan",
          href: "/admin/ticket",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "INTEGRASI & SISTEM",
      items: [
        {
          name: "API Provider",
          href: "/admin/provider",
          icon: Server,
        },
        {
          name: "Monitoring Server",
          href: "/admin/server",
          icon: Activity,
        },
        {
          name: "Setup Cryptomus",
          href: "/admin/cryptomus/setup",
          icon: Coins,
        },
        {
          name: "Pengaturan Sistem",
          href: "/admin/setting",
          icon: Settings,
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
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 p-[1px] shadow-sm shadow-emerald-600/30">
              <div className="w-full h-full bg-emerald-600 rounded-[11px] flex items-center justify-center text-white">
                <Sparkles className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  MASTER<span className="text-emerald-600">SMM</span>
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block -mt-1">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 bg-white">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <h3 className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
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
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 font-semibold"
                          : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                            active
                              ? "text-white"
                              : "text-slate-400 group-hover:text-emerald-600"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {active && (
                        <ChevronRight className="w-3.5 h-3.5 text-white/90" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200/80 flex items-center justify-center font-bold text-emerald-800 text-xs shadow-inner">
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
