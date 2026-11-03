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
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs mt-auto">
      {/* Upper Footer: Multi-column links & info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                sociolizy
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              Automated Social Media Marketing (SMM) platform powered by distributed multi-server infrastructure. Fast, stable, and trusted 24/7 service.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Multi-Server Online</span>
              </span>
            </div>
          </div>

          {/* Col 2: Information & Legal */}
          <div className="space-y-2.5">
            <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Information &amp; Legal
            </p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/page/about-us"
                  className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>About Us</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/page/contact-us"
                  className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>Contact &amp; Support</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/page/privacy"
                  className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/page/policy"
                  className="hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
                >
                  <span>Terms &amp; Policy</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Security & Network */}
          <div className="space-y-3">
            <p className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Security &amp; Network
            </p>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>256-Bit SSL Encryption</span>
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                All account sessions and payment transactions are secured with enterprise-grade encryption.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between text-[11px]">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-600" />
                <span>Engine Status:</span>
              </span>
              <span className="font-bold text-emerald-600">Active &amp; Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>© {currentYear}</span>
            <span className="font-bold text-slate-800">
              sociolizy
            </span>
            <span>• All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[10px]">
            <span>Member Console v2.0</span>
            <span>•</span>
            <span>Ultra Fast Engine</span>
            <span>•</span>
            <Link href="/member" className="text-emerald-600 font-medium hover:underline">
              Member Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
