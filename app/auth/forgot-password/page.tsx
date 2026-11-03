"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);
    if (!identifier.trim()) {
      setErrorMessage("Please enter your registered email or username.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to process request. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setErrorMessage("Network connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Mail className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enter your email or username and we will send you a link to reset your password.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Check Your Inbox</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                If an account matches <strong>{identifier}</strong>, a password reset email has been dispatched via <strong>resend.com</strong>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Please check your inbox (and spam/junk folder) for instructions. The reset link expires in 1 hour.
              </p>
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Log In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registered Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or username"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending reset link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Log In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

