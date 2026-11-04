import React from "react";
import Link from "next/link";
import { Home } from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 selection:bg-emerald-500 selection:text-white">
      <Topbar />
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full text-center relative z-10 space-y-6">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            404 Error
          </span>

          {/* 404 Number */}
          <h1 className="text-8xl sm:text-9xl font-black tracking-tight text-slate-900 font-mono select-none">
            404
          </h1>

          {/* Clean Message */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Page not found
            </h2>
            <p className="text-sm text-slate-500">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>

          {/* Single Simple Action */}
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
