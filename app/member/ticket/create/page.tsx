"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  ArrowLeft,
  Send,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

export default function MemberCreateTicketPage() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Please provide a subject for your ticket.");
      return;
    }
    if (!message.trim()) {
      setError("Please describe your issue in the message box.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/member/ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit ticket");
      }

      router.push(`/member/ticket/${data.ticket.ticket_id}`);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/member/ticket"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Tickets</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Create Support Ticket</h1>
            <p className="text-xs text-slate-400">
              Submit your request to our 24/7 technical and customer support staff.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Ticket Subject <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Delay on Order #1042 or Deposit query"
              maxLength={120}
              className="w-full px-3.5 py-2.5 bg-[#070b14] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070b14] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="general">General Inquiry</option>
                <option value="order">Order Issue / Refill</option>
                <option value="billing">Deposit &amp; Billing</option>
                <option value="technical">Technical Support</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#070b14] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Low (General questions)</option>
                <option value="normal">Normal (Standard request)</option>
                <option value="high">High (Service interrupted)</option>
                <option value="urgent">Urgent (Immediate attention)</option>
              </select>
            </div>
          </div>

          {/* First Message Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Message / Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Provide as much relevant detail as possible (e.g. Order Invoice, Service ID, Target Link)..."
              className="w-full px-3.5 py-2.5 bg-[#070b14] border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              required
            />
          </div>

          {/* Info Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-start gap-2.5 text-[11px] text-indigo-300/80">
            <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            <span>
              All tickets are processed securely through our multi-server cluster and monitored by support administrators in real-time.
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/member/ticket"
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Submitting..." : "Submit Ticket"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

