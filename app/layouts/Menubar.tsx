"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
}

export const defaultNavItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "API Docs", href: "/documentasi" },
];

interface MenubarProps {
  items?: NavItem[];
  orientation?: "horizontal" | "vertical";
  onItemClick?: () => void;
  className?: string;
}

export default function Menubar({
  items = defaultNavItems,
  orientation = "horizontal",
  onItemClick,
  className = "",
}: MenubarProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href === "/services") return pathname === "/services" || pathname.startsWith("/page/service");
    if (href === "/documentasi") return pathname === "/documentasi" || pathname.startsWith("/page/doc");
    return pathname === href;
  };

  if (orientation === "vertical") {
    return (
      <nav className={`flex flex-col space-y-2 ${className}`}>
        {items.map((item, idx) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={idx}
              href={item.href}
              onClick={onItemClick}
              className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                active
                  ? "text-emerald-700 bg-emerald-50 font-semibold"
                  : "text-slate-700 hover:text-emerald-600 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className={`flex items-center gap-7 text-sm font-medium ${className}`}>
      {items.map((item, idx) => {
        const active = isItemActive(item.href);
        return (
          <Link
            key={idx}
            href={item.href}
            onClick={onItemClick}
            className={`transition-colors relative py-1.5 ${
              active
                ? "text-emerald-600 font-bold"
                : "text-slate-600 hover:text-emerald-600"
            }`}
          >
            {item.label}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
