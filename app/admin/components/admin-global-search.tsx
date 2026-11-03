"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Loader2,
  User,
  Package,
  ShoppingCart,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface SearchResults {
  users: Array<{
    id: number;
    username: string;
    email: string;
    balance: number | string;
    level: string;
    server_area: string;
  }>;
  services: Array<{
    id: number;
    service_id: string;
    service_name: string;
    rate_sale: number | string;
    category?: { name: string } | null;
  }>;
  orders: Array<{
    invoice: string;
    order_id: string | null;
    target: string;
    amount: number;
    price_sale: number;
    status: string;
    server_area?: string;
  }>;
  tickets: Array<{
    ticket_id: string;
    username: string;
    subject: string;
    status: string;
    priority: string;
    category: string;
  }>;
}

export default function AdminGlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    users: [],
    services: [],
    orders: [],
    tickets: [],
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ users: [], services: [], orders: [], tickets: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/global-search?q=${encodeURIComponent(trimmed)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setResults(json.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      const q = query.trim();
      if (q.toUpperCase().startsWith("INV-")) {
        router.push(`/admin/history-order?search=${encodeURIComponent(q)}`);
      } else if (q.toUpperCase().startsWith("TKT-")) {
        router.push(`/admin/ticket?search=${encodeURIComponent(q)}`);
      } else {
        router.push(`/admin/history-order?search=${encodeURIComponent(q)}`);
      }
    }
  };

  const hasAnyResults =
    results.users.length > 0 ||
    results.services.length > 0 ||
    results.orders.length > 0 ||
    results.tickets.length > 0;

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "completed" || s === "resolved") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "processing" || s === "in progress") {
      return "bg-sky-50 text-sky-700 border-sky-200";
    }
    if (s === "canceled" || s === "closed") {
      return "bg-slate-100 text-slate-600 border-slate-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="relative w-full max-w-md hidden sm:block" ref={containerRef}>
      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen && e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Cari pesanan, pengguna, layanan, tiket..."
          className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 focus:outline-none transition-all shadow-2xs"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Floating Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-3 z-50 animate-in fade-in duration-150 max-h-[480px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          {!hasAnyResults && !isLoading ? (
            <div className="py-8 text-center text-slate-400 space-y-1">
              <Search className="w-6 h-6 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">Tidak ada hasil ditemukan</p>
              <p className="text-[11px] text-slate-400">
                Tidak ada pesanan, user, layanan, atau tiket yang cocok dengan &quot;{query}&quot;.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 1. Pengguna */}
              {results.users.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-emerald-600" />
                      Pengguna ({results.users.length})
                    </span>
                    <Link
                      href={`/admin/user?search=${encodeURIComponent(query)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-emerald-600 hover:underline"
                    >
                      Lihat Semua
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {results.users.map((u) => (
                      <Link
                        key={u.id}
                        href={`/admin/user?search=${encodeURIComponent(u.username)}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/50 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600">
                              @{u.username}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono font-bold text-emerald-600 text-xs block">
                            ${Number(u.balance || 0).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Node: {u.server_area}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Layanan */}
              {results.services.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-violet-600" />
                      Layanan ({results.services.length})
                    </span>
                    <Link
                      href={`/admin/service?search=${encodeURIComponent(query)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-emerald-600 hover:underline"
                    >
                      Lihat Semua
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {results.services.map((s) => (
                      <Link
                        key={s.id}
                        href={`/admin/service?search=${encodeURIComponent(s.service_id)}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/50 transition-colors group"
                      >
                        <div className="overflow-hidden pr-2">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-600">
                            {s.service_name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-mono text-emerald-600 font-semibold">
                              #{s.service_id}
                            </span>
                            {s.category?.name && <span>• {s.category.name}</span>}
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-700 text-xs shrink-0">
                          ${Number(s.rate_sale || 0).toFixed(4)}/1k
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Pesanan */}
              {results.orders.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <ShoppingCart className="w-3 h-3 text-sky-600" />
                      Pesanan ({results.orders.length})
                    </span>
                    <Link
                      href={`/admin/history-order?search=${encodeURIComponent(query)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-emerald-600 hover:underline"
                    >
                      Lihat Semua
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {results.orders.map((o) => (
                      <Link
                        key={o.invoice}
                        href={`/admin/history-order?search=${encodeURIComponent(o.invoice)}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/50 transition-colors group"
                      >
                        <div className="overflow-hidden pr-2">
                          <p className="text-xs font-mono font-bold text-emerald-600 truncate">
                            {o.invoice}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            Target: {o.target} ({o.amount.toLocaleString()} Qty)
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize block mb-0.5 ${getStatusBadge(
                              o.status
                            )}`}
                          >
                            {o.status}
                          </span>
                          <span className="font-mono font-bold text-slate-700 text-[11px]">
                            ${Number(o.price_sale || 0).toFixed(2)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Tiket Bantuan */}
              {results.tickets.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 text-amber-600" />
                      Tiket Bantuan ({results.tickets.length})
                    </span>
                    <Link
                      href={`/admin/ticket?search=${encodeURIComponent(query)}`}
                      onClick={() => setIsOpen(false)}
                      className="text-emerald-600 hover:underline"
                    >
                      Lihat Semua
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {results.tickets.map((t) => (
                      <Link
                        key={t.ticket_id}
                        href={`/admin/ticket/${t.ticket_id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/50 transition-colors group"
                      >
                        <div className="overflow-hidden pr-2">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 font-bold">
                            <span>{t.ticket_id}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 font-sans">@{t.username}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-emerald-600">
                            {t.subject}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border capitalize shrink-0 ${getStatusBadge(
                            t.status
                          )}`}
                        >
                          {t.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

