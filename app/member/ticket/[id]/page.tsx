"use client";

import React, { useState, useEffect, useRef, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  User,
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
          if (prev.messages.some((m) => m.id === msg.id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, msg],
            updated_at: new Date().toISOString(),
          };
        });
      });

      return () => {
        channel.unbind_all();
        pusher.unsubscribe(`ticket-${ticketId}`);
      };
    } catch (err) {
      console.warn("Pusher subscription error:", err);
    }
  }, [ticketId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/member/ticket/${ticketId}/reply`, {
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Open
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case "closed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Closed
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center space-y-2 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
        <span className="text-xs">Loading ticket details...</span>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-slate-900">{error || "Ticket not found"}</h2>
        <Link
          href="/member/ticket"
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Tickets</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-5 flex flex-col min-h-[calc(100vh-140px)]">
      {/* Top Bar Navigation & Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href="/member/ticket"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tickets</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {getStatusBadge(ticket.status)}
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 capitalize text-slate-700 font-semibold">
            {ticket.category}
          </span>
          <button
            onClick={fetchTicket}
            title="Refresh Conversation"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ticket Subject Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-700 font-bold mb-1">
            <span>{ticket.ticket_id}</span>
            <span>•</span>
            <span className="text-slate-400 font-sans font-normal text-xs">
              Created {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">{ticket.subject}</h1>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 shrink-0">
          <div>
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Priority</span>
            <span className="font-bold text-slate-900 capitalize text-xs">{ticket.priority}</span>
          </div>
          <div className="border-l border-slate-200 pl-3">
            <span className="block text-[10px] uppercase text-slate-400 font-bold">Cluster Node</span>
            <span className="font-mono font-bold text-emerald-700 text-xs">{ticket.server_area}</span>
          </div>
        </div>
      </div>

      {/* Message Thread Box */}
      <div className="flex-1 rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-xs">
        {/* Messages Scroll Area */}
        <div className="space-y-4 overflow-y-auto max-h-[480px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
          {ticket.messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                    isUser
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4 text-emerald-600" />}
                </div>

                {/* Message Body */}
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-1.5 text-[11px] text-slate-400 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <span className="font-bold text-slate-700">
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
                    className={`p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-emerald-600 text-white rounded-tr-none shadow-xs"
                        : "bg-slate-50 border border-slate-200 text-slate-900 rounded-tl-none"
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
        <div className="pt-4 mt-4 border-t border-slate-100">
          {ticket.status === "closed" ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium">
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
                  rows={2}
                  placeholder="Type your reply here... (Press Enter to send)"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors pr-24"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="absolute right-2.5 bottom-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{sending ? "..." : "Send"}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Realtime sync active
                </span>
                <span className="text-slate-400">Shift + Enter for new line</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
