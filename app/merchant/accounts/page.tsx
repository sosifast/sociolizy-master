"use client";

import React, { useState, useEffect } from "react";
import {
  Store,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Coins,
  Globe,
  Receipt,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function MerchantAccountsPage() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [availableCoins, setAvailableCoins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<any | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formAllowedCoins, setFormAllowedCoins] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/merchant/accounts");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load merchants");
      }
      setMerchants(json.data);
      if (json.availableCoins) {
        setAvailableCoins(json.availableCoins);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const openCreateModal = () => {
    setEditingMerchant(null);
    setFormName("");
    setFormDesc("");
    setFormAllowedCoins(availableCoins.map((c) => `${c.symbol}_${c.network}`));
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (m: any) => {
    setEditingMerchant(m);
    setFormName(m.name);
    setFormDesc(m.description || "");
    const allowed = Array.isArray(m.allowedCoins)
      ? m.allowedCoins
      : availableCoins.map((c) => `${c.symbol}_${c.network}`);
    setFormAllowedCoins(allowed);
    setFormError("");
    setModalOpen(true);
  };

  const toggleCoin = (coinKey: string) => {
    setFormAllowedCoins((prev) =>
      prev.includes(coinKey)
        ? prev.filter((k) => k !== coinKey)
        : [...prev, coinKey]
    );
  };

  const handleSelectAllCoins = () => {
    setFormAllowedCoins(availableCoins.map((c) => `${c.symbol}_${c.network}`));
  };

  const handleDeselectAllCoins = () => {
    setFormAllowedCoins([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Merchant name is required.");
      return;
    }

    if (formAllowedCoins.length === 0) {
      setFormError("Please select at least one accepted cryptocurrency.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const url = "/api/merchant/accounts";
      const method = editingMerchant ? "PUT" : "POST";
      const body = {
        id: editingMerchant?.id,
        name: formName.trim(),
        description: formDesc.trim(),
        allowedCoins: formAllowedCoins,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to save merchant");
      }

      setModalOpen(false);
      fetchMerchants();
    } catch (err: any) {
      setFormError(err?.message || "An error occurred while saving");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete merchant "${name}" along with all connected websites and transactions?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/merchant/accounts?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete merchant");
      }
      fetchMerchants();
    } catch (err: any) {
      alert(err?.message || "Deletion failed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Multi Merchant Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create and organize multiple store profiles with customized cryptocurrency acceptance settings.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Merchant Store</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
          <span className="text-xs">Loading merchants...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-950/40 border border-rose-800/60 p-5 rounded-2xl text-center text-rose-300 text-xs">
          {error}
        </div>
      ) : merchants.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No Merchants Found</h3>
          <p className="text-xs text-slate-400 mb-6">
            Create your first merchant account to begin connecting websites and processing crypto payments.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Merchant Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {merchants.map((m) => {
            const allowedList = Array.isArray(m.allowedCoins) ? m.allowedCoins : [];
            return (
              <div
                key={m.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {m.name}
                        </h3>
                        <span className="text-[11px] font-mono text-slate-400">/{m.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(m)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Merchant"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id, m.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Delete Merchant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {m.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4">{m.description}</p>
                  )}

                  {/* Connected stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-slate-300">
                        {m._count?.websites || 0} Websites
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-slate-300">
                        {m._count?.transactions || 0} Invoices
                      </span>
                    </div>
                  </div>

                  {/* Allowed Coins list (Requirement A.8) */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Active Coins ({allowedList.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allowedList.slice(0, 6).map((c: string) => (
                        <span
                          key={c}
                          className="text-[10px] bg-slate-800 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md font-mono"
                        >
                          {c.replace("_", " ")}
                        </span>
                      ))}
                      {allowedList.length > 6 && (
                        <span className="text-[10px] text-slate-500 py-0.5">
                          +{allowedList.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full font-medium">
                    {m.status}
                  </span>
                  <Link
                    href={`/merchant/websites?merchantId=${m.id}`}
                    className="text-slate-300 hover:text-white font-medium flex items-center gap-1 group/btn"
                  >
                    <span>Manage Websites</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingMerchant ? "Edit Merchant Store" : "Create New Merchant"}
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
                  Merchant / Brand Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. My Digital Store"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief summary of this store or application..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              {/* Requirement A.8: Select allowed coins */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Accepted Cryptocurrencies *
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={handleSelectAllCoins}
                      className="text-emerald-400 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-600">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllCoins}
                      className="text-slate-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  {availableCoins.map((coin) => {
                    const key = `${coin.symbol}_${coin.network}`;
                    const isChecked = formAllowedCoins.includes(key);
                    return (
                      <label
                        key={key}
                        onClick={() => toggleCoin(key)}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-emerald-500/10 border-emerald-500/40 text-white"
                            : "bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/40"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <div className="leading-tight">
                          <div className="font-bold text-[11px]">{coin.symbol}</div>
                          <div className="text-[10px] text-slate-400 uppercase">
                            {coin.network}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Only selected coins will be available on the direct checkout page for this merchant.
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
                  {isSubmitting ? "Saving..." : "Save Merchant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
