"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
}

export default function Navbar({
  navItems,
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
        <Link href="/" className="group flex items-center py-1">
          <Image
            src="/logo/logo.png"
            alt="sociolizy"
            width={180}
            height={66}
            className="h-11 sm:h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-[1.02]"
            priority
          />
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
