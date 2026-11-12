import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 py-12 relative z-10 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <Image
                src="/logo/logo.png"
                alt="sociolizy"
                width={160}
                height={58}
                className="h-10 sm:h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mb-4">
              #1 Best and Cheapest SMM Panel. An automated social media services platform built for resellers, creators, agencies, and brands across 20+ countries.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safe, Ethical &amp; SSL 256-Bit Encrypted</span>
            </div>
          </div>

          {/* Col 2: Navigation & Policies */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-900 mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-emerald-600 transition-colors">
                  Blog &amp; Guides
                </Link>
              </li>
              <li>
                <Link href="/page/about-us" className="hover:text-emerald-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/page/contact-us" className="hover:text-emerald-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/page/privacy" className="hover:text-emerald-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/page/policy" className="hover:text-emerald-600 transition-colors">
                  Terms &amp; Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Authentication & Support */}
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-900 mb-4">
              Account Access
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link href="/auth/login" className="hover:text-emerald-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-emerald-600 transition-colors font-medium">
                  Create Account (100% Free)
                </Link>
              </li>
              <li>
                <span className="text-slate-500">24/7 Automated Dispatch</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Sociolizy. All rights reserved.</p>
          <p>World&apos;s Cheapest &amp; Most Reliable Social Media Marketing Panel.</p>
        </div>
      </div>
    </footer>
  );
}
