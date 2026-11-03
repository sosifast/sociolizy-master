"use client";

import React, { useState, useEffect, useRef, useCallback, use } from "react";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Shield,
  Server,
  Sparkles,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { useToast } from "@/app/admin/components/toast-context";

interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  sender_name: string;
  content: string;
  created_at: string;
}

interface AdminTicketDetail {
  ticket_id: string;
  user_uuid: string;
  username: string;
  email: string;
  server_area: string;
  subject: string;
  category: "general" | "billing" | "technical" | "order";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
}

export default function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ticketId } = use(params);
  const { toast } = useToast();

  const [ticket, setTicket] = useState<AdminTicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/ticket/${ticketId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Tiket tidak ditemukan");
        throw new Error("Gagal mengambil data tiket");
      }
      const data = await res.json();
      setTicket(data.ticket);
    } catch (err: any) {
      setError(err.message || "Gagal memuat tiket");
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  // Real-time Pusher
  useEffect(() => {
    if (!ticketId) return;

    try {
      const pusher = getPusherClient();
      const channel = pusher.subscribe(`ticket-${ticketId}`);

      channel.bind("new-message", (msg: TicketMessage) => {
        setTicket((prev) => {
          if (!prev) return prev;
          if (prev.messages.some((m) => m.id === msg.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, msg],
            updated_at: new Date().toISOString(),
          };
        });
        scrollToBottom();
      });

      channel.bind("status-changed", (data: { status: AdminTicketDetail["status"] }) => {
        setTicket((prev) => {
          if (!prev) return prev;
          return { ...prev, status: data.status };
        });
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`ticket-${ticketId}`);
      };
    } catch (err) {
      console.warn("Pusher admin detail subscribe error:", err);
    }
  }, [ticketId]);

  const handleStatusChange = async (newStatus: AdminTicketDetail["status"]) => {
    if (!ticket) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/ticket/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status");

      setTicket((prev) => (prev ? { ...prev, status: newStatus } : prev));
      toast.success("Status Diperbarui", `Status tiket diubah menjadi ${newStatus}`);
    } catch (err: any) {
      toast.error("Gagal Update", err.message || "Terjadi kesalahan");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority: AdminTicketDetail["priority"]) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/admin/ticket/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: newPriority }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui prioritas");

      setTicket((prev) => (prev ? { ...prev, priority: newPriority } : prev));
      toast.success("Prioritas Diperbarui", `Prioritas tiket diubah menjadi ${newPriority}`);
    } catch (err: any) {
      toast.error("Gagal Update", err.message || "Terjadi kesalahan");
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/admin/ticket/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mengirim balasan");
      }

      setReplyContent("");
      toast.success("Balasan Terkirim", "Pesan telah diteruskan realtime ke member.");
    } catch (err: any) {
      toast.error("Gagal Kirim", err.message || "Terjadi kesalahan");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-2">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
        <p className="text-xs">Memuat detail tiket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">{error || "Tiket tidak ditemukan"}</h2>
        <Link
          href="/admin/ticket"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Tiket</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/admin/ticket"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Semua Tiket</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTicket}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition-colors"
            title="Refresh Pesan"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ticket Details Summary Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-600 mb-1">
              <span>{ticket.ticket_id}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-sans font-medium">
                Dibuat {new Date(ticket.created_at).toLocaleString("id-ID")}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">{ticket.subject}</h1>
          </div>

          {/* Status & Priority Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ubah Status
              </label>
              <select
                value={ticket.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="open">Open (Menunggu)</option>
                <option value="in_progress">In Progress (Diproses)</option>
                <option value="resolved">Resolved (Selesai)</option>
                <option value="closed">Closed (Ditutup)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Prioritas
              </label>
              <select
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Member and Cluster Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Member</span>
            <span className="font-bold text-slate-800">@{ticket.username}</span>
            <span className="text-[11px] text-slate-500 block truncate">{ticket.email}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kategori</span>
            <span className="font-bold text-slate-800 capitalize">{ticket.category}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Klaster Database</span>
            <span className="font-mono font-bold text-emerald-600">{ticket.server_area}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">User UUID</span>
            <span className="font-mono text-[10px] text-slate-600 truncate block">{ticket.user_uuid}</span>
          </div>
        </div>
      </div>

      {/* Messages Thread Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
        {/* Messages List */}
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 mb-6">
          {ticket.messages.map((m) => {
            const isAdmin = m.sender === "admin";
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isAdmin ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isAdmin
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-400 ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="font-semibold text-slate-600">
                      {isAdmin ? "Admin (Support)" : `@${ticket.username}`}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isAdmin
                        ? "bg-emerald-600 text-white rounded-tr-none shadow-sm shadow-emerald-600/10"
                        : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-2">
          <div className="relative">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply(e);
                }
              }}
              rows={3}
              placeholder="Tulis balasan untuk member... (Tekan Enter untuk mengirim)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all pr-24"
            />
            <button
              type="submit"
              disabled={sending || !replyContent.trim()}
              className="absolute right-3 bottom-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? "Mengirim..." : "Kirim"}</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-600 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Kanal Pusher Aktif (Realtime)
            </span>
            <span>Shift + Enter untuk baris baru</span>
          </div>
        </form>
      </div>
    </div>
  );
}
