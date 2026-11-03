"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthBrand from "@/app/auth/auth-brand";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMessage(null);

    if (!token || !email) {
      setErrorMessage("Invalid reset link. Token or email is missing.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Failed to reset password.");
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="w-full max-w-md">
        <div className="auth-card p-6 sm:p-8 rounded-3xl text-center space-y-4">
          <AuthBrand />
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">Invalid Reset Link</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            This password reset link is invalid or incomplete. Please request a new link from the forgot password page.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/forgot-password"
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              <span>Request New Reset Link</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="auth-card p-6 sm:p-8 rounded-3xl">
        <AuthBrand />
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Set New Password</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Enter your new password below for <span className="text-white font-mono">{email}</span>.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-4 text-center animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5 justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Password reset successfully! Redirecting to login...</span>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Click here if not redirected automatically</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Password (min 6 characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 bg-slate-900/70 border border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Save New Password</span>
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
                <span>Cancel &amp; Back to Log In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-card w-full max-w-md p-8 rounded-3xl text-center text-slate-400 text-xs">
          <AuthBrand />
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
          <span>Loading reset page...</span>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
