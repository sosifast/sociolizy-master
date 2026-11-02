"use client";

import React, { useState, useEffect, createContext, useContext, useCallback } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  ShoppingCart,
  MessageSquare,
  X,
  Sparkles,
} from "lucide-react";

interface MemberToast {
  id: string;
  type: "success" | "info" | "warning";
  title: string;
  message: string;
  icon?: React.ReactNode;
}

interface MemberRealtimeContextType {
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  showMemberToast: (title: string, message: string, type?: MemberToast["type"]) => void;
}

const MemberRealtimeContext = createContext<MemberRealtimeContextType | undefined>(undefined);

export function useMemberRealtime() {
  const ctx = useContext(MemberRealtimeContext);
  if (!ctx) {
    return {
      balance: 0,
      setBalance: () => {},
      showMemberToast: () => {},
    };
  }
  return ctx;
}

export default function MemberRealtimeProvider({
  userUuid,
  initialBalance,
  children,
}: {
  userUuid: string;
  initialBalance: number;
  children: React.ReactNode;
}) {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [toasts, setToasts] = useState<MemberToast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showMemberToast = useCallback(
    (title: string, message: string, type: MemberToast["type"] = "info") => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  // Sync balance across the UI
  useEffect(() => {
    setBalance(initialBalance);
  }, [initialBalance]);

  // Update elements that display balance
  useEffect(() => {
    const formatted = `$${Number(balance || 0).toFixed(2)}`;
    document.querySelectorAll("[data-member-balance]").forEach((el) => {
      el.textContent = formatted;
    });
  }, [balance]);

  // Pusher Realtime Subscription
  useEffect(() => {
    if (!userUuid) return;

    let channel: any = null;

    try {
      const pusher = getPusherClient();
      channel = pusher.subscribe(`member-${userUuid}`);

      // 1. Order Created
      channel.bind("order-created", (data: any) => {
        showMemberToast(
          "Order Placed",
          `Invoice ${data.invoice} created (${data.service_name || "Service"}) - $${Number(data.price_sale || 0).toFixed(2)}`,
          "success"
        );
        if (data.balance !== undefined) {
          setBalance(Number(data.balance));
        }
        window.dispatchEvent(new CustomEvent("master_smm:order_created", { detail: data }));
      });

      // 2. Order Status Updated (Pending -> In Progress -> Completed, etc.)
      channel.bind("order-status-updated", (data: any) => {
        const isSuccess = data.status === "Completed";
        showMemberToast(
          `Order ${data.status}`,
          `Invoice ${data.invoice} is now ${data.status}${
            data.refunded ? ` (Refunded $${Number(data.refund_amount || 0).toFixed(2)})` : ""
          }`,
          isSuccess ? "success" : "info"
        );
        window.dispatchEvent(new CustomEvent("master_smm:order_status_updated", { detail: data }));
      });

      // 3. Deposit Created
      channel.bind("deposit-created", (data: any) => {
        showMemberToast(
          "Deposit Invoice Ready",
          `Invoice ${data.order_id} ($${Number(data.amount || 0).toFixed(2)}) created. Please complete payment.`,
          "info"
        );
        window.dispatchEvent(new CustomEvent("master_smm:deposit_created", { detail: data }));
      });

      // 4. Deposit Status Updated (Pending -> Paid)
      channel.bind("deposit-status-updated", (data: any) => {
        const isPaid = data.status === "paid" || data.status === "paid_over";
        if (isPaid) {
          showMemberToast(
            "Deposit Successful!",
            `Your payment of $${Number(data.amount || 0).toFixed(2)} for ${data.order_id} was confirmed and added to your balance!`,
            "success"
          );
        } else {
          showMemberToast(
            "Deposit Update",
            `Invoice ${data.order_id} status changed to ${data.status}.`,
            "info"
          );
        }
        window.dispatchEvent(new CustomEvent("master_smm:deposit_status_updated", { detail: data }));
      });

      // 5. Balance Updated
      channel.bind("balance-updated", (data: any) => {
        if (data.balance !== undefined) {
          setBalance(Number(data.balance));
        } else if (data.refund_amount) {
          setBalance((prev) => prev + Number(data.refund_amount));
        }
      });

      // 6. Ticket Replied / Updated
      channel.bind("ticket-updated", (data: any) => {
        showMemberToast(
          "Support Ticket Update",
          `You have a new update on ticket ${data.ticket_id || ""}`,
          "info"
        );
        window.dispatchEvent(new CustomEvent("master_smm:ticket_updated", { detail: data }));
      });
    } catch (err) {
      console.warn("[Pusher] MemberRealtimeProvider subscription error:", err);
    }

    return () => {
      if (channel) {
        channel.unbind_all();
        try {
          const pusher = getPusherClient();
          pusher.unsubscribe(`member-${userUuid}`);
        } catch {}
      }
    };
  }, [userUuid, showMemberToast]);

  return (
    <MemberRealtimeContext.Provider value={{ balance, setBalance, showMemberToast }}>
      {children}

      {/* Floating Notification Stack (Bottom-Right) */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-3 duration-200 transition-all ${
              t.type === "success"
                ? "bg-[#0c1a24]/95 border-emerald-500/40 text-emerald-200"
                : "bg-[#0e162b]/95 border-indigo-500/40 text-indigo-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                    t.type === "success"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-indigo-500/20 text-indigo-400"
                  }`}
                >
                  {t.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{t.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">{t.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </MemberRealtimeContext.Provider>
  );
}

