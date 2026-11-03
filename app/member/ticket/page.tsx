"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  X,
  Loader2,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import MemberTablePagination from "@/app/member/components/table-pagination";

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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [userUuid, setUserUuid] = useState<string | null>(null);

  const fetchTickets = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
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
      if (!isSilent) setLoading(false);
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
        fetchTickets(true);
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`member-${userUuid}`);
      };
    } catch (err) {
      console.warn("Pusher subscription error:", err);
    }
  }, [userUuid, fetchTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        t.ticket_id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.messages && t.messages.some((m) => m.content.toLowerCase().includes(q)));

      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [tickets, searchTerm, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const isFiltered = searchTerm.trim() !== "" || statusFilter !== "all" || categoryFilter !== "all";

  const getStatusBadge = (status: TicketItem["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <RefreshCw className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Support Tickets</span>
          </h1>
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

      {/* Filter and Search Bar Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search Ticket ID, Subject, or Message..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Controls: Category & Status */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
            {/* Category Select */}
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="order">Order</option>
            </select>

            {/* Status Tabs for Desktop */}
            <div className="hidden sm:inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => handleStatusChange("all")}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("open")}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "open"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-amber-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "open" ? "bg-white" : "bg-amber-500"}`} />
                <span>Open</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("in_progress")}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "in_progress"
                    ? "bg-sky-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-sky-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "in_progress" ? "bg-white" : "bg-sky-500"}`} />
                <span>In Progress</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("resolved")}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "resolved"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "resolved" ? "bg-white" : "bg-emerald-500"}`} />
                <span>Resolved</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("closed")}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "closed"
                    ? "bg-slate-700 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Closed</span>
              </button>
            </div>

            {/* Status Select for Mobile */}
            <div className="sm:hidden">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Reset Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-600 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Reset Filter"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchTickets(false)}
              disabled={loading}
              title="Refresh List"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Datatable Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 font-bold bg-slate-50/80 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Ticket ID</th>
                <th className="py-3 px-3.5">Subject &amp; Last Message</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Last Activity</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
                    <span>Loading support tickets...</span>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2.5">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-900 text-sm mb-1">
                      {isFiltered ? "No Matching Tickets Found" : "No Support Tickets Yet"}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
                      {isFiltered
                        ? "Try adjusting your search query or status filter to find your ticket."
                        : "You haven't opened any support tickets yet. Need help? Create your first ticket."}
                    </p>
                    {isFiltered ? (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <Link
                        href="/member/ticket/create"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Open First Ticket</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((t) => (
                  <tr key={t.ticket_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-700">
                      <Link
                        href={`/member/ticket/${t.ticket_id}`}
                        className="hover:underline"
                        title="View Ticket Conversation"
                      >
                        {t.ticket_id}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm truncate max-w-xs sm:max-w-md">
                        {t.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md mt-0.5">
                        {t.messages && t.messages.length > 0
                          ? t.messages[t.messages.length - 1].content
                          : "No messages"}
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 capitalize text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-semibold">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5">{getPriorityBadge(t.priority)}</td>
                    <td className="py-2.5 px-3.5">{getStatusBadge(t.status)}</td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(t.updated_at).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <Link
                        href={`/member/ticket/${t.ticket_id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 font-semibold transition-all text-[11px]"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Always Visible */}
        <MemberTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredTickets.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(l) => setItemsPerPage(l)}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}
