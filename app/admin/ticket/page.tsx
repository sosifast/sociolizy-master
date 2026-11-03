"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  User,
  Shield,
  FolderOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { useToast } from "@/app/admin/components/toast-context";

interface AdminTicketItem {
  ticket_id: string;
  user_uuid: string;
  username: string;
  email: string;
  server_area: string;
  subject: string;
  category: "general" | "billing" | "technical" | "order";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  messages: Array<{ id: string; sender: string; content: string; created_at: string }>;
  created_at: string;
  updated_at: string;
}

export default function AdminTicketListPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<AdminTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const res = await fetch(`/api/admin/ticket?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Failed to load admin tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, priorityFilter, searchTerm]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Real-time Pusher listening
  useEffect(() => {
    try {
      const pusher = getPusherClient();
      const channel = pusher.subscribe("admin-tickets");

      channel.bind("new-ticket", (data: any) => {
        toast.info("Tiket Baru Masuk", `Tiket ${data.ticket_id} dibuat oleh @${data.username}: "${data.subject}"`);
        fetchTickets();
      });

      channel.bind("ticket-updated", (data: any) => {
        fetchTickets();
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe("admin-tickets");
      };
    } catch (err) {
      console.warn("Pusher admin subscribe error:", err);
    }
  }, [fetchTickets, toast]);

  const counts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  const getStatusBadge = (status: AdminTicketItem["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <RefreshCw className="w-3 h-3 text-sky-600 animate-spin" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Closed
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: AdminTicketItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] uppercase">
            Urgent
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-[10px] uppercase">
            High
          </span>
        );
      case "normal":
        return (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px] capitalize">
            Normal
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-400 font-medium text-[10px] capitalize">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Kelola Tiket Bantuan</h1>
          </div>
          <p className="text-xs text-slate-500">
            Pusat manajemen bantuan member. Tersimpan di klaster database MongoDB dan diperbarui realtime via Pusher.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Semua Tiket
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{counts.total}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Menunggu Respon (Open)
          </span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{counts.open}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-sky-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider block">
            Diproses (In Progress)
          </span>
          <span className="text-2xl font-black text-sky-600 mt-1 block">{counts.in_progress}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Selesai (Resolved)
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{counts.resolved}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari ID tiket, username, subject, email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="all">Semua Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="all">Semua Kategori</option>
            <option value="general">General</option>
            <option value="order">Order</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="all">Semua Prioritas</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Ticket Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
            <p className="text-xs">Memuat daftar tiket dari klaster MongoDB...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada tiket ditemukan</p>
            <p className="text-xs text-slate-400">Tidak ada tiket bantuan yang sesuai dengan filter saat ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">ID Tiket</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Subject &amp; Pesan Terakhir</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Prioritas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Node Server</th>
                  <th className="py-3 px-4">Update Terakhir</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {t.ticket_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">@{t.username}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{t.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 truncate max-w-xs">{t.subject}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {t.messages && t.messages.length > 0
                          ? t.messages[t.messages.length - 1].content
                          : "Tidak ada pesan"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-600">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-[11px] font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getPriorityBadge(t.priority)}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(t.status)}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">
                        {t.server_area}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(t.updated_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/ticket/${t.ticket_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                      >
                        <span>Kelola</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
