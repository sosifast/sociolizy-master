import React from "react";
import Link from "next/link";
import {
  Zap,
  Server,
  Lock,
} from "lucide-react";

export default function MemberFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050811] border-t border-slate-800/80 text-slate-400 text-xs mt-auto">
      {/* Upper Footer: Multi-column links & info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs shadow-indigo-600/30">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                MASTER<span className="text-indigo-400">SMM</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated Social Media Marketing (SMM) platform powered by distributed multi-server infrastructure. Fast, stable, and trusted 24/7 service.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Multi-Server Online</span>
              </span>
            </div>
          </div>

          {/* Col 2: Member Menu */}
          <div className="space-y-2.5">
            <p className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Member Area
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/member"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/member/order"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>New Order</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/member/payment"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Deposit Funds</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/member/history/order"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Order History</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/member/history/deposit"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Deposit History</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Information */}
          <div className="space-y-2.5">
            <p className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Information &amp; Legal
            </p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/page/service"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Services Catalog</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/page/about-us"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>About Master SMM</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/page/policy"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Terms of Service</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/page/privacy"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/page/contact-us"
                  className="hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Contact &amp; Support</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Security & Engine */}
          <div className="space-y-3">
            <p className="font-bold text-slate-200 text-xs uppercase tracking-wider">
              Security &amp; Network
            </p>
            <div className="p-3.5 rounded-2xl bg-[#0c1222] border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>256-Bit SSL Encryption</span>
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                All account sessions and payment transactions are secured with enterprise-grade encryption.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#0c1222] border border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                <span>Engine Status:</span>
              </span>
              <span className="font-bold text-emerald-400">Active &amp; Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 bg-[#070b14]/90 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>© {currentYear}</span>
            <span className="font-bold text-slate-200">
              Master<span className="text-indigo-400">SMM</span>
            </span>
            <span>• All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-[10px]">
            <span>Member Console v2.0</span>
            <span>•</span>
            <span>Ultra Fast Engine</span>
            <span>•</span>
            <Link href="/member" className="text-indigo-400 hover:underline">
              Member Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
