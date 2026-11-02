"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  ShoppingCart,
  MessageSquare,
  Wallet,
  CheckCircle2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export interface MemberNotifItem {
  id: string;
  type: "order" | "order_status" | "deposit" | "deposit_status" | "ticket";
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  isRead: boolean;
}

const STORAGE_KEY = "master_smm_member_notifications_v1";

export default function MemberNotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<MemberNotifItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        setNotifications([
          {
            id: "welcome-1",
            type: "ticket",
            title: "Welcome to Member Portal",
            message: "All order updates, cryptocurrency deposits, and support tickets will notify you here in real-time.",
            timestamp: new Date().toISOString(),
            isRead: true,
          },
        ]);
      }
    } catch {}
  }, []);

  const saveNotifs = (list: MemberNotifItem[]) => {
    setNotifications(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
    } catch {}
  };

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen to browser events dispatched by MemberRealtimeProvider
  useEffect(() => {
    const handleOrderCreated = (e: any) => {
      const data = e.detail;
      const item: MemberNotifItem = {
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "order",
        title: "Order Placed",
        message: `Invoice ${data.invoice} created (${data.service_name || "Service"}) - $${Number(data.price_sale || 0).toFixed(2)}`,
        link: "/member/history/order",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, 30);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    const handleOrderStatus = (e: any) => {
      const data = e.detail;
      const isSuccess = data.status === "Completed";
      const item: MemberNotifItem = {
        id: `os-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "order_status",
        title: `Order Status: ${data.status}`,
        message: `Invoice ${data.invoice} is now ${data.status}${
          data.refunded ? ` (Refunded $${Number(data.refund_amount || 0).toFixed(2)})` : ""
        }`,
        link: "/member/history/order",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, 30);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    const handleDepositCreated = (e: any) => {
      const data = e.detail;
      const item: MemberNotifItem = {
        id: `dep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "deposit",
        title: "Deposit Invoice Created",
        message: `Invoice ${data.order_id} ($${Number(data.amount || 0).toFixed(2)}) ready for payment.`,
        link: "/member/history/deposit",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, 30);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    const handleDepositStatus = (e: any) => {
      const data = e.detail;
      const isPaid = data.status === "paid" || data.status === "paid_over";
      const item: MemberNotifItem = {
        id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "deposit_status",
        title: isPaid ? "Deposit Confirmed (Paid)" : `Deposit Status: ${data.status}`,
        message: isPaid
          ? `Your payment of $${Number(data.amount || 0).toFixed(2)} for ${data.order_id} was confirmed and credited to your balance!`
          : `Invoice ${data.order_id} status is now ${data.status}.`,
        link: "/member/history/deposit",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, 30);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    const handleTicket = (e: any) => {
      const data = e.detail;
      const item: MemberNotifItem = {
        id: `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "ticket",
        title: "Support Ticket Response",
        message: `You have an update from our support team on ticket ${data.ticket_id || ""}`,
        link: data.ticket_id ? `/member/ticket/${data.ticket_id}` : "/member/ticket",
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => {
        const next = [item, ...prev].slice(0, 30);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    window.addEventListener("master_smm:order_created", handleOrderCreated);
    window.addEventListener("master_smm:order_status_updated", handleOrderStatus);
    window.addEventListener("master_smm:deposit_created", handleDepositCreated);
    window.addEventListener("master_smm:deposit_status_updated", handleDepositStatus);
    window.addEventListener("master_smm:ticket_updated", handleTicket);

    return () => {
      window.removeEventListener("master_smm:order_created", handleOrderCreated);
      window.removeEventListener("master_smm:order_status_updated", handleOrderStatus);
      window.removeEventListener("master_smm:deposit_created", handleDepositCreated);
      window.removeEventListener("master_smm:deposit_status_updated", handleDepositStatus);
      window.removeEventListener("master_smm:ticket_updated", handleTicket);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    saveNotifs(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    saveNotifs([]);
  };

  const getIcon = (type: MemberNotifItem["type"]) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="w-4 h-4 text-indigo-400" />;
      case "order_status":
        return <CheckCircle2 className="w-4 h-4 text-sky-400" />;
      case "deposit":
      case "deposit_status":
        return <Wallet className="w-4 h-4 text-emerald-400" />;
      case "ticket":
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        aria-label="Real-time Notifications"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs animate-pulse ring-2 ring-[#0c1222]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0c1222] border border-slate-800 shadow-2xl p-4 text-xs z-50 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-600/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  title="Clear all"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto py-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-slate-600" />
                <p className="text-xs font-semibold text-slate-300">No notifications</p>
                <p className="text-[11px] text-slate-500">Order, deposit and ticket updates will appear here.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border transition-all ${
                    !n.isRead
                      ? "bg-indigo-950/25 border-indigo-500/30"
                      : "bg-[#070b14]/70 border-slate-800/80 hover:bg-slate-850"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-xs truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed break-words">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => {
                            setIsOpen(false);
                            saveNotifs(
                              notifications.map((item) =>
                                item.id === n.id ? { ...item, isRead: true } : item
                              )
                            );
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 mt-1.5 hover:underline"
                        >
                          <span>View Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

