"use client";

import React, { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/logout-button";
import {
  Menu,
  Search,
  Bell,
  Plus,
  ShieldCheck,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleSidebar}
          aria-label="Buka Menu Navigasi"
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Input Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Cari pesanan, pengguna, layanan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Server Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Cluster Online</span>
        </div>

        {/* Quick Add Button */}
        <Link
          href="/admin/service/create"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-xs shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Layanan</span>
        </Link>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 text-xs z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900 text-sm">Notifikasi Sistem</span>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Baru
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 transition-colors">
                  <p className="font-semibold text-slate-800">Cluster Rolling Aktif</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sistem segmentasi transaksi per user aktif dan terhubung.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Baru saja</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar / Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              AD
            </div>
            <span className="text-xs font-bold text-slate-800 hidden sm:inline-block">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 text-xs z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-900">Administrator</p>
                <p className="text-[11px] text-slate-500">Super Admin Access</p>
              </div>

              <Link
                href="/admin/setting"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors font-medium"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Pengaturan Sistem</span>
              </Link>

              <div className="pt-1 border-t border-slate-100 mt-1">
                <LogoutButton
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors font-medium cursor-pointer"
                  showIcon={true}
                >
                  <span>Keluar Akun</span>
                </LogoutButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
