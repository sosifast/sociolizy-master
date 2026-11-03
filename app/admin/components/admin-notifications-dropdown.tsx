"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Trash2,
  UserPlus,
  ShoppingCart,
  MessageSquare,
  Wallet,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export interface AdminNotifItem {
  id: string;
  type: "register" | "ticket" | "order" | "deposit" | "order_status" | "deposit_status";
  title: string;
  message: string;
  link?: string;
  timestamp: string;
  isRead: boolean;
}

const STORAGE_KEY = "master_smm_admin_notifications_v1";

export default function AdminNotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotifItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        // Initial sample welcoming notification
        setNotifications([
          {
            id: "init-1",
            type: "ticket",
            title: "Sistem Siap",
            message: "Notifikasi realtime via Pusher aktif untuk seluruh klaster database.",
            timestamp: new Date().toISOString(),
            isRead: true,
          },
        ]);
      }
    } catch {}
  }, []);

  // Save to localStorage when notifications change
  const saveNotifs = (list: AdminNotifItem[]) => {
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

  // Listen to realtime events from AdminRealtimeNotifier
  useEffect(() => {
    const handleRegister = (e: any) => {
      const data = e.detail;
      const item: AdminNotifItem = {
        id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "register",
        title: "User Baru Terdaftar",
        message: `@${data.username} (${data.server_area || "SG"}) baru saja mendaftar.`,
        link: "/admin/user",
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
      const item: AdminNotifItem = {
        id: `tkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "ticket",
        title: "Tiket Bantuan Masuk",
        message: `Tiket ${data.ticket_id} dari @${data.username}: "${data.subject || "Pesan Baru"}"`,
        link: data.ticket_id ? `/admin/ticket/${data.ticket_id}` : "/admin/ticket",
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

    const handleOrder = (e: any) => {
      const data = e.detail;
      const item: AdminNotifItem = {
        id: `ord-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "order",
        title: "Pesanan Baru Masuk",
        message: `@${data.username} memesan ${data.service_name || "Layanan"} ($${Number(data.price_sale || 0).toFixed(2)}) - ${data.invoice}`,
        link: "/admin/history-order",
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
      const item: AdminNotifItem = {
        id: `os-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "order_status",
        title: "Status Pesanan Update",
        message: `Invoice ${data.invoice} statusnya diperbarui ke "${data.status}".`,
        link: "/admin/history-order",
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

    const handleDeposit = (e: any) => {
      const data = e.detail;
      const item: AdminNotifItem = {
        id: `dep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "deposit",
        title: "Invoice Deposit Baru",
        message: `@${data.username} membuat invoice deposit Cryptomus $${Number(data.amount || 0).toFixed(2)} (${data.status})`,
        link: "/admin/cryptomus/history",
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
      const item: AdminNotifItem = {
        id: `ds-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: "deposit_status",
        title: isPaid ? "Deposit Lunas (Paid)" : "Status Deposit Update",
        message: `Invoice ${data.order_id} sebesar $${Number(data.amount || 0).toFixed(2)} status: ${data.status}`,
        link: "/admin/cryptomus/history",
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

    window.addEventListener("master_smm:user_registered", handleRegister);
    window.addEventListener("master_smm:admin_ticket_updated", handleTicket);
    window.addEventListener("master_smm:admin_order_created", handleOrder);
    window.addEventListener("master_smm:admin_order_updated", handleOrderStatus);
    window.addEventListener("master_smm:admin_deposit_created", handleDeposit);
    window.addEventListener("master_smm:admin_deposit_updated", handleDepositStatus);

    return () => {
      window.removeEventListener("master_smm:user_registered", handleRegister);
      window.removeEventListener("master_smm:admin_ticket_updated", handleTicket);
      window.removeEventListener("master_smm:admin_order_created", handleOrder);
      window.removeEventListener("master_smm:admin_order_updated", handleOrderStatus);
      window.removeEventListener("master_smm:admin_deposit_created", handleDeposit);
      window.removeEventListener("master_smm:admin_deposit_updated", handleDepositStatus);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    saveNotifs(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    saveNotifs([]);
  };

  const getIcon = (type: AdminNotifItem["type"]) => {
    switch (type) {
      case "register":
        return <UserPlus className="w-4 h-4 text-emerald-600" />;
      case "order":
        return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case "order_status":
        return <CheckCircle2 className="w-4 h-4 text-sky-600" />;
      case "ticket":
        return <MessageSquare className="w-4 h-4 text-amber-600" />;
      case "deposit":
      case "deposit_status":
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
        aria-label="Notifikasi Realtime Admin"
        title="Notifikasi Realtime"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center shadow-xs animate-pulse ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-2xl p-4 text-xs z-50 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Notifikasi Realtime</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                  {unreadCount} baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Tandai semua dibaca"
                  className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Bersihkan semua"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto py-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">Tidak ada notifikasi</p>
                <p className="text-[11px] text-slate-400">Pemberitahuan aktivitas akan tampil di sini.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border transition-all ${
                    !n.isRead
                      ? "bg-emerald-50/40 border-emerald-100/80"
                      : "bg-slate-50/70 border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-2 rounded-lg bg-white border border-slate-100 shadow-xs shrink-0 mt-0.5">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-slate-900 text-xs truncate">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed break-words">
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
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 mt-1.5 hover:underline"
                        >
                          <span>Buka Detail</span>
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

