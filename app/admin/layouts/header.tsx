"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Bell,
  Plus,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar: () => void;
}

export default function AdminHeader({ onToggleSidebar }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleSidebar}
          aria-label="Buka Menu Navigasi"
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 lg:hidden transition-colors"
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
            placeholder="Cari ID pesanan, pengguna, layanan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Server Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-medium text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>API 24/7 Normal</span>
        </div>

        {/* Quick Add Button */}
        <Link
          href="/admin/service"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-sm shadow-red-600/25 transition-all"
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
            className="relative p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-xl p-4 text-xs z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                <span className="font-bold text-slate-900 text-sm">Notifikasi Sistem</span>
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  3 Baru
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-red-50/50 transition-colors">
                  <p className="font-semibold text-slate-800">Pesanan Baru Diterima</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Order #10492 - Instagram Followers telah diproses.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">2 menit yang lalu</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-red-50/50 transition-colors">
                  <p className="font-semibold text-slate-800">Saldo Provider Menipis</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">SMM King API tersisa $15.00. Segera lakukan isi ulang saldo.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">1 jam yang lalu</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-slate-200 mx-1" />

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-red-600/30">
              AD
            </div>
            <div className="hidden sm:block text-left">
              <span className="block text-xs font-bold text-slate-800 leading-tight">
                Administrator
              </span>
              <span className="block text-[10px] font-semibold text-red-600">
                Super Admin
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 text-xs z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="font-bold text-slate-900">Administrator</p>
                <p className="text-[11px] text-slate-500 truncate">admin@mastersmm.com</p>
              </div>

              <Link
                href="/admin/setting"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Pengaturan Sistem</span>
              </Link>

              <Link
                href="/admin/user"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 hover:text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Manajemen Pengguna</span>
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <Link
                href="/api/auth/logout"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Logout)</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
