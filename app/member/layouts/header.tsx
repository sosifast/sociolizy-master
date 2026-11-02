"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
    <header className="sticky top-0 z-40 bg-[#0c1222]/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/member" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-[1px] shadow-md shadow-indigo-600/30">
                <div className="w-full h-full bg-[#0a0f1d] rounded-[11px] flex items-center justify-center text-white group-hover:bg-indigo-600 transition-colors">
                  <Zap className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                  MASTER<span className="text-indigo-400">SMM</span>
                </span>
                <span className="text-[10px] font-semibold text-indigo-400/90 tracking-wide uppercase block">
                  Member Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 ml-2">
              {navLinks.map((item) => {
                const active = isLinkActive(item.href, item.exact);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/20"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
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
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isHistoryActive || historyDropdownOpen
                      ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
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
                  <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-[#0c1222] border border-slate-800 p-2 shadow-2xl text-xs z-50 animate-in fade-in duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Reports &amp; Logs
                    </div>
                    {historyLinks.map((sub) => {
                      const SubIcon = sub.icon;
                      const active = pathname.startsWith(sub.href);
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors ${
                            active
                              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                              : "hover:bg-slate-800/70 text-slate-200"
                          }`}
                        >
                          <SubIcon className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-bold">{sub.name}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{sub.desc}</p>
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
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
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
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs hover:border-emerald-500/50 hover:bg-emerald-950/60 transition-all shadow-xs"
              title="Click to deposit balance"
            >
              <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-none">Balance</span>
                <span data-member-balance className="font-mono font-bold text-emerald-400 leading-tight">
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
                className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors cursor-pointer"
                aria-label="User Menu"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xs">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight truncate max-w-[100px]">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-slate-400 block -mt-0.5">
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
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0c1222] border border-slate-800 p-3 shadow-2xl text-xs z-50 animate-in fade-in duration-150">
                  {/* User Profile Card */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 mb-2">
                    <p className="font-bold text-white text-sm truncate">{user.username}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email || "-"}</p>
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Node:</span>
                      <span className="font-mono font-bold text-indigo-400">{user.server_area}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      href="/member/order"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                    >
                      <ShoppingCart className="w-4 h-4 text-indigo-400" />
                      <span>New Order</span>
                    </Link>

                    <Link
                      href="/member/payment"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span>Deposit Funds</span>
                    </Link>

                    <Link
                      href="/member/history/order"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors"
                    >
                      <History className="w-4 h-4 text-indigo-400" />
                      <span>Order History</span>
                    </Link>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800">
                    <LogoutButton
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors text-xs font-semibold cursor-pointer"
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
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 lg:hidden transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0c1222] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {/* User Quick Info */}
          <div className="p-3 rounded-2xl bg-[#070b14] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-xs">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-xs">{user.username}</p>
                <span className="text-[10px] text-slate-400">Node: {user.server_area}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Balance</span>
              <span data-member-balance className="font-mono font-bold text-emerald-400 text-xs">
                ${Number(user.balance || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navLinks.map((item) => {
              const active = isLinkActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                    active
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <div className="pt-2">
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                History &amp; Logs
              </span>
              {historyLinks.map((sub) => {
                const SubIcon = sub.icon;
                const active = pathname.startsWith(sub.href);
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                      active
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <SubIcon className="w-4 h-4 shrink-0 text-indigo-400" />
                    <span>{sub.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2">
              <Link
                href="/page/service"
                className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Layers className="w-4 h-4 shrink-0 text-indigo-400" />
                <span>Public Services Catalog</span>
              </Link>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-3 border-t border-slate-800">
            <LogoutButton
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-rose-300 hover:bg-rose-900/40 text-xs font-bold transition-colors cursor-pointer"
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
