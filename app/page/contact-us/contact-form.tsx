"use client";

import React, { useState } from "react";
import { Send, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending message
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  if (isSubmitted) {
    return (
      <div className="p-8 rounded-3xl bg-indigo-950/30 border border-indigo-500/30 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h4 className="text-xl font-bold text-white">Thank You for Reaching Out!</h4>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md">
          Your inquiry has been received. Our support team typically responds via email within 1–2 hours during business hours.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setName("");
            setEmail("");
            setSubject("");
            setMessage("");
          }}
          className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 shadow-xl space-y-5"
    >
      <div className="border-b border-slate-800/80 pb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Send Us a Direct Message</span>
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Have questions regarding billing, enterprise API keys, or custom volumes? Leave us a note.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Your Name <span className="text-indigo-400">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address <span className="text-indigo-400">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Subject <span className="text-indigo-400">*</span>
        </label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Service question, Custom order, or Reseller inquiry"
          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Message <span className="text-indigo-400">*</span>
        </label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Please describe how we can help you in detail..."
          className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending Message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}
