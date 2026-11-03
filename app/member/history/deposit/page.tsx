"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Wallet,
  Clock,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Zap,
  Receipt,
  Search,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client";
import { useMemberRealtime } from "@/app/member/components/member-realtime-provider";
import MemberTablePagination from "@/app/member/components/table-pagination";

interface DepositItem {
  id: number;
  order_id: string;
  amount: number | string;
  currency: string;
  crypto_amount?: number | string | null;
  crypto_currency?: string | null;
  payment_status: string;
  invoice_url: string | null;
  txid: string | null;
  create_at: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MemberDepositHistoryPage() {
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userUuid, setUserUuid] = useState<string | null>(null);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);

  // Search & Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const { showMemberToast, setBalance } = useMemberRealtime();

  // Debounce search term by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to page 1 on new search
    }, 350);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch deposit list with filters & pagination
  const fetchDeposits = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) setLoading(true);

        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(itemsPerPage),
          status: statusFilter,
        });

        if (debouncedSearch.trim()) {
          params.append("search", debouncedSearch.trim());
        }

        const res = await fetch(`/api/member/payment/history?${params.toString()}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setDeposits(json.data);
          if (json.pagination) {
            setPagination(json.pagination);
          }
          if (json.user_uuid) {
            setUserUuid(json.user_uuid);
          }
          if (typeof json.balance === "number") {
            setBalance(json.balance);
          }
        }
      } catch (err) {
        console.error("Failed to load deposit history:", err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    },
    [currentPage, itemsPerPage, statusFilter, debouncedSearch, setBalance]
  );

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  // Realtime handler for deposit updates
  const handleLiveDepositUpdate = useCallback(
    (data: any) => {
      if (!data?.order_id) return;

      const newStatus = (data.status || data.payment_status || "").toLowerCase();
      const isPaid = newStatus === "paid" || newStatus === "paid_over";

      setDeposits((prev) =>
        prev.map((d) => {
          if (d.order_id === data.order_id) {
            return {
              ...d,
              payment_status: newStatus || d.payment_status,
              txid: data.txid || d.txid,
            };
          }
          return d;
        })
      );

      // Flash highlighted row
      setRecentlyUpdatedId(data.order_id);
      setTimeout(() => {
        setRecentlyUpdatedId((curr) => (curr === data.order_id ? null : curr));
      }, 5000);

      // Update navbar/topbar balance in realtime
      if (data.new_balance !== undefined && typeof data.new_balance === "number") {
        setBalance(data.new_balance);
        window.dispatchEvent(
          new CustomEvent("master_smm:balance_updated", {
            detail: { balance: data.new_balance },
          })
        );
      }

      if (isPaid) {
        showMemberToast(
          "Deposit Confirmed!",
          `Invoice ${data.order_id} ($${Number(data.amount || 0).toFixed(2)}) has been verified and credited to your balance.`,
          "success"
        );
      }
    },
    [setBalance, showMemberToast]
  );

  // Direct Pusher Webhook Realtime Subscription
  useEffect(() => {
    if (!userUuid) return;

    try {
      const pusher = getPusherClient();
      const channel = pusher.subscribe(`member-${userUuid}`);

      channel.bind("deposit-status-updated", (data: any) => {
        handleLiveDepositUpdate(data);
      });

      channel.bind("deposit-created", () => {
        fetchDeposits(true);
      });

      return () => {
        channel.unbind("deposit-status-updated");
        channel.unbind("deposit-created");
        pusher.unsubscribe(`member-${userUuid}`);
      };
    } catch (err) {
      console.warn("[Pusher] Realtime subscription error:", err);
    }
  }, [userUuid, handleLiveDepositUpdate, fetchDeposits]);

  // Window Custom Event Listener (cross-tab / context sync)
  useEffect(() => {
    const handleWindowStatusUpdate = (e: any) => {
      handleLiveDepositUpdate(e.detail);
    };

    const handleWindowNewDeposit = () => {
      fetchDeposits(true);
    };

    window.addEventListener("master_smm:deposit_status_updated", handleWindowStatusUpdate);
    window.addEventListener("master_smm:deposit_created", handleWindowNewDeposit);

    return () => {
      window.removeEventListener("master_smm:deposit_status_updated", handleWindowStatusUpdate);
      window.removeEventListener("master_smm:deposit_created", handleWindowNewDeposit);
    };
  }, [handleLiveDepositUpdate, fetchDeposits]);

  // Smart background polling fallback if any transaction on the current page is still pending
  const hasPendingTransactions = useMemo(() => {
    return deposits.some((d) => {
      const s = d.payment_status.toLowerCase();
      return s === "pending" || s === "check" || s === "process" || s === "confirm_check";
    });
  }, [deposits]);

  useEffect(() => {
    if (!hasPendingTransactions) return;

    const interval = setInterval(() => {
      fetchDeposits(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [hasPendingTransactions, fetchDeposits]);

  // Manual Cryptomus Sync On-Demand
  const handleManualSync = async (orderId: string) => {
    if (syncingOrderId) return;
    setSyncingOrderId(orderId);

    try {
      const res = await fetch("/api/member/payment/cryptomus/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        handleLiveDepositUpdate(json.data);
      } else {
        showMemberToast("Sync Status", json.message || "Awaiting blockchain confirmation.", "info");
      }
    } catch (err) {
      console.error("Manual sync error:", err);
    } finally {
      setSyncingOrderId(null);
    }
  };

  const getStatusBadge = (status: string, orderId: string) => {
    const s = status.toLowerCase();
    if (s === "paid" || s === "paid_over") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
        </span>
      );
    }
    if (s === "cancel" || s === "failed" || s === "expired") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 text-rose-600" /> {s === "expired" ? "Expired" : "Failed"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600 animate-spin" /> Pending
        </span>
        <button
          type="button"
          onClick={() => handleManualSync(orderId)}
          disabled={syncingOrderId === orderId}
          title="Verify Blockchain Network Status"
          className="p-1 rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 text-[10px] transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${syncingOrderId === orderId ? "animate-spin text-emerald-600" : ""}`} />
        </button>
      </span>
    );
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const isFiltered = searchTerm.trim() !== "" || statusFilter !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>Deposit History</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={() => fetchDeposits(false)}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/member/payment"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Deposit</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Invoice ID, TXID, or Crypto (USDT, BTC)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50/60 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons / Select */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Tabs for Desktop / Tablets */}
            <div className="hidden sm:inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 text-xs">
              <button
                type="button"
                onClick={() => handleStatusChange("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("paid")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "paid"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-emerald-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "paid" ? "bg-white" : "bg-emerald-500"}`} />
                <span>Paid</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("pending")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "pending"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-amber-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "pending" ? "bg-white" : "bg-amber-500"}`} />
                <span>Pending</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange("failed")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "failed"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-slate-600 hover:text-rose-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === "failed" ? "bg-white" : "bg-rose-500"}`} />
                <span>Failed</span>
              </button>
            </div>

            {/* Mobile Dropdown for Status */}
            <div className="sm:hidden w-full">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid (Success)</option>
                <option value="pending">Pending (Awaiting)</option>
                <option value="failed">Failed / Canceled</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-600 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Reset Filter"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Invoice ID</th>
                <th className="py-3 px-3.5">Amount</th>
                <th className="py-3 px-3.5">Crypto</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">TXID / Hash</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-600 mb-2" />
                    <p className="text-xs">Loading deposit records...</p>
                  </td>
                </tr>
              ) : deposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mx-auto mb-3">
                      <Clock className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                      {isFiltered ? "No Matching Deposits Found" : "No Deposit Records Yet"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-4">
                      {isFiltered
                        ? "Try adjusting your search keywords or status filter to see other deposit transactions."
                        : "All cryptocurrency top-up invoices and blockchain network confirmations will be recorded here."}
                    </p>
                    {isFiltered ? (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <Link
                        href="/member/payment"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Deposit Now</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                deposits.map((d) => {
                  const isRecentlyUpdated = recentlyUpdatedId === d.order_id;
                  return (
                    <tr
                      key={d.id}
                      className={`transition-colors ${
                        isRecentlyUpdated
                          ? "bg-emerald-50/80 animate-pulse"
                          : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Invoice ID */}
                      <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-700">
                        <Link
                          href={`/member/history/deposit/${d.order_id}`}
                          className="inline-flex items-center gap-1.5 hover:underline"
                          title="View Invoice Details"
                        >
                          {isRecentlyUpdated && (
                            <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-bounce" />
                          )}
                          <span>{d.order_id}</span>
                        </Link>
                      </td>

                      {/* Amount in USD */}
                      <td className="py-2.5 px-3.5 font-mono font-bold text-slate-900 text-xs">
                        ${Number(d.amount).toFixed(2)}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">{d.currency}</span>
                      </td>

                      {/* Crypto Amount & Currency */}
                      <td className="py-2.5 px-3.5 font-mono text-slate-600 text-xs">
                        {d.crypto_amount && Number(d.crypto_amount) > 0 ? (
                          <span>
                            {Number(d.crypto_amount).toFixed(6)}{" "}
                            <span className="text-[10px] font-bold text-emerald-600">
                              {d.crypto_currency || ""}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3.5">{getStatusBadge(d.payment_status, d.order_id)}</td>

                      {/* TXID */}
                      <td className="py-2.5 px-3.5 font-mono text-slate-500 text-xs">
                        {d.txid ? (
                          <span className="truncate max-w-[130px] block" title={d.txid}>
                            {d.txid.slice(0, 8)}...{d.txid.slice(-6)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {new Date(d.create_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Action buttons */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/member/history/deposit/${d.order_id}`}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg font-semibold transition-all text-[11px] shadow-xs ${
                              d.payment_status.toLowerCase() === "pending" || d.payment_status.toLowerCase() === "check"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200"
                            }`}
                            title={
                              d.payment_status.toLowerCase() === "pending" || d.payment_status.toLowerCase() === "check"
                                ? "Pay / QR Invoice"
                                : "View Invoice"
                            }
                          >
                            <Receipt className="w-3 h-3" />
                            <span>
                              {d.payment_status.toLowerCase() === "pending" || d.payment_status.toLowerCase() === "check"
                                ? "Pay"
                                : "Invoice"}
                            </span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - Always Visible */}
        <MemberTablePagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={itemsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onItemsPerPageChange={(l) => setItemsPerPage(l)}
          pageSizeOptions={[10, 20, 50]}
        />
      </div>
    </div>
  );
}
