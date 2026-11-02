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
    <div className="bg-[#050811] border-b border-slate-800/80 text-xs text-slate-400 px-4 sm:px-6 py-1.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Section: Server Cluster Status */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-[11px]">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">Cluster Online</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Server className="w-3 h-3 text-indigo-400" />
            <span>Node:</span>
            <span className="font-mono font-bold text-slate-200">{activeRegion}</span>
          </div>

          <span className="hidden md:inline text-slate-700">•</span>

          <span className="hidden md:inline text-slate-400 font-medium truncate max-w-sm">
            ⚡ Automated SMM Transactions &amp; Multi-Server Real-time Sync
          </span>
        </div>

        {/* Right Section: Support & Info Links */}
        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <Link
            href="/page/policy"
            className="hidden sm:inline-flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
            title="Terms of Service"
          >
            <Shield className="w-3 h-3" />
            <span>Terms of Service</span>
          </Link>

          <span className="hidden sm:inline text-slate-700">•</span>

          <Link
            href="/member/ticket"
            className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
            title="Support Tickets"
          >
            <HelpCircle className="w-3 h-3" />
            <span>Support Tickets</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
