"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

interface TicketItem {
  ticket_id: string;
  subject: string;
  category: "general" | "billing" | "technical" | "order";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  user_uuid: string;
  messages: Array<{ id: string; sender: string; content: string; created_at: string }>;
  created_at: string;
  updated_at: string;
}

export default function MemberTicketListPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userUuid, setUserUuid] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch("/api/member/ticket");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (data.tickets && data.tickets.length > 0 && !userUuid) {
          setUserUuid(data.tickets[0].user_uuid);
        }
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [userUuid]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Realtime Pusher subscription
  useEffect(() => {
    if (!userUuid) return;
    try {
      const pusher = getPusherClient();
      const channel = pusher.subscribe(`member-${userUuid}`);

      channel.bind("ticket-updated", () => {
        fetchTickets();
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`member-${userUuid}`);
      };
    } catch (err) {
      console.warn("Pusher subscription error:", err);
    }
  }, [userUuid, fetchTickets]);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const getStatusBadge = (status: TicketItem["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <RefreshCw className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Closed
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: TicketItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return <span className="text-[11px] font-bold text-rose-400 uppercase">Urgent</span>;
      case "high":
        return <span className="text-[11px] font-semibold text-orange-400 uppercase">High</span>;
      case "normal":
        return <span className="text-[11px] font-medium text-slate-300 capitalize">Normal</span>;
      case "low":
        return <span className="text-[11px] font-medium text-slate-500 capitalize">Low</span>;
    }
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-[#0c1222] border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Support Tickets
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Need help with an order, balance deposit, or technical inquiry? Open a ticket to receive direct real-time assistance from our support staff.
          </p>
        </div>

        <div className="relative z-10">
          <Link
            href="/member/ticket/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Ticket</span>
          </Link>
        </div>
      </div>

      {/* Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "all"
              ? "bg-indigo-600/10 border-indigo-500/40 text-white"
              : "bg-[#0c1222] border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-slate-400">
            Total Tickets
          </span>
          <span className="text-2xl font-black text-white mt-1 block">{counts.all}</span>
        </button>

        <button
          onClick={() => setStatusFilter("open")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "open"
              ? "bg-amber-500/10 border-amber-500/40 text-white"
              : "bg-[#0c1222] border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-amber-400/80">
            Open
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">{counts.open}</span>
        </button>

        <button
          onClick={() => setStatusFilter("in_progress")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "in_progress"
              ? "bg-sky-500/10 border-sky-500/40 text-white"
              : "bg-[#0c1222] border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-sky-400/80">
            In Progress
          </span>
          <span className="text-2xl font-black text-sky-400 mt-1 block">{counts.in_progress}</span>
        </button>

        <button
          onClick={() => setStatusFilter("resolved")}
          className={`p-4 rounded-xl border text-left transition-all ${
            statusFilter === "resolved"
              ? "bg-emerald-500/10 border-emerald-500/40 text-white"
              : "bg-[#0c1222] border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-emerald-400/80">
            Resolved
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{counts.resolved}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#0c1222] border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID or Subject..."
            className="w-full pl-9 pr-3 py-2 bg-[#070b14] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#070b14] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={fetchTickets}
            title="Refresh List"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ticket List Table / Cards */}
      <div className="rounded-2xl bg-[#0c1222] border border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
            <span className="text-xs">Loading support tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No tickets found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "No tickets match your filter criteria. Try resetting filters."
                : "You don't have any support tickets yet. Click create ticket to get started."}
            </p>
            {(!searchTerm && statusFilter === "all") && (
              <Link
                href="/member/ticket/create"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Open First Ticket</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#070b14]/50 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-400">
                      {t.ticket_id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {t.messages && t.messages.length > 0
                          ? t.messages[t.messages.length - 1].content
                          : "No messages"}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 text-[11px]">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getPriorityBadge(t.priority)}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(t.status)}</td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(t.updated_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/member/ticket/${t.ticket_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 font-semibold transition-all"
                      >
                        <span>View</span>
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

