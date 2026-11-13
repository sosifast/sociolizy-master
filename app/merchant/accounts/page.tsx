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
  Globe,
  Receipt,
  X,
  ChevronRight,
  Coins,
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
    <div className="space-y-7 animate__animated animate__fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="spectrum-badge-green font-mono">
              Store Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multi Merchant Stores
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize separate store accounts and customize supported cryptocurrencies for each merchant.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="spectrum-btn-primary text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Merchant Store</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
          <span className="text-xs font-medium">Loading store accounts...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl text-center text-rose-700 text-xs font-semibold">
          {error}
        </div>
      ) : merchants.length === 0 ? (
        <div className="spectrum-card p-12 text-center max-w-lg mx-auto bg-white">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Merchants Found</h3>
          <p className="text-xs text-slate-500 mb-6">
            Create your first store profile to start connecting websites and collecting payments.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="spectrum-btn-primary text-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Store Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.map((m) => {
            const allowedList = Array.isArray(m.allowedCoins) ? m.allowedCoins : [];
            return (
              <div
                key={m.id}
                className="spectrum-card p-6 flex flex-col justify-between group hover:border-emerald-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {m.name}
                        </h3>
                        <span className="text-xs font-mono text-slate-400">/{m.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(m)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Edit Merchant"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id, m.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Merchant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {m.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  {/* Connected stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-700">
                        {m._count?.websites || 0} Websites
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-700">
                        {m._count?.transactions || 0} Invoices
                      </span>
                    </div>
                  </div>

                  {/* Allowed Coins list (Requirement A.8) */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Enabled Coins ({allowedList.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {allowedList.slice(0, 6).map((c: string) => (
                        <span
                          key={c}
                          className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-mono font-semibold shadow-2xs"
                        >
                          {c.replace("_", " ")}
                        </span>
                      ))}
                      {allowedList.length > 6 && (
                        <span className="text-[10px] text-slate-400 font-medium py-0.5">
                          +{allowedList.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="spectrum-badge-green font-mono">
                    {m.status}
                  </span>
                  <Link
                    href={`/merchant/websites?merchantId=${m.id}`}
                    className="text-slate-600 hover:text-emerald-600 font-bold flex items-center gap-1 group/btn transition-colors"
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

      {/* CREATE / EDIT MODAL (White Theme) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate__animated animate__fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMerchant ? "Edit Merchant Store" : "Create New Merchant"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Merchant / Brand Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Diamond Games Store"
                  className="spectrum-input w-full"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief summary of your store or services..."
                  rows={2}
                  className="spectrum-input w-full"
                />
              </div>

              {/* Requirement A.8: Select allowed coins */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">
                    Accepted Cryptocurrencies *
                  </label>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={handleSelectAllCoins}
                      className="text-emerald-600 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllCoins}
                      className="text-slate-400 hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  {availableCoins.map((coin) => {
                    const key = `${coin.symbol}_${coin.network}`;
                    const isChecked = formAllowedCoins.includes(key);
                    return (
                      <label
                        key={key}
                        onClick={() => toggleCoin(key)}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? "bg-emerald-50/80 border-emerald-400 text-slate-900 shadow-2xs font-semibold"
                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="leading-tight">
                          <div className="font-bold text-[11px] text-slate-800">{coin.symbol}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-mono">
                            {coin.network}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[11px] text-slate-400 mt-1.5 block">
                  Only selected coins will be available on the direct checkout page for this merchant.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="spectrum-btn-primary text-xs cursor-pointer disabled:opacity-50"
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
