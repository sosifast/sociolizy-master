"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Store,
  Globe,
  Receipt,
  ArrowDownToLine,
  Code2,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import LogoutButton from "@/app/components/logout-button";

interface MerchantNavbarProps {
  user: {
    id: number;
    username: string;
    email: string;
    level: string;
  };
  siteName: string;
  logo: string;
}

export default function MerchantNavbar({ user, siteName, logo }: MerchantNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/merchant", icon: LayoutDashboard, exact: true },
    { name: "Merchants", href: "/merchant/accounts", icon: Store, exact: false },
    { name: "Websites & API", href: "/merchant/websites", icon: Globe, exact: false },
    { name: "Transactions", href: "/merchant/transactions", icon: Receipt, exact: false },
    { name: "Withdrawals", href: "/merchant/withdraw", icon: ArrowDownToLine, exact: false },
    { name: "API Docs", href: "/merchant/docs", icon: Code2, exact: false },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-200/90 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo & Gateway Badge */}
          <div className="flex items-center gap-7">
            <Link href="/merchant" className="flex items-center gap-3 group py-1">
              <Image
                src={logo || "/logo/logo.png"}
                alt={siteName || "Logo"}
                width={140}
                height={48}
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                priority
              />
              <span className="spectrum-badge-green font-mono">
                GATEWAY
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const active = isActive(link.href, link.exact);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      active
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User profile & Logout */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">@{user.username}</div>
              <div className="text-[11px] text-emerald-600 font-semibold">Merchant Account</div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <LogoutButton />
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5 shadow-lg animate__animated animate__fadeIn">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-slate-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800">@{user.username}</div>
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  );
}
