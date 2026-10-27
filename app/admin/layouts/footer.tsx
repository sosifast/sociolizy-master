import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="bg-white border-t border-slate-200/90 py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-center sm:text-left">
        <span>© 2026</span>
        <span className="font-bold text-slate-800">
          Master<span className="text-red-600">SMM</span>
        </span>
        <span>• Seluruh hak cipta dilindungi.</span>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-600 font-medium">PostgreSQL Connected</span>
        </div>
        <span>•</span>
        <span>v1.0.0 PRO</span>
        <span>•</span>
        <Link
          href="/admin/setting"
          className="hover:text-red-600 transition-colors"
        >
          Bantuan & Dokumentasi
        </Link>
      </div>
    </footer>
  );
}
