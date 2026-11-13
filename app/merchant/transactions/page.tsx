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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete record of customer invoices and incoming cryptocurrency payments.
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs font-medium"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="spectrum-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order ID, Invoice, TxID..."
            className="spectrum-input w-full bg-white pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400"
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
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {s === "ALL" ? "All Statuses" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="spectrum-card overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <span className="text-xs font-medium text-slate-500">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-xs text-rose-600">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No transactions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const isPaid = tx.paymentStatus === "PAID";
                  const isPending = tx.paymentStatus === "PENDING";
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>#{tx.orderId}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {tx.uuid.substring(0, 13)}...
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{tx.merchant?.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {tx.website?.domain || "-"}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                        ${Number(tx.amountUsd).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        +${Number(tx.netAmountUsd).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4">
                        {tx.cryptoAmount ? (
                          <div className="font-mono text-xs">
                            <span className="text-slate-900 font-semibold">{tx.cryptoAmount}</span>{" "}
                            <span className="text-emerald-600 font-semibold">{tx.cryptoCurrency}</span>{" "}
                            <span className="text-[10px] text-slate-400 uppercase">
                              ({tx.cryptoNetwork})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {tx.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString("en-US", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailTx(tx)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                            title="Invoice Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/pay/${tx.uuid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
            <span>
              Total {totalCount} transactions (Page {page} of {totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs font-medium cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Invoice #{detailTx.orderId}
                </h3>
                <span className="text-[11px] font-mono text-slate-400">{detailTx.uuid}</span>
              </div>
              <button
                type="button"
                onClick={() => setDetailTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Amounts summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Invoice (USD):</span>
                  <span className="font-bold text-slate-900">${Number(detailTx.amountUsd).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Processing Fee:</span>
                  <span className="text-rose-600 font-semibold">-${Number(detailTx.adminFee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="text-slate-700 font-semibold">Net Credited to Merchant:</span>
                  <span className="font-bold text-emerald-600">
                    ${Number(detailTx.netAmountUsd).toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Crypto info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Coin & Network:</span>
                  <span className="text-slate-900 font-semibold">
                    {detailTx.cryptoCurrency || "-"} ({detailTx.cryptoNetwork?.toUpperCase() || "-"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Crypto Amount:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    {detailTx.cryptoAmount || "-"} {detailTx.cryptoCurrency}
                  </span>
                </div>
                {detailTx.payAddress && (
                  <div>
                    <span className="text-slate-500 block mb-1">Direct Payment Address:</span>
                    <div className="flex items-center justify-between bg-white border border-slate-200/90 p-2.5 rounded-lg gap-2 shadow-2xs">
                      <span className="font-mono text-[11px] text-slate-800 break-all select-all font-medium">
                        {detailTx.payAddress}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(detailTx.payAddress, "detail_addr")}
                        className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                      >
                        {copiedKey === "detail_addr" ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                {detailTx.txid && (
                  <div>
                    <span className="text-slate-500 block mb-1">Blockchain TxID:</span>
                    <span className="font-mono text-[11px] text-slate-800 break-all select-all bg-white border border-slate-200/90 p-2.5 rounded-lg block font-medium shadow-2xs">
                      {detailTx.txid}
                    </span>
                  </div>
                )}
              </div>

              {/* Direct Checkout Link (Requirement A.7) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <span className="text-slate-700 font-semibold block mb-1.5">
                  Direct Checkout URL:
                </span>
                <div className="flex items-center justify-between bg-white border border-slate-200/90 p-2.5 rounded-lg gap-2 shadow-2xs">
                  <span className="font-mono text-[11px] text-emerald-700 truncate font-medium">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/pay/${detailTx.uuid}`
                      : `/pay/${detailTx.uuid}`}
                  </span>
                  <a
                    href={`/pay/${detailTx.uuid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Webhook Status */}
              <div className="flex justify-between items-center text-slate-600 pt-1">
                <span>Webhook Delivery to Website:</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                    detailTx.merchantWebhookStatus === "SENT"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {detailTx.merchantWebhookStatus || "PENDING"} ({detailTx.merchantWebhookAttempts}x)
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setDetailTx(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
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
