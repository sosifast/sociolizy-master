"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronUp,
  ChevronDown,
  X,
  Copy,
  Check,
  Code2,
  Terminal,
  Key,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";

interface CardState {
  collapsed: boolean;
  dismissed: boolean;
}

export default function ApiDocumentationPage() {
  const [origin, setOrigin] = useState("https://sociolizy.com");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [orderMode, setOrderMode] = useState<"Default" | "Custom Comments">("Default");

  // State for cards (collapse and dismiss)
  const [cards, setCards] = useState<Record<string, CardState>>({
    overview: { collapsed: false, dismissed: false },
    order: { collapsed: false, dismissed: false },
    status: { collapsed: false, dismissed: false },
    multipleStatus: { collapsed: false, dismissed: false },
    services: { collapsed: false, dismissed: false },
    balance: { collapsed: false, dismissed: false },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const toggleCollapse = (id: string) => {
    setCards((prev) => ({
      ...prev,
      [id]: { ...prev[id], collapsed: !prev[id].collapsed },
    }));
  };

  const dismissCard = (id: string) => {
    setCards((prev) => ({
      ...prev,
      [id]: { ...prev[id], dismissed: true },
    }));
  };

  const resetAllCards = () => {
    setCards({
      overview: { collapsed: false, dismissed: false },
      order: { collapsed: false, dismissed: false },
      status: { collapsed: false, dismissed: false },
      multipleStatus: { collapsed: false, dismissed: false },
      services: { collapsed: false, dismissed: false },
      balance: { collapsed: false, dismissed: false },
    });
  };

  const hasDismissedCards = Object.values(cards).some((c) => c.dismissed);

  const copyToClipboard = (text: string, id: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const apiUrl = `${origin}/api/v1`;

  // JSON responses
  const orderDefaultResponse = `{
  "status": "success",
  "order": 32
}`;

  const orderCustomResponse = `{
  "status": "success",
  "order": 32
}`;

  const statusResponse = `{
  "order": "32",
  "status": "pending",
  "charge": "0.0360",
  "start_count": "0",
  "remains": "0"
}`;

  const multipleStatusResponse = `{
  "1": {
    "charge": "0.2781",
    "start_count": "5572",
    "status": "Completed",
    "remains": "0"
  },
  "10": {
    "error": "Incorrect order ID"
  }
}`;

  const servicesResponse = `[
  {
    "service": "5",
    "name": "Instagram Followers [15K] ",
    "category": "Instagram - Followers [Guaranteed/Refill] - Less Drops ⭐",
    "rate": "1.02",
    "min": "500",
    "max": "10000",
    "type": "default",
    "desc": "usernames",
    "dripfeed": 1
  },
  {
    "service": "9",
    "name": "Instagram Followers - Max 300k - No refill - 30-40k/Day",
    "category": "Instagram - Followers [Guaranteed/Refill] - Less Drops ⭐",
    "rate": "0.04",
    "min": "500",
    "max": "300000",
    "type": "default",
    "desc": "usernames",
    "dripfeed": 1
  }
]`;

  const balanceResponse = `{
  "balance": "100.8429",
  "currency": "USD"
}`;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-500/10 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />

      {/* Topbar Announcement */}
      <Topbar />

      {/* Main Navigation Header */}
      <Navbar currentBadge="API Documentation" />

      {/* Hero Header */}
      <section className="relative z-10 border-b border-slate-800/80 bg-slate-900/30 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Developer REST API v1</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            API Documentation
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Integrate directly with our automated social media marketing infrastructure. Connect your panel, bot, or CRM seamlessly with full support for orders, refills, and balance queries.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>API Status: Online (99.98% Uptime)</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <span>Endpoint:</span>
              <code className="text-indigo-300 font-mono">{apiUrl}</code>
            </div>
          </div>
        </div>
      </section>

      {/* Main Documentation Container */}
      <main className="relative z-10 flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {hasDismissedCards && (
          <div className="mb-6 p-3 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-between text-xs text-indigo-200">
            <span>Some documentation sections are currently hidden.</span>
            <button
              onClick={resetAllCards}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Sections
            </button>
          </div>
        )}

        <div className="space-y-6">
          {/* CARD 1: API Documentation Overview */}
          {!cards.overview.dismissed && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-slate-800 transition-all">
              {/* Card Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  API Documentation
                </h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <button
                    onClick={() => toggleCollapse("overview")}
                    title={cards.overview.collapsed ? "Expand" : "Collapse"}
                    className="hover:text-slate-700 transition p-1"
                  >
                    {cards.overview.collapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => dismissCard("overview")}
                    title="Close"
                    className="hover:text-red-500 transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              {!cards.overview.collapsed && (
                <div className="p-5 sm:p-6">
                  <p className="text-xs sm:text-sm text-slate-700 font-medium mb-4">
                    Note: Please read the API intructions carefully. Its your solo responsability what you add by our API.
                  </p>

                  <div className="overflow-x-auto rounded border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="w-1/3 py-3 px-4 font-normal text-slate-800 bg-[#fbfbfb]">
                            HTTP Method
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            POST
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="w-1/3 py-3 px-4 font-normal text-slate-800 bg-[#fbfbfb]">
                            Response format
                          </td>
                          <td className="py-3 px-4 text-slate-900">
                            Json
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="w-1/3 py-3 px-4 font-normal text-slate-800 bg-[#fbfbfb]">
                            API URL
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-blue-600 hover:underline font-mono text-xs sm:text-sm break-all">
                                {apiUrl}
                              </span>
                              <button
                                onClick={() => copyToClipboard(apiUrl, "api-url")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition shrink-0"
                              >
                                {copiedKey === "api-url" ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="w-1/3 py-3 px-4 font-normal text-slate-800 bg-[#fbfbfb]">
                            API Key
                          </td>
                          <td className="py-3 px-4 text-slate-500 italic">
                            Your personal API Key (Generate or view in Account Settings)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CARD 2: Place new Order */}
          {!cards.order.dismissed && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-slate-800 transition-all">
              {/* Card Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Place new Order
                </h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <button
                    onClick={() => toggleCollapse("order")}
                    title={cards.order.collapsed ? "Expand" : "Collapse"}
                    className="hover:text-slate-700 transition p-1"
                  >
                    {cards.order.collapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => dismissCard("order")}
                    title="Close"
                    className="hover:text-red-500 transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              {!cards.order.collapsed && (
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Mode Selector Dropdown */}
                  <div>
                    <select
                      value={orderMode}
                      onChange={(e) => setOrderMode(e.target.value as "Default" | "Custom Comments")}
                      className="w-full sm:w-80 px-3.5 py-2 text-sm text-slate-800 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Default">Default</option>
                      <option value="Custom Comments">Custom Comments</option>
                    </select>
                  </div>

                  {/* Parameters Table */}
                  <div className="overflow-x-auto rounded border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-slate-200 text-slate-500 font-medium">
                          <th className="py-2.5 px-4 w-1/3">Parameter</th>
                          <th className="py-2.5 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            key
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Your API key
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            action
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-mono">
                            add
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            service
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Service ID
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            link
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Link to page
                          </td>
                        </tr>

                        {orderMode === "Default" ? (
                          <>
                            <tr className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-4 font-mono font-medium text-slate-900">
                                quantity
                              </td>
                              <td className="py-3 px-4 text-slate-700">
                                Needed quantity
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-4 font-mono font-medium text-slate-900">
                                runs (optional)
                              </td>
                              <td className="py-3 px-4 text-slate-700">
                                Runs to deliver
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50/70 transition">
                              <td className="py-3 px-4 font-mono font-medium text-slate-900">
                                interval (optional)
                              </td>
                              <td className="py-3 px-4 text-slate-700">
                                Interval in minutes
                              </td>
                            </tr>
                          </>
                        ) : (
                          <tr className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4 font-mono font-medium text-slate-900">
                              comments
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-mono text-xs">
                              Comments list separated by \r\n or \n
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Example Response */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        Example response:
                      </h3>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            orderMode === "Default" ? orderDefaultResponse : orderCustomResponse,
                            "order-response"
                          )
                        }
                        className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
                      >
                        {copiedKey === "order-response" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="bg-[#202938] text-slate-100 rounded-md p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed border border-slate-700/60 shadow-inner">
                      <code>{orderMode === "Default" ? orderDefaultResponse : orderCustomResponse}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CARD 3: Status Order */}
          {!cards.status.dismissed && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-slate-800 transition-all">
              {/* Card Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Status Order
                </h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <button
                    onClick={() => toggleCollapse("status")}
                    title={cards.status.collapsed ? "Expand" : "Collapse"}
                    className="hover:text-slate-700 transition p-1"
                  >
                    {cards.status.collapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => dismissCard("status")}
                    title="Close"
                    className="hover:text-red-500 transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              {!cards.status.collapsed && (
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Parameters Table */}
                  <div className="overflow-x-auto rounded border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-slate-200 text-slate-500 font-medium">
                          <th className="py-2.5 px-4 w-1/3">Parameter</th>
                          <th className="py-2.5 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            key
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Your API key
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            action
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-mono">
                            status
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            order
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Order ID
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Example Response */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        Example response:
                      </h3>
                      <button
                        onClick={() => copyToClipboard(statusResponse, "status-response")}
                        className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
                      >
                        {copiedKey === "status-response" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="bg-[#202938] text-slate-100 rounded-md p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed border border-slate-700/60 shadow-inner">
                      <code>{statusResponse}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CARD 4: Multiple Status Order */}
          {!cards.multipleStatus.dismissed && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-slate-800 transition-all">
              {/* Card Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Multiple Status Order
                </h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <button
                    onClick={() => toggleCollapse("multipleStatus")}
                    title={cards.multipleStatus.collapsed ? "Expand" : "Collapse"}
                    className="hover:text-slate-700 transition p-1"
                  >
                    {cards.multipleStatus.collapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => dismissCard("multipleStatus")}
                    title="Close"
                    className="hover:text-red-500 transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              {!cards.multipleStatus.collapsed && (
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Parameters Table */}
                  <div className="overflow-x-auto rounded border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-slate-200 text-slate-500 font-medium">
                          <th className="py-2.5 px-4 w-1/3">Parameter</th>
                          <th className="py-2.5 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            key
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Your API key
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            action
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-mono">
                            status
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            orders
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Order IDs separated by comma (e.g. 1,2,3)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Example Response */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        Example response:
                      </h3>
                      <button
                        onClick={() => copyToClipboard(multipleStatusResponse, "mult-status-response")}
                        className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
                      >
                        {copiedKey === "mult-status-response" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="bg-[#202938] text-slate-100 rounded-md p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed border border-slate-700/60 shadow-inner">
                      <code>{multipleStatusResponse}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CARD 5: Services Lists */}
          {!cards.services.dismissed && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-slate-800 transition-all">
              {/* Card Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Services Lists
                </h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <button
                    onClick={() => toggleCollapse("services")}
                    title={cards.services.collapsed ? "Expand" : "Collapse"}
                    className="hover:text-slate-700 transition p-1"
                  >
                    {cards.services.collapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => dismissCard("services")}
                    title="Close"
                    className="hover:text-red-500 transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              {!cards.services.collapsed && (
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Parameters Table */}
                  <div className="overflow-x-auto rounded border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-slate-200 text-slate-500 font-medium">
                          <th className="py-2.5 px-4 w-1/3">Parameter</th>
                          <th className="py-2.5 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            key
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Your API key
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            action
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-mono">
                            services
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Example Response */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        Example response:
                      </h3>
                      <button
                        onClick={() => copyToClipboard(servicesResponse, "services-response")}
                        className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
                      >
                        {copiedKey === "services-response" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="bg-[#202938] text-slate-100 rounded-md p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed border border-slate-700/60 shadow-inner max-h-[380px]">
                      <code>{servicesResponse}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CARD 6: User Balance */}
          {!cards.balance.dismissed && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden text-slate-800 transition-all">
              {/* Card Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 bg-white">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  User Balance
                </h2>
                <div className="flex items-center gap-3 text-slate-400">
                  <button
                    onClick={() => toggleCollapse("balance")}
                    title={cards.balance.collapsed ? "Expand" : "Collapse"}
                    className="hover:text-slate-700 transition p-1"
                  >
                    {cards.balance.collapsed ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => dismissCard("balance")}
                    title="Close"
                    className="hover:text-red-500 transition p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              {!cards.balance.collapsed && (
                <div className="p-5 sm:p-6 space-y-5">
                  {/* Parameters Table */}
                  <div className="overflow-x-auto rounded border border-slate-200">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-[#fcfcfc] border-b border-slate-200 text-slate-500 font-medium">
                          <th className="py-2.5 px-4 w-1/3">Parameter</th>
                          <th className="py-2.5 px-4">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            key
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            Your API key
                          </td>
                        </tr>
                        <tr className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">
                            action
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-mono">
                            balance
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Example Response */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        Example response:
                      </h3>
                      <button
                        onClick={() => copyToClipboard(balanceResponse, "balance-response")}
                        className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-medium"
                      >
                        {copiedKey === "balance-response" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="bg-[#202938] text-slate-100 rounded-md p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed border border-slate-700/60 shadow-inner">
                      <code>{balanceResponse}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

