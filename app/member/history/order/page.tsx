"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Search,
  RefreshCw,
  Loader2,
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

    const handleStatusUpdate = (e: any) => {
      const data = e.detail;
      if (!data?.invoice) return;
      setOrders((prev) =>
        prev.map((o) =>
          o.invoice === data.invoice ? { ...o, status: data.status } : o
        )
      );
    };

    const handleNewOrder = () => {
      fetchOrders();
    };

    window.addEventListener("master_smm:order_status_updated", handleStatusUpdate);
    window.addEventListener("master_smm:order_created", handleNewOrder);

    return () => {
      window.removeEventListener("master_smm:order_status_updated", handleStatusUpdate);
      window.removeEventListener("master_smm:order_created", handleNewOrder);
    };
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Orders History &amp; Logs
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Order History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
            Complete records of your social media service orders synchronized across multi-server clusters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/member/order"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Order</span>
          </Link>
          <Link
            href="/member/history/deposit"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <span>Deposit History</span>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center gap-3 justify-between shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Invoice, ID, or Target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
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
              className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs">Loading order records...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-14 text-center text-slate-400 text-xs sm:text-sm">
              No orders found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-700 font-bold bg-slate-50">
                    <th className="py-2.5 px-3">Invoice</th>
                    <th className="py-2.5 px-3">Node</th>
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Target</th>
                    <th className="py-2.5 px-3 text-right">Quantity</th>
                    <th className="py-2.5 px-3 text-right">Price ($)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                        {ord.invoice}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono border border-slate-200">
                          {ord.server_area || "SG"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-xs">
                        {ord.order_id || "-"}
                      </td>
                      <td className="py-2.5 px-3 max-w-[220px] truncate text-slate-800" title={ord.target}>
                        {ord.target}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900 font-semibold">
                        {ord.amount.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-600 font-semibold">
                        ${Number(ord.price_sale).toFixed(4)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ord.status === "Processing" || ord.status === "In progress"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : ord.status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ord.status === "Partial"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : ord.status === "Canceled" || ord.status === "Error"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap text-[11px]">
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
