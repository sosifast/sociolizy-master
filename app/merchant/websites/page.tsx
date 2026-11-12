"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Globe,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  Key,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function MerchantWebsitesContent() {
  const searchParams = useSearchParams();
  const initialMerchantFilter = searchParams.get("merchantId") || "";

  const [websites, setWebsites] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState(initialMerchantFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<any | null>(null);

  // Form states
  const [formMerchantId, setFormMerchantId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDomain, setFormDomain] = useState("");
  const [formWebhookUrl, setFormWebhookUrl] = useState("");
  const [formReturnUrl, setFormReturnUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Secret visibility & copied state
  const [visibleSecrets, setVisibleSecrets] = useState<Record<number, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleSecret = (id: number) => {
    setVisibleSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const url = selectedMerchantFilter
        ? `/api/merchant/websites?merchantId=${selectedMerchantFilter}`
        : "/api/merchant/websites";

      const [resWebsites, resMerchants] = await Promise.all([
        fetch(url),
        fetch("/api/merchant/accounts"),
      ]);

      const jsonWebsites = await resWebsites.json();
      const jsonMerchants = await resMerchants.json();

      if (jsonWebsites.success) setWebsites(jsonWebsites.data);
      if (jsonMerchants.success) setMerchants(jsonMerchants.data);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMerchantFilter]);

  const openCreateModal = () => {
    setEditingWebsite(null);
    setFormMerchantId(merchants[0]?.id ? String(merchants[0].id) : "");
    setFormName("");
    setFormDomain("");
    setFormWebhookUrl("");
    setFormReturnUrl("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (w: any) => {
    setEditingWebsite(w);
    setFormMerchantId(String(w.merchantId));
    setFormName(w.name);
    setFormDomain(w.domain);
    setFormWebhookUrl(w.webhookUrl || "");
    setFormReturnUrl(w.returnUrl || "");
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMerchantId || !formName.trim() || !formDomain.trim()) {
      setFormError("Merchant store, website name, and domain are required.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const url = "/api/merchant/websites";
      const method = editingWebsite ? "PUT" : "POST";
      const body = {
        id: editingWebsite?.id,
        merchantId: Number(formMerchantId),
        name: formName.trim(),
        domain: formDomain.trim(),
        webhookUrl: formWebhookUrl.trim(),
        returnUrl: formReturnUrl.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save website");
      }

      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err?.message || "An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerateKeys = async (w: any) => {
    if (!confirm(`Regenerate API Key & Secret for website "${w.name}"? Previous keys will become invalid immediately.`)) {
      return;
    }

    try {
      const res = await fetch("/api/merchant/websites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: w.id, regenerateKeys: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to regenerate keys");
      }
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete website "${name}"?`)) return;

    try {
      const res = await fetch(`/api/merchant/websites?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete website");
      }
      fetchData();
    } catch (err: any) {
      alert(err?.message || "Deletion failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Websites & API Keys</h1>
          <p className="text-xs text-slate-400 mt-1">
            Connect online store domains and generate secure integration credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter by Merchant */}
          {merchants.length > 0 && (
            <select
              value={selectedMerchantFilter}
              onChange={(e) => setSelectedMerchantFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-hidden"
            >
              <option value="">All Merchant Stores</option>
              {merchants.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            disabled={merchants.length === 0}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Website</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
          <span className="text-xs">Loading websites...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-950/40 border border-rose-800/60 p-5 rounded-2xl text-center text-rose-300 text-xs">
          {error}
        </div>
      ) : merchants.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center max-w-md mx-auto">
          <p className="text-xs text-slate-400 mb-4">
            You must create at least one Merchant Store before connecting a Website.
          </p>
          <Link
            href="/merchant/accounts"
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Create Merchant First</span>
          </Link>
        </div>
      ) : websites.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Connected Websites</h3>
          <p className="text-xs text-slate-400 mb-6">
            Register your website domain to receive API Credentials and direct checkout integration.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Website Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {websites.map((w) => {
            const showSecret = visibleSecrets[w.id];
            return (
              <div
                key={w.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-md transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{w.name}</h3>
                        <span className="text-[10px] bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium">
                          {w.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="text-slate-300 font-mono">{w.domain}</span>
                        <span>•</span>
                        <span className="text-purple-400 font-semibold">{w.merchant?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleRegenerateKeys(w)}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                      title="Regenerate API Keys"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Reset Keys</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(w)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Website"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(w.id, w.name)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Delete Website"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* API Credentials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {/* Public API Key */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Key className="w-3 h-3 text-emerald-400" />
                        API Key (Public)
                      </span>
                      <span>Header: x-api-key</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-200 truncate select-all">
                        {w.apiKey}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(w.apiKey, `api_${w.id}`)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md cursor-pointer shrink-0"
                        title="Copy API Key"
                      >
                        {copiedKey === `api_${w.id}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Secret Key */}
                  <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Shield className="w-3 h-3 text-amber-400" />
                        Secret Key (Private)
                      </span>
                      <span>Header: x-secret-key</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-slate-200 truncate select-all">
                        {showSecret ? w.secretKey : "••••••••••••••••••••••••••••••••"}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSecret(w.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md cursor-pointer"
                          title={showSecret ? "Hide Secret" : "Show Secret"}
                        >
                          {showSecret ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(w.secretKey, `sec_${w.id}`)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md cursor-pointer"
                          title="Copy Secret Key"
                        >
                          {copiedKey === `sec_${w.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Webhook & Return URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400 pt-1">
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                    <span className="text-slate-500 font-semibold uppercase text-[10px] w-24 shrink-0">
                      Webhook URL:
                    </span>
                    <span className="font-mono text-slate-300 truncate">
                      {w.webhookUrl || "(Not configured)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
                    <span className="text-slate-500 font-semibold uppercase text-[10px] w-24 shrink-0">
                      Return URL:
                    </span>
                    <span className="font-mono text-slate-300 truncate">
                      {w.returnUrl || "(Not configured)"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT WEBSITE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingWebsite ? "Edit Connected Website" : "Connect New Website"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Merchant Store *
                </label>
                <select
                  value={formMerchantId}
                  onChange={(e) => setFormMerchantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  required
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (/{m.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Website / Application Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. My Main Store"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Domain / Website URL *
                </label>
                <input
                  type="text"
                  value={formDomain}
                  onChange={(e) => setFormDomain(e.target.value)}
                  placeholder="https://yourstore.com or yourstore.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Webhook / IPN Callback URL (Optional)
                </label>
                <input
                  type="url"
                  value={formWebhookUrl}
                  onChange={(e) => setFormWebhookUrl(e.target.value)}
                  placeholder="https://yourstore.com/api/payment-callback"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Our gateway sends instant POST notifications with cryptographic signature upon payment completion.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Default Return URL (Optional)
                </label>
                <input
                  type="url"
                  value={formReturnUrl}
                  onChange={(e) => setFormReturnUrl(e.target.value)}
                  placeholder="https://yourstore.com/order-success"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Customers will be redirected back to this URL after payment is confirmed.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Website"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MerchantWebsitesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
          <span className="text-xs">Loading websites...</span>
        </div>
      }
    >
      <MerchantWebsitesContent />
    </Suspense>
  );
}
