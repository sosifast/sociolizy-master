import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  RotateCcw,
  CreditCard,
  Lock,
  Mail,
  CheckCircle2,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";

export const metadata: Metadata = {
  title: "Terms & Service Policy - Sociolizy (Smmfollowom)",
  description:
    "Review Sociolizy's terms of service, order delivery guidelines, refund rules, refill guarantee, and API reseller policies.",
};

export default function PolicyPage() {
  const sections = [
    { id: "general-terms", title: "1. General Overview & Agreement" },
    { id: "account-membership", title: "2. Account & Free Membership" },
    { id: "service-delivery", title: "3. Service Delivery & Order Processing" },
    { id: "prohibited-content", title: "4. Prohibited Content & Behavior" },
    { id: "refund-policy", title: "5. Refund & Balance Policy" },
    { id: "refill-guarantee", title: "6. Refill & Drop Protection" },
    { id: "payments-deposits", title: "7. Payments & Billing" },
    { id: "api-resellers", title: "8. API & Reseller Terms" },
    { id: "limitation-liability", title: "9. Disclaimer & Limitation of Liability" },
    { id: "account-termination", title: "10. Account Suspension & Termination" },
    { id: "contact-support", title: "11. Contact & Dispute Resolution" },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />
      <div className="fixed -bottom-40 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-500/10 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />

      {/* Topbar Security Announcement */}
      <Topbar />

      {/* Main Navigation Header */}
      <Navbar currentBadge="Policy" />

      {/* Hero Header */}
      <div className="relative z-10 border-b border-slate-800/80 bg-slate-900/30 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Terms of Service &amp; Usage Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Service Policy &amp; Terms
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
            Please read these terms carefully before placing orders or utilizing services on <strong className="text-white">Sociolizy (Smmfollowom)</strong>. By registering an account or making any purchase, you agree to comply with all policies outlined herein.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Effective Date: October 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Free Membership
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <Link href="/page/privacy" className="text-indigo-400 hover:underline">
              View Privacy Policy
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Table of Contents Sticky Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <div className="sticky top-28 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Policy Navigation</span>
              </div>
              <nav className="space-y-1.5 text-xs">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block py-1.5 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors truncate"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 mb-2">Questions regarding our policy?</div>
                <a
                  href="mailto:info@smmfollowom.com"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>info@smmfollowom.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Body */}
          <article className="lg:col-span-8 xl:col-span-9 space-y-12">
            
            {/* Security Callout */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-950/20 to-slate-900/60 border border-amber-500/30 text-amber-200 text-sm leading-relaxed flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-1">Authenticity &amp; Anti-Scam Warning:</strong>
                Registration on Sociolizy is <strong>100% free</strong>. Do not contact or pay people who claim to sell you membership for Sociolizy! Any individual offering paid access to this platform is committing unauthorized fraud.
              </div>
            </div>

            {/* Section 1 */}
            <section id="general-terms" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  1
                </span>
                <span>GENERAL OVERVIEW &amp; AGREEMENT</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Binding Legal Relationship
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                By accessing, browsing, or utilizing the services of <strong className="text-white">Sociolizy (Smmfollowom)</strong>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue your use of our platform immediately.
              </p>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                <p>
                  <strong>Platform Independence Disclaimer:</strong> Sociolizy is an independent social media marketing service provider. We are not officially affiliated with, endorsed by, or partnered with Instagram, Meta, TikTok, ByteDance, YouTube, Google, X (Twitter), Telegram, Spotify, or any other social media corporation.
                </p>
                <p>
                  All trademarks, logos, and brand names displayed on this platform remain the sole property of their respective trademark holders.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="account-membership" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  2
                </span>
                <span>ACCOUNT &amp; FREE MEMBERSHIP</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Eligibility &amp; Security Requirements
              </div>
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-white">a) Free Membership Guarantee:</p>
                  <p className="text-slate-400">
                    Sociolizy never requires subscription fees, membership fees, or upfront access payments. Account creation is free forever. Users only pay for the specific order services they deposit funds for.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-white">b) Age &amp; Capacity:</p>
                  <p className="text-slate-400">
                    You must be at least 18 years old or possess legal parental/guardian consent in your jurisdiction to register an account and purchase marketing services.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-white">c) Account Confidentiality:</p>
                  <p className="text-slate-400">
                    You are solely responsible for safeguarding your login credentials. Sociolizy is not liable for unauthorized access resulting from compromised passwords on the user&apos;s end.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="service-delivery" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  3
                </span>
                <span>SERVICE DELIVERY &amp; ORDER PROCESSING</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Automated Engine &amp; Order Conditions
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sociolizy operates a fully automated server routing cluster. Once an order is confirmed, our engine transmits it to the corresponding server within seconds.
              </p>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Public Profile Requirement:</strong> All social media accounts, posts, videos, or links submitted must be set to <strong>PUBLIC</strong> before placing an order and must remain public until the order status reads &quot;Completed&quot;.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No Username / Link Modifications:</strong> Do not change your account username, handle, or link while an order is in progress. Doing so interrupts delivery tracking and will forfeit eligibility for refunds or refills.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Concurrent Orders:</strong> Do not place two orders simultaneously for the exact same link on different services before the first order completes. Overlapping counts interfere with start count counters and may lead to delivery loss.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Password Requirement:</strong> We will never ask for your social media account password. If anyone claiming to represent Sociolizy asks for your password, report it immediately to our support.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="prohibited-content" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  4
                </span>
                <span>PROHIBITED CONTENT &amp; BEHAVIOR</span>
              </h2>
              <div className="text-sm font-semibold text-rose-400 uppercase tracking-wide">
                Strict Prohibitions
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                We maintain zero tolerance for illicit or harmful content. You may not use Sociolizy services for:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2.5 text-xs text-slate-300 pt-1">
                {[
                  "Adult content, pornography, or sexually explicit material",
                  "Hate speech, harassment, defamation, or threats of violence",
                  "Phishing links, malware distribution, or financial scams",
                  "Terrorist organizations or illicit arms trafficking promotion",
                  "Political election manipulation or malicious misinformation",
                  "Impersonation intended to defraud or damage third parties",
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/60 border border-rose-500/20 text-slate-300 flex items-start gap-2.5"
                  >
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 leading-relaxed">
                Orders violating these guidelines will be cancelled immediately without refund, and associated accounts will be permanently banned.
              </p>
            </section>

            {/* Section 5 */}
            <section id="refund-policy" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  5
                </span>
                <span>REFUND &amp; BALANCE POLICY</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Clear &amp; Fair Financial Rules
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Due to the immediate digital dispatch of social media marketing services, the following refund rules apply:
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <h4 className="font-bold text-white">Automatic System Refunds:</h4>
                  <p className="text-slate-400">
                    If an order cannot be completed due to a server error or platform restriction, the system will automatically cancel or partial the order and refund the unfulfilled credits back to your Sociolizy balance instantly.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <h4 className="font-bold text-white">Balance Usability:</h4>
                  <p className="text-slate-400">
                    Deposited funds are designated for service orders on Sociolizy. Once deposited and credited, balance funds cannot be refunded to external bank accounts, credit cards, or crypto wallets unless explicitly authorized by billing management.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-200 space-y-1.5">
                  <h4 className="font-bold text-white">Dispute &amp; Chargeback Warning:</h4>
                  <p>
                    Filing an unauthorized chargeback or dispute via PayPal, Stripe, credit card issuers, or crypto gateways without contacting our support first will result in immediate and permanent account termination, forfeiture of remaining balance, and permanent blacklisting of associated IP addresses and domains.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="refill-guarantee" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  6
                </span>
                <span>REFILL &amp; DROP PROTECTION</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                Guarantees &amp; Social Platform Algorithm Updates
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Social media platforms periodically perform global routine cleanups and algorithm adjustments. This may occasionally cause follower or view drops across all market providers.
              </p>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-3">
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Services with Refill:</strong> Services marked with &quot;Refill&quot; (e.g. 30 Days Refill, 60 Days Refill) include free top-up coverage if the count drops below the initial starting quantity + ordered amount during the warranty window.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>How to Trigger Refill:</strong> If your order qualifies, click the automated &quot;Refill&quot; button in your order history dashboard, or submit a support ticket referencing your Order ID.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No-Refill Services:</strong> Services explicitly designated as &quot;No Refill&quot; are provided at ultra-cheap budget pricing and do not include drop compensation after completion.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="payments-deposits" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  7
                </span>
                <span>PAYMENTS &amp; BILLING</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Secure Deposits &amp; Transparent Currency
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sociolizy supports multiple verified deposit gateways. All deposit transactions are secured with 256-bit SSL encryption.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-1">
                <li className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>
                    You certify that you are the lawful authorized cardholder or account owner for all payment methods utilized on Sociolizy.
                  </span>
                </li>
                <li className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Deposit credits are assigned automatically upon confirmation from the corresponding payment processing gateway.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="api-resellers" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  8
                </span>
                <span>API &amp; RESELLER TERMS</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Wholesale Connectivity &amp; Reseller Responsibilities
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sociolizy provides high-performance REST APIs allowing resellers to connect external panels and automate order placement.
              </p>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                <p>
                  <strong>Reseller End-Client Responsibility:</strong> Resellers are exclusively responsible for customer support, pricing, and communication with their end users. Sociolizy maintains direct legal relationships solely with the registered account holder.
                </p>
                <p>
                  <strong>API Fair Usage:</strong> Automated API keys must not be used to launch denial-of-service attempts, spam endpoints with malformed requests, or abuse service catalogs. Rate limiting is enforced to ensure 99.9% uptime for all global users.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="limitation-liability" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  9
                </span>
                <span>DISCLAIMER &amp; LIMITATION OF LIABILITY</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                As-Is Delivery &amp; Operational Boundaries
              </div>
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-3">
                <p>
                  Sociolizy services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express or implied, including fitness for a particular marketing goal or commercial gain.
                </p>
                <p>
                  In no event shall Sociolizy, its operators, or technical infrastructure partners be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from social media platform account restrictions, bans, suspension of monetization, or algorithmic demotions enacted by third-party social networks.
                </p>
                <p>
                  You choose to utilize promotional services at your own discretion and business evaluation.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="account-termination" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  10
                </span>
                <span>ACCOUNT SUSPENSION &amp; TERMINATION</span>
              </h2>
              <div className="text-sm font-semibold text-rose-400 uppercase tracking-wide">
                Grounds for Action
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sociolizy reserves the right to suspend, terminate, or restrict any account without prior notice in the event of:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-5 list-disc">
                <li>Attempting to defraud the platform or exploit software vulnerabilities</li>
                <li>Initiating chargebacks, payment reversals, or dispute claims</li>
                <li>Harassment, threats, or abusive language towards support personnel</li>
                <li>Submitting fraudulent, scam, or prohibited content links</li>
                <li>Reselling memberships or impersonating Sociolizy management</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section id="contact-support" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  11
                </span>
                <span>CONTACT &amp; DISPUTE RESOLUTION</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Dedicated Support Channels
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                If you encounter any order discrepancies, service delays, or have policy inquiries, please open a support ticket through your dashboard or contact our official channels:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">General Inquiries &amp; Policy</h3>
                  <p className="text-xs text-slate-400 mb-3">Official administrative contact</p>
                  <a
                    href="mailto:info@smmfollowom.com"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 break-all"
                  >
                    info@smmfollowom.com
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">Customer &amp; Order Support</h3>
                  <p className="text-xs text-slate-400 mb-3">Order queries, refills, and support tickets</p>
                  <a
                    href="mailto:infosmmfollowom@gmail.com"
                    className="text-xs font-semibold text-purple-400 hover:text-purple-300 break-all"
                  >
                    infosmmfollowom@gmail.com
                  </a>
                </div>
              </div>
            </section>

          </article>

        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
