"use client";

import React, { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/logout-button";
import AdminNotificationsDropdown from "../components/admin-notifications-dropdown";
import AdminGlobalSearch from "../components/admin-global-search";
import {
  Menu,
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

        {/* Search Input Bar (Global Search with Live Results) */}
        <AdminGlobalSearch />
      </div>

      {/* Right: Actions, Notifications, & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Realtime Dropdown */}
        <AdminNotificationsDropdown />

        {/* Profile Avatar / Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
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
