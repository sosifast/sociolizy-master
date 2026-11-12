"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
} from "lucide-react";
import Link from "next/link";

export default function MerchantTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Detail Modal
  const [detailTx, setDetailTx] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        status,
        search,
      });

      const res = await fetch(`/api/merchant/transactions?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load transactions");
      }

      setTransactions(json.data);
      setTotalPages(json.pagination.totalPages || 1);
      setTotalCount(json.pagination.total || 0);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete record of customer invoices and incoming cryptocurrency payments.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="self-start sm:self-auto p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Invoice, TxID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {["ALL", "PAID", "PENDING", "EXPIRED", "FAILED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                status === s
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {s === "ALL" ? "All Statuses" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mb-2" />
            <span className="text-xs">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-rose-300">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invoice / Order ID</th>
                  <th className="py-3 px-4">Store & Website</th>
                  <th className="py-3 px-4 text-right">Invoice (USD)</th>
                  <th className="py-3 px-4 text-right">Merchant Net</th>
                  <th className="py-3 px-4">Crypto Payment</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {transactions.map((tx) => {
                  const isPaid = tx.paymentStatus === "PAID";
                  const isPending = tx.paymentStatus === "PENDING";
                  return (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>#{tx.orderId}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">
                          {tx.uuid.substring(0, 13)}...
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{tx.merchant?.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tx.website?.domain || "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-200">
                        ${Number(tx.amountUsd).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                        +${Number(tx.netAmountUsd).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {tx.cryptoAmount ? (
                          <div className="font-mono text-xs">
                            <span className="text-white font-medium">{tx.cryptoAmount}</span>{" "}
                            <span className="text-emerald-400">{tx.cryptoCurrency}</span>{" "}
                            <span className="text-[10px] text-slate-500 uppercase">
                              ({tx.cryptoNetwork})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : isPending
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {tx.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailTx(tx)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Invoice Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/pay/${tx.uuid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg"
                            title="Open Direct Checkout"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Total {totalCount} transactions (Page {page} of {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Invoice #{detailTx.orderId}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">{detailTx.uuid}</span>
              </div>
              <button
                type="button"
                onClick={() => setDetailTx(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Amounts summary */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Invoice (USD):</span>
                  <span className="font-bold text-white">${Number(detailTx.amountUsd).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gateway Processing Fee:</span>
                  <span className="text-rose-400">-${Number(detailTx.adminFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm">
                  <span className="text-slate-300 font-semibold">Net Credited to Merchant:</span>
                  <span className="font-bold text-emerald-400">
                    ${Number(detailTx.netAmountUsd).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Crypto info */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Coin & Network:</span>
                  <span className="text-white font-medium">
                    {detailTx.cryptoCurrency || "-"} ({detailTx.cryptoNetwork?.toUpperCase() || "-"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Crypto Amount:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {detailTx.cryptoAmount || "-"} {detailTx.cryptoCurrency}
                  </span>
                </div>
                {detailTx.payAddress && (
                  <div>
                    <span className="text-slate-400 block mb-1">Direct Payment Address:</span>
                    <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg gap-2">
                      <span className="font-mono text-[11px] text-slate-200 break-all select-all">
                        {detailTx.payAddress}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(detailTx.payAddress, "detail_addr")}
                        className="p-1 text-slate-400 hover:text-white"
                      >
                        {copiedKey === "detail_addr" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {detailTx.txid && (
                  <div>
                    <span className="text-slate-400 block mb-1">Blockchain TxID:</span>
                    <span className="font-mono text-[11px] text-slate-300 break-all select-all bg-slate-900 p-2 rounded-lg block">
                      {detailTx.txid}
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Checkout Link (Requirement A.7) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-slate-400 font-semibold block mb-1.5">
                  Direct Checkout URL:
                </span>
                <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg gap-2">
                  <span className="font-mono text-[11px] text-emerald-400 truncate">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/pay/${detailTx.uuid}`
                      : `/pay/${detailTx.uuid}`}
                  </span>
                  <a
                    href={`/pay/${detailTx.uuid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Webhook Status */}
              <div className="flex justify-between items-center text-slate-400">
                <span>Webhook Delivery to Website:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    detailTx.merchantWebhookStatus === "SENT"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {detailTx.merchantWebhookStatus || "PENDING"} ({detailTx.merchantWebhookAttempts}x)
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setDetailTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
