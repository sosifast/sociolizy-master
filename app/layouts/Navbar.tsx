"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, X, LayoutDashboard } from "lucide-react";
import Menubar, { NavItem } from "./Menubar";
import { useCachedFetch } from "@/lib/client-cache";

interface UserSessionInfo {
  id: number;
  username: string;
  level: "Admin" | "Member" | string;
  email?: string;
}

interface SessionApiResponse {
  success?: boolean;
  authenticated: boolean;
  user: UserSessionInfo | null;
}

interface NavbarProps {
  navItems?: NavItem[];
  currentBadge?: string;
}

export default function Navbar({
  navItems,
  currentBadge = "#1 SMM",
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { data: sessionData, isLoading } = useCachedFetch<SessionApiResponse>(
    "/api/auth/session",
    {
      ttlMs: 30_000,
    }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const isLoggedIn = mounted && !isLoading && Boolean(sessionData?.authenticated && sessionData?.user);
  const dashboardHref = sessionData?.user?.level === "Admin" ? "/admin" : "/member";

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-slate-200/80 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 p-[1px] shadow-sm shadow-emerald-600/30">
            <div className="w-full h-full bg-emerald-600 rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              sociolizy
            </span>
            {currentBadge && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                {currentBadge}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop Menubar */}
        <div className="hidden md:flex items-center">
          <Menubar items={navItems} orientation="horizontal" />
        </div>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {!mounted || isLoading ? (
            <div className="h-9 w-28 rounded-xl bg-slate-100 animate-pulse" />
          ) : isLoggedIn ? (
            <Link
              href={dashboardHref}
              className="relative inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all shadow-xs"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="relative px-5 py-2 text-sm font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg focus:outline-none cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl">
          <Menubar
            items={navItems}
            orientation="vertical"
            onItemClick={() => setMobileMenuOpen(false)}
          />
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            {!mounted || isLoading ? (
              <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
            ) : isLoggedIn ? (
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-slate-700 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
