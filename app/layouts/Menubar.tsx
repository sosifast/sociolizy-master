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
    return pathname === href;
  };

  if (orientation === "vertical") {
    return (
      <nav className={`flex flex-col space-y-3 ${className}`}>
        {items.map((item, idx) => {
          const active = isItemActive(item.href);
          return (
            <Link
              key={idx}
              href={item.href}
              onClick={onItemClick}
              className={`text-sm font-medium py-1.5 px-2 rounded-lg transition-colors ${
                active
                  ? "text-white bg-slate-800/60 font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/40"
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
            className={`transition-colors relative py-1 ${
              active
                ? "text-white font-semibold"
                : "text-slate-300 hover:text-white"
            }`}
          >
            {item.label}
            {active && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
