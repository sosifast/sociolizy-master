"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Search,
  RefreshCw,
  Loader2,
  ExternalLink,
  PlusCircle,
} from "lucide-react";

interface OrderHistoryItem {
  id: number;
  invoice: string;
  order_id: string | null;
  service_id: string;
  amount: number;
  price_sale: string | number;
  target: string;
  status: string;
  server_area?: string;
  create_at: string;
}

export default function MemberOrderHistoryPage() {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/member/order?limit=100");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);
      }
    } catch (err) {
      console.error("Failed to load order history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.invoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.order_id && ord.order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ord.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.service_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      ord.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Order History
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-indigo-400" />
            <span>Order History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete list of your social media service orders synchronized across server clusters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/member/order"
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Order</span>
          </Link>
          <Link
            href="/member/history/deposit"
            className="px-4 py-2 rounded-2xl bg-[#0c1222] border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <span>Deposit History</span>
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search Invoice, ID, or Target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="partial">Partial</option>
              <option value="canceled">Canceled</option>
              <option value="error">Error</option>
            </select>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-6 shadow-xl">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Loading order history...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No orders found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-900/40">
                    <th className="py-3 px-3">Invoice</th>
                    <th className="py-3 px-3">Node</th>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Target</th>
                    <th className="py-3 px-3 text-right">Quantity</th>
                    <th className="py-3 px-3 text-right">Price ($)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-medium text-indigo-400">
                        {ord.invoice}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300 font-mono border border-slate-700">
                          {ord.server_area || "SG"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {ord.order_id || "-"}
                      </td>
                      <td className="py-3 px-3 max-w-[240px] truncate text-slate-300" title={ord.target}>
                        {ord.target}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-white">
                        {ord.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 font-medium">
                        ${Number(ord.price_sale).toFixed(4)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            ord.status === "Processing" || ord.status === "In progress"
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : ord.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : ord.status === "Partial"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : ord.status === "Canceled" || ord.status === "Error"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/30"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-400 whitespace-nowrap">
                        {new Date(ord.create_at).toLocaleDateString("en-US", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
