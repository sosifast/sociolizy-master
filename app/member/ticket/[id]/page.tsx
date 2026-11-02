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
  Shield,
  User,
  Sparkles,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";

interface TicketMessage {
  id: string;
  sender: "user" | "admin";
  sender_name: string;
  content: string;
  created_at: string;
}

interface TicketDetail {
  ticket_id: string;
  subject: string;
  category: "general" | "billing" | "technical" | "order";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  user_uuid: string;
  username: string;
  server_area: string;
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
}

export default function MemberTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: ticketId } = use(params);

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/member/ticket/${ticketId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Ticket not found");
        throw new Error("Failed to load ticket");
      }
      const data = await res.json();
      setTicket(data.ticket);
    } catch (err: any) {
      setError(err.message || "Failed to load ticket");
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

  // Real-time Pusher setup
  useEffect(() => {
    if (!ticketId) return;

    try {
      const pusher = getPusherClient();
      const channel = pusher.subscribe(`ticket-${ticketId}`);

      channel.bind("new-message", (msg: TicketMessage) => {
        setTicket((prev) => {
          if (!prev) return prev;
          // Avoid duplicate messages if already present
          if (prev.messages.some((m) => m.id === msg.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, msg],
            updated_at: new Date().toISOString(),
          };
        });
        scrollToBottom();
      });

      channel.bind("status-changed", (data: { status: TicketDetail["status"] }) => {
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
      console.warn("Pusher subscribe error:", err);
    }
  }, [ticketId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/member/ticket/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
    } catch (err: any) {
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: TicketDetail["status"]) => {
    switch (status) {
      case "open":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Closed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
        <span className="text-xs">Loading ticket details...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-white">{error || "Ticket not found"}</h2>
        <Link
          href="/member/ticket"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Tickets</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5 flex flex-col min-h-[calc(100vh-140px)]">
      {/* Top Bar Navigation & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/member/ticket"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tickets</span>
        </Link>

        <div className="flex items-center gap-2">
          {getStatusBadge(ticket.status)}
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 capitalize text-slate-300">
            {ticket.category}
          </span>
          <button
            onClick={fetchTicket}
            title="Refresh Conversation"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ticket Subject Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1222] border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-400 font-bold mb-1">
            <span>{ticket.ticket_id}</span>
            <span>•</span>
            <span className="text-slate-500 font-sans font-normal">
              Created {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white">{ticket.subject}</h1>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
          <div>
            <span className="block text-[10px] uppercase text-slate-500 font-semibold">Priority</span>
            <span className="font-semibold text-slate-200 capitalize">{ticket.priority}</span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="block text-[10px] uppercase text-slate-500 font-semibold">Cluster Node</span>
            <span className="font-mono font-bold text-indigo-400">{ticket.server_area}</span>
          </div>
        </div>
      </div>

      {/* Message Thread Box */}
      <div className="flex-1 rounded-2xl bg-[#0c1222] border border-slate-800 p-4 sm:p-6 flex flex-col justify-between overflow-hidden shadow-xs">
        {/* Messages Scroll Area */}
        <div className="space-y-4 overflow-y-auto max-h-[500px] sm:max-h-[560px] pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {ticket.messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? "bg-indigo-600 text-white"
                      : "bg-emerald-600 text-white shadow-xs"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-500 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="font-semibold text-slate-300">
                      {isUser ? "You" : "Support Team"}
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
                      isUser
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10"
                        : "bg-[#070b14] border border-slate-800 text-slate-100 rounded-tl-none shadow-xs"
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

        {/* Input / Reply Area */}
        <div className="pt-4 mt-4 border-t border-slate-800/80">
          {ticket.status === "closed" ? (
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              This ticket has been marked as closed. If you require further assistance, please open a new ticket.
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  rows={3}
                  placeholder="Type your reply here... (Press Enter to send)"
                  className="w-full px-4 py-3 bg-[#070b14] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors pr-24"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="absolute right-3 bottom-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? "Sending..." : "Send"}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Realtime sync active
                </span>
                <span>Shift + Enter for new line</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

