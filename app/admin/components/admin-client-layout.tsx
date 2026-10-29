"use client";

import React, { useState } from "react";
import AdminSidebar from "../layouts/sidebar";
import AdminHeader from "../layouts/header";
import AdminFooter from "../layouts/footer";
import { ToastProvider } from "./toast-context";
import { UserSession } from "@/lib/auth";

export default function AdminClientLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: UserSession;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-white text-slate-900 antialiased font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
        {/* Sidebar Component */}
        <React.Suspense
          fallback={
            <aside className="fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-100 hidden lg:block" />
          }
        >
          <AdminSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </React.Suspense>

        {/* Main Content Area (Offset by sidebar width on large screens) */}
        <div className="lg:pl-72 flex flex-col min-h-screen bg-white transition-all duration-300">
          {/* Header Component */}
          <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* Dynamic Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-white">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
                  <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Memuat halaman admin...</span>
                </div>
              }
            >
              {children}
            </React.Suspense>
          </main>

          {/* Footer Component */}
          <AdminFooter />
        </div>
      </div>
    </ToastProvider>
  );
}
