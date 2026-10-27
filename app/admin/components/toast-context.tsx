"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    setFlash: (title: string, message?: string, type?: ToastType) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const FLASH_STORAGE_KEY = "master_smm_admin_flash_toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = { id, title, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const setFlash = useCallback(
    (title: string, message?: string, type: ToastType = "success") => {
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            FLASH_STORAGE_KEY,
            JSON.stringify({ title, message, type, timestamp: Date.now() })
          );
        } catch {
          // Ignore storage quota errors
        }
      }
    },
    []
  );

  // Check for any flash toasts on mount or page load
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = sessionStorage.getItem(FLASH_STORAGE_KEY);
      if (stored) {
        sessionStorage.removeItem(FLASH_STORAGE_KEY);
        const parsed = JSON.parse(stored);
        if (Date.now() - (parsed.timestamp || 0) < 10000) {
          showToast(parsed.title, parsed.message, parsed.type || "success");
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, [showToast]);

  const toastHelpers = {
    success: (title: string, message?: string) => showToast(title, message, "success"),
    error: (title: string, message?: string) => showToast(title, message, "error"),
    warning: (title: string, message?: string) => showToast(title, message, "warning"),
    info: (title: string, message?: string) => showToast(title, message, "info"),
    setFlash,
  };

  return (
    <ToastContext.Provider value={{ showToast, toast: toastHelpers, removeToast }}>
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-4 fade-in ${
              item.type === "success"
                ? "bg-white/95 border-emerald-200 text-slate-800 shadow-emerald-500/10"
                : item.type === "error"
                ? "bg-white/95 border-rose-200 text-slate-800 shadow-rose-500/10"
                : item.type === "warning"
                ? "bg-white/95 border-amber-200 text-slate-800 shadow-amber-500/10"
                : "bg-white/95 border-blue-200 text-slate-800 shadow-blue-500/10"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {item.type === "success" && (
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
              {item.type === "error" && (
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              {item.type === "warning" && (
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              {item.type === "info" && (
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold text-slate-900 leading-tight">
                {item.title}
              </h4>
              {item.message && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words">
                  {item.message}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(item.id)}
              className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
