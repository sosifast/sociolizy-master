"use client";

import React, { useState } from "react";
import { ShieldAlert, X } from "lucide-react";

interface TopbarProps {
  dismissible?: boolean;
}

export default function Topbar({ dismissible = false }: TopbarProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <aside
      aria-label="Security Announcement"
      className="relative z-50 w-full bg-emerald-50 border-b border-emerald-200/80 py-2 px-4 text-center text-xs text-emerald-900 flex items-center justify-center gap-2 backdrop-blur-sm"
    >
      <ShieldAlert className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      <span className="leading-snug">
        <strong className="text-emerald-950 font-bold">Security Notice:</strong> Membership is 100% Free! Do not contact people who want to sell you money for membership.
      </span>
      {dismissible && (
        <button
          onClick={() => setVisible(false)}
          className="ml-2 p-1 text-emerald-700 hover:text-emerald-950 rounded-md transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </aside>
  );
}
