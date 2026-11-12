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
    <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Brand: Matched with system logo */}
          <div className="flex items-center gap-6">
            <Link href="/merchant" className="flex items-center gap-3 group">
              <Image
                src={logo || "/logo/logo.png"}
                alt={siteName || "Logo"}
                width={130}
                height={40}
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                priority
              />
              <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                GATEWAY
              </span>
            </Link>

            {/* Desktop Navigation Links (English) */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href, link.exact);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      active
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action: User profile and Logout (No back button) */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs font-bold text-white">@{user.username}</div>
              <div className="text-[10px] text-emerald-400 font-mono">Merchant Account</div>
            </div>

            <LogoutButton />
          </div>

          {/* Mobile hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium ${
                  active
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-300">@{user.username}</div>
            <LogoutButton />
          </div>
        </div>
      )}
    </nav>
  );
}
