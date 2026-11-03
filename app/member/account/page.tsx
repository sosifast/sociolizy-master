"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Lock,
  Key,
  Shield,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  Server,
  Calendar,
  Sparkles,
} from "lucide-react";

interface AccountData {
  id: number;
  uuid: string;
  username: string;
  email: string | null;
  name: string;
  balance: number;
  level: string;
  api_key: string;
  server_area: string;
  created_at: string;
}

export default function MemberAccountPage() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<AccountData | null>(null);

  // Name Form State
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // API Key State
  const [apiKey, setApiKey] = useState("");
  const [customKeyInput, setCustomKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [regeneratingKey, setRegeneratingKey] = useState(false);
  const [savingCustomKey, setSavingCustomKey] = useState(false);
  const [apiKeyMessage, setApiKeyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch account data on mount
  useEffect(() => {
    fetchAccount();
  }, []);

  async function fetchAccount() {
    try {
      setLoading(true);
      const res = await fetch("/api/member/account", { cache: "no-store" });
      const json = await res.json();
      if (json.success && json.data) {
        setAccount(json.data);
        setName(json.data.name || "");
        setApiKey(json.data.api_key || "");
      }
    } catch (err) {
      console.error("Failed to fetch account info:", err);
    } finally {
      setLoading(false);
    }
  }

  // Handle Name Update
  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    setNameMessage(null);
    setSavingName(true);

    try {
      const res = await fetch("/api/member/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_name", name }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setNameMessage({ type: "error", text: data.message || "Failed to update name." });
      } else {
        setNameMessage({ type: "success", text: "Your name has been updated successfully!" });
        if (account) {
          setAccount({ ...account, name });
        }
      }
    } catch {
      setNameMessage({ type: "error", text: "A network error occurred. Please try again." });
    } finally {
      setSavingName(false);
    }
  }

  // Handle Password Update
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setUpdatingPassword(true);

    try {
      const res = await fetch("/api/member/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_password",
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPasswordMessage({ type: "error", text: data.message || "Failed to update password." });
      } else {
        setPasswordMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordMessage({ type: "error", text: "A network error occurred. Please try again." });
    } finally {
      setUpdatingPassword(false);
    }
  }

  // Handle API Key Copy
  function handleCopyApiKey() {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  }

  // Handle Regenerate API Key (16-char alphanumeric)
  async function handleRegenerateKey() {
    setApiKeyMessage(null);
    setRegeneratingKey(true);

    try {
      const res = await fetch("/api/member/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiKeyMessage({ type: "error", text: data.message || "Failed to regenerate API Key." });
      } else {
        setApiKey(data.api_key);
        setApiKeyMessage({ type: "success", text: "New 16-character API Key generated successfully!" });
      }
    } catch {
      setApiKeyMessage({ type: "error", text: "A network error occurred. Please try again." });
    } finally {
      setRegeneratingKey(false);
    }
  }

  // Handle Custom API Key Update (max 16 characters alphanumeric)
  async function handleSaveCustomKey(e: React.FormEvent) {
    e.preventDefault();
    setApiKeyMessage(null);

    const trimmed = customKeyInput.trim();
    if (!trimmed) {
      setApiKeyMessage({ type: "error", text: "Please enter a valid API Key." });
      return;
    }
    if (trimmed.length > 16) {
      setApiKeyMessage({ type: "error", text: "API Key cannot exceed 16 characters." });
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
      setApiKeyMessage({ type: "error", text: "API Key must only contain alphanumeric characters (letters and numbers)." });
      return;
    }

    setSavingCustomKey(true);

    try {
      const res = await fetch("/api/member/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: trimmed }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setApiKeyMessage({ type: "error", text: data.message || "Failed to update custom API Key." });
      } else {
        setApiKey(data.api_key);
        setCustomKeyInput("");
        setApiKeyMessage({ type: "success", text: "Custom API Key saved successfully!" });
      }
    } catch {
      setApiKeyMessage({ type: "error", text: "A network error occurred. Please try again." });
    } finally {
      setSavingCustomKey(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-48"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-slate-200 rounded-2xl"></div>
              <div className="h-72 bg-slate-200 rounded-2xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-slate-200 rounded-2xl"></div>
              <div className="h-64 bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-emerald-600" />
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal profile, update password, and configure your API key.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/documentasi"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-50 transition shadow-xs"
          >
            <span>API Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Forms): Profile Information & Security */}
        <div className="lg:col-span-2 space-y-8">
          {/* Card 1: Profile Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Profile Information</h2>
                  <p className="text-xs text-slate-500">Update your account name and view credential details</p>
                </div>
              </div>
            </div>

            {nameMessage && (
              <div
                className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  nameMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {nameMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{nameMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4">
              {/* Full Name (Editable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <button
                    type="submit"
                    disabled={savingName}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {savingName ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{savingName ? "Saving..." : "Save Name"}</span>
                  </button>
                </div>
              </div>

              {/* Username (Blocked/Disabled) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Username
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Immutable
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={account?.username || ""}
                    disabled
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs sm:text-sm text-slate-500 font-mono cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Username is permanent and cannot be modified.
                </p>
              </div>

              {/* Email (Blocked/Disabled) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Email Address
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Immutable
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={account?.email || "No email assigned"}
                    disabled
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs sm:text-sm text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Email address is locked for account security purposes.
                </p>
              </div>
            </form>
          </div>

          {/* Card 2: Security & Password */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Security &amp; Password</h2>
                  <p className="text-xs text-slate-500">Change your password to keep your account safe</p>
                </div>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {passwordMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter a new password"
                    minLength={6}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    minLength={6}
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {updatingPassword ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span>{updatingPassword ? "Updating Password..." : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: API Key Management & Quick Overview */}
        <div className="space-y-8">
          {/* Card 3: API Key & Integration */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">API Key</h2>
                  <p className="text-xs text-slate-500">Integration credential</p>
                </div>
              </div>
            </div>

            {apiKeyMessage && (
              <div
                className={`mb-5 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                  apiKeyMessage.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {apiKeyMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{apiKeyMessage.text}</span>
              </div>
            )}

            {/* Current Active API Key Box */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Active API Key (Max 16 characters)
              </label>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
                <div className="font-mono text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {showApiKey ? apiKey || "No key generated" : "••••••••••••••••"}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
                    title={showApiKey ? "Hide Key" : "Show Key"}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyApiKey}
                    className="inline-flex items-center gap-1 p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                    title="Copy API Key"
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {copiedKey && (
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  API Key copied to clipboard!
                </p>
              )}

              {/* Action: Regenerate Key */}
              <button
                type="button"
                onClick={handleRegenerateKey}
                disabled={regeneratingKey}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${regeneratingKey ? "animate-spin" : ""}`} />
                <span>{regeneratingKey ? "Generating..." : "Generate Random 16-Char Key"}</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-[10px] text-slate-400 font-bold">Or Custom Key</span>
                </div>
              </div>

              {/* Custom Key Form */}
              <form onSubmit={handleSaveCustomKey} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={16}
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    placeholder="Max 16 chars (A-Z, 0-9)"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
                  />
                  <button
                    type="submit"
                    disabled={savingCustomKey || !customKeyInput}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-xs disabled:opacity-40 cursor-pointer"
                  >
                    {savingCustomKey ? "Saving..." : "Set Key"}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Maximum 16 characters. Must contain only letters (A-Z, a-z) and numbers (0-9).
                </p>
              </form>

              <div className="pt-2">
                <Link
                  href="/documentasi"
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-emerald-900 hover:bg-emerald-50 transition group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold">View API Documentation</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 4: Account Summary Info */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Account Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  Server Node
                </span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {account?.server_area || "SG"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  Account Tier
                </span>
                <span className="font-bold text-slate-700 uppercase">
                  {account?.level || "MEMBER"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Status
                </span>
                <span className="font-medium text-slate-700">
                  {account?.email ? "Verified" : "Unset"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member Since
                </span>
                <span className="text-slate-700 font-medium">
                  {account?.created_at
                    ? new Date(account.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

