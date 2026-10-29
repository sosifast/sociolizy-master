import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060911] py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-[1px] shadow-sm">
                <div className="w-full h-full bg-[#0a0f1d] rounded-[11px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                sociolizy
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mb-4">
              #1 Best and Cheapest SMM Panel. An automated social media services platform built for resellers, creators, agencies, and brands across 20+ countries.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Safe, Ethical &amp; SSL 256-Bit Encrypted</span>
            </div>
          </div>

          {/* Col 2: Navigation & Policies */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a href="/#why-choose-us" className="hover:text-white transition-colors">
                  Why Choose Us
                </a>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="/#global-platform" className="hover:text-white transition-colors">
                  Global Platform
                </a>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <Link href="/page/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/page/policy" className="hover:text-white transition-colors">
                  Terms &amp; Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Authentication & Support */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-300 mb-4">
              Account Access
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-white transition-colors">
                  Create Account (100% Free)
                </Link>
              </li>
              <li>
                <span className="text-slate-500">24/7 Automated Dispatch</span>
              </li>
              <li className="pt-2">
                <span className="block text-slate-500 text-[11px]">Support Email:</span>
                <a
                  href="mailto:info@smmfollowom.com"
                  className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                >
                  info@smmfollowom.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Sociolizy. All rights reserved.</p>
          <p>World&apos;s Cheapest &amp; Most Reliable Social Media Marketing Panel.</p>
        </div>
      </div>
    </footer>
  );
}
