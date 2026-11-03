"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "@/app/components/logout-button";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  History,
  Receipt,
  Layers,
  ChevronDown,
  User,
  Zap,
  Menu,
  X,
  CreditCard,
  MessageSquare,
  Code2,
} from "lucide-react";
import { MemberUserData } from "./topbar";
import MemberNotificationsDropdown from "../components/member-notifications-dropdown";

interface MemberHeaderProps {
  user: MemberUserData;
}

export default function MemberHeader({ user }: MemberHeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [historyDropdownOpen, setHistoryDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const historyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setHistoryDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setHistoryDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      name: "Dashboard",
      href: "/member",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "New Order",
      href: "/member/order",
      icon: ShoppingCart,
      exact: false,
    },
    {
      name: "Deposit",
      href: "/member/payment",
      icon: Wallet,
      exact: false,
    },
    {
      name: "Tickets",
      href: "/member/ticket",
      icon: MessageSquare,
      exact: false,
    },
  ];

  const historyLinks = [
    {
      name: "Order History",
      href: "/member/history/order",
      icon: History,
      desc: "Track all your SMM orders & progress",
    },
    {
      name: "Deposit History",
      href: "/member/history/deposit",
      icon: Receipt,
      desc: "Invoices & balance top-up logs",
    },
  ];

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const isHistoryActive = pathname.startsWith("/member/history");

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/member" className="flex items-center gap-2.5 group">
              <Image
                src="/logo/logo.png"
                alt="sociolizy"
                width={140}
                height={52}
                className="h-9 sm:h-10 w-auto object-contain"
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-2">
              {navLinks.map((item) => {
                const active = isLinkActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs"
                        : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* History Dropdown */}
              <div className="relative" ref={historyRef}>
                <button
                  type="button"
                  onClick={() => setHistoryDropdownOpen(!historyDropdownOpen)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isHistoryActive || historyDropdownOpen
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs"
                      : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50"
                  }`}
                >
                  <History className="w-4 h-4 shrink-0" />
                  <span>History</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      historyDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {historyDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 p-2 shadow-xl text-xs z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Reports &amp; Logs
                    </div>
                    {historyLinks.map((sub) => {
                      const SubIcon = sub.icon;
                      const active = pathname.startsWith(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-start gap-2.5 p-2 rounded-xl transition-colors ${
                            active
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <SubIcon className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold text-xs">{sub.name}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{sub.desc}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Public Services Catalog */}
              <Link
                href="/page/service"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors"
                title="Browse Public Services"
              >
                <Layers className="w-4 h-4" />
                <span>Services</span>
              </Link>
            </nav>
          </div>

          {/* Right Section: Balance Badge & Profile */}
          <div className="flex items-center gap-3">
            {/* Single Balance Badge */}
            <Link
              href="/member/payment"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs hover:bg-emerald-100 transition-all shadow-xs"
              title="Click to deposit balance"
            >
              <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-500 block leading-none">Balance</span>
                <span data-member-balance className="font-mono font-bold text-emerald-700 text-sm leading-tight">
                  ${Number(user.balance || 0).toFixed(2)}
                </span>
              </div>
            </Link>

            {/* Realtime Notification Bell Dropdown */}
            <MemberNotificationsDropdown />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="User Menu"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xs">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[110px]">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {user.level || "Member"}
                  </span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${
                    profileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 p-2.5 shadow-xl text-xs z-50 animate-in fade-in duration-150">
                  {/* User Profile Card */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-2">
                    <p className="font-bold text-slate-900 text-xs truncate">{user.username}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email || "-"}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Node:</span>
                      <span className="font-mono font-bold text-emerald-700">{user.server_area}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <Link
                      href="/member/order"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors text-xs font-medium"
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-600" />
                      <span>New Order</span>
                    </Link>

                    <Link
                      href="/member/payment"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors text-xs font-medium"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Deposit Funds</span>
                    </Link>

                    <Link
                      href="/member/history/order"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors text-xs font-medium"
                    >
                      <History className="w-4 h-4 text-emerald-600" />
                      <span>Order History</span>
                    </Link>

                    <Link
                      href="/documentasi"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors text-xs font-medium"
                    >
                      <Code2 className="w-4 h-4 text-emerald-600" />
                      <span>API Documentation</span>
                    </Link>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200">
                    <LogoutButton
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-xs font-semibold cursor-pointer"
                      iconClassName="w-4 h-4"
                    >
                      <span>Sign Out</span>
                    </LogoutButton>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {/* User Quick Info */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold text-emerald-700 text-xs">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">{user.username}</p>
                <span className="text-[10px] text-slate-500">Node: {user.server_area}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Balance</span>
              <span data-member-balance className="font-mono font-bold text-emerald-700 text-xs">
                ${Number(user.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2">
              <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                History &amp; Logs
              </span>
              {historyLinks.map((sub) => {
                const SubIcon = sub.icon;
                const active = pathname.startsWith(sub.href);
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <SubIcon className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>{sub.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2">
              <Link
                href="/page/service"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <Layers className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Public Services Catalog</span>
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-3 border-t border-slate-200">
            <LogoutButton
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 text-sm font-bold transition-colors cursor-pointer"
              iconClassName="w-4 h-4"
            >
              <span>Sign Out</span>
            </LogoutButton>
          </div>
        </div>
      )}
    </header>
  );
}
