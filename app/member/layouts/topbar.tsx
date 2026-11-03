"use client";

import React from "react";
import Link from "next/link";
import {
  Server,
  HelpCircle,
  Shield,
} from "lucide-react";

export interface MemberUserData {
  username: string;
  email: string;
  balance: number;
  server_area: string;
  level: string;
}

interface MemberTopbarProps {
  user: MemberUserData;
}

export default function MemberTopbar({ user }: MemberTopbarProps) {
  const activeRegion = user.server_area || "SG";

  return (
    <div className="bg-white border-b border-slate-200 text-xs text-slate-500 py-1.5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section: Server Cluster Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wide">Cluster Online</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 text-xs">
            <Server className="w-3 h-3 text-emerald-600" />
            <span className="text-slate-500">Node:</span>
            <span className="font-mono font-bold text-slate-800">{activeRegion}</span>
          </div>

          <span className="hidden md:inline text-slate-300">•</span>

          <span className="hidden md:inline text-slate-500 font-medium text-xs truncate">
            ⚡ Automated SMM Transactions &amp; Multi-Server Sync
          </span>
        </div>

        {/* Right Section: Support & Info Links */}
        <div className="flex items-center gap-3 text-xs shrink-0">
          <Link
            href="/page/policy"
            className="hidden sm:inline-flex items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors"
            title="Terms of Service"
          >
            <Shield className="w-3 h-3 text-slate-400" />
            <span>Terms</span>
          </Link>

          <span className="hidden sm:inline text-slate-300">•</span>

          <Link
            href="/member/ticket"
            className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-emerald-600 transition-colors"
            title="Support Tickets"
          >
            <HelpCircle className="w-3 h-3 text-emerald-600" />
            <span>Support</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
