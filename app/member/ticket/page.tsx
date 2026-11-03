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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <RefreshCw className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Closed
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: TicketItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
            <AlertCircle className="w-3 h-3" /> Urgent
          </span>
        );
      case "high":
        return <span className="text-[11px] font-semibold text-amber-600 capitalize">High</span>;
      case "normal":
        return <span className="text-[11px] font-medium text-slate-700 capitalize">Normal</span>;
      case "low":
        return <span className="text-[11px] font-medium text-slate-500 capitalize">Low</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Customer Support Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Support Tickets</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Need help with an order, balance deposit, or technical inquiry? Open a ticket to receive direct real-time assistance.
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          <Link
            href="/member/ticket/create"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
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
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-emerald-50/70 border-emerald-500/60 ring-1 ring-emerald-500/30"
              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-slate-500">
            Total Tickets
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">{counts.all}</span>
        </button>

        <button
          onClick={() => setStatusFilter("open")}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === "open"
              ? "bg-amber-50 border-amber-500/60 ring-1 ring-amber-500/30"
              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-amber-700">
            Open
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-amber-600 mt-1 block">{counts.open}</span>
        </button>

        <button
          onClick={() => setStatusFilter("in_progress")}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === "in_progress"
              ? "bg-sky-50 border-sky-500/60 ring-1 ring-sky-500/30"
              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-sky-700">
            In Progress
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-sky-600 mt-1 block">{counts.in_progress}</span>
        </button>

        <button
          onClick={() => setStatusFilter("resolved")}
          className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
            statusFilter === "resolved"
              ? "bg-emerald-50 border-emerald-500/60 ring-1 ring-emerald-500/30"
              : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block text-emerald-700">
            Resolved
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 mt-1 block">{counts.resolved}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID or Subject..."
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
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
            className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Ticket List Table / Cards */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            <span className="text-xs">Loading support tickets...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">No tickets found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "all"
                ? "No tickets match your filter criteria. Try resetting filters."
                : "You don't have any support tickets yet. Click create ticket to get started."}
            </p>
            {(!searchTerm && statusFilter === "all") && (
              <Link
                href="/member/ticket/create"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors mt-1"
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
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Ticket ID</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Activity</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      {t.ticket_id}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate max-w-xs sm:max-w-md">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md mt-0.5">
                        {t.messages && t.messages.length > 0
                          ? t.messages[t.messages.length - 1].content
                          : "No messages"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">{getPriorityBadge(t.priority)}</td>
                    <td className="py-2.5 px-3">{getStatusBadge(t.status)}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {new Date(t.updated_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href={`/member/ticket/${t.ticket_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-semibold transition-all text-[11px]"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
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
