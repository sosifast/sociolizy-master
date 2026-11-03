import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
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
import { getSiteSetting } from "@/lib/setting";

export const metadata: Metadata = {
  title: {
    absolute: "Terms of Service, Refund Policy & Refill Rules | Sociolizy",
  },
  description:
    "Review Sociolizy terms of service, automated fulfillment rules, instant balance refund conditions, refill guarantees, and reseller partner guidelines.",
  alternates: {
    canonical: "https://sociolizy.com/page/policy",
  },
  openGraph: {
    title: "Terms of Service, Refund Policy & Refill Rules | Sociolizy",
    description:
      "Review Sociolizy terms of service, automated fulfillment rules, instant balance refund conditions, refill guarantees, and reseller partner guidelines.",
    url: "https://sociolizy.com/page/policy",
    siteName: "Sociolizy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sociolizy - Your Ultimate SMM Partner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service, Refund Policy & Refill Rules | Sociolizy",
    description:
      "Review Sociolizy terms of service, automated fulfillment rules, instant balance refund conditions, refill guarantees, and reseller partner guidelines.",
    images: ["/og-image.jpg"],
  },
};

export const instant = false;

export default async function PolicyPage() {
  await connection();
  const setting = await getSiteSetting();
  const siteName = setting.site_name;
  const email = setting.email || "support@sociolizy.com";

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
    <div className="min-h-screen bg-white text-slate-800 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Topbar Security Announcement */}
      <Topbar />

      {/* Main Navigation Header */}
      <Navbar />

      {/* Hero Header */}
      <div className="relative z-10 border-b border-slate-200 bg-slate-50/70 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Terms of Service &amp; Usage Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Service Policy &amp; Terms
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl">
            Please read these terms carefully before placing orders or utilizing services on <strong className="text-slate-900">{siteName}</strong>. By registering an account or making any purchase, you agree to comply with all policies outlined herein.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Effective Date: October 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Free Membership
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <Link href="/page/privacy" className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
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
            <div className="sticky top-28 p-5 rounded-2xl bg-slate-50/90 border border-slate-200 shadow-xs backdrop-blur-md">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Policy Navigation</span>
              </div>
              <nav className="space-y-1 text-xs">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block py-1.5 px-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors truncate"
                  >
                    {section.title}
                  </a>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="text-[11px] text-slate-500 mb-2">Questions regarding our policy?</div>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{email}</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Policy Body */}
          <article className="lg:col-span-8 xl:col-span-9 space-y-12">
            
            {/* Security Callout */}
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950 block mb-1">Authenticity &amp; Anti-Scam Warning:</strong>
                Registration on {siteName} is <strong>100% free</strong>. Do not contact or pay people who claim to sell you membership for {siteName}! Any individual offering paid access to this platform is committing unauthorized fraud.
              </div>
            </div>

            {/* Section 1 */}
            <section id="general-terms" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  1
                </span>
                <span>GENERAL OVERVIEW &amp; AGREEMENT</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Binding Legal Relationship
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                By accessing, browsing, or utilizing the services of <strong className="text-slate-900">{siteName}</strong>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue your use of our platform immediately.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  <strong>Platform Independence Disclaimer:</strong> {siteName} is an independent social media marketing service provider. We are not officially affiliated with, endorsed by, or partnered with Instagram, Meta, TikTok, ByteDance, YouTube, Google, X (Twitter), Telegram, Spotify, or any other social media corporation.
                </p>
                <p>
                  All trademarks, logos, and brand names displayed on this platform remain the sole property of their respective trademark holders.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="account-membership" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  2
                </span>
                <span>ACCOUNT &amp; FREE MEMBERSHIP</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Eligibility &amp; Security Requirements
              </div>
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-900">a) Free Membership Guarantee:</p>
                  <p className="text-slate-500">
                    {siteName} never requires subscription fees, membership fees, or upfront access payments. Account creation is free forever. Users only pay for the specific order services they deposit funds for.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-900">b) Age &amp; Capacity:</p>
                  <p className="text-slate-500">
                    You must be at least 18 years old or possess legal parental/guardian consent in your jurisdiction to register an account and purchase marketing services.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-900">c) Account Confidentiality:</p>
                  <p className="text-slate-500">
                    You are solely responsible for safeguarding your login credentials. {siteName} is not liable for unauthorized access resulting from compromised passwords on the user&apos;s end.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="service-delivery" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  3
                </span>
                <span>SERVICE DELIVERY &amp; ORDER PROCESSING</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Automated Engine &amp; Order Conditions
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {siteName} operates a fully automated server routing cluster. Once an order is confirmed, our engine transmits it to the corresponding server within seconds.
              </p>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Public Profile Requirement:</strong> All social media accounts, posts, videos, or links submitted must be set to <strong>PUBLIC</strong> before placing an order and must remain public until the order status reads &quot;Completed&quot;.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No Username / Link Modifications:</strong> Do not change your account username, handle, or link while an order is in progress. Doing so interrupts delivery tracking and will forfeit eligibility for refunds or refills.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Concurrent Orders:</strong> Do not place two orders simultaneously for the exact same link on different services before the first order completes. Overlapping counts interfere with start count counters and may lead to delivery loss.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Password Requirement:</strong> We will never ask for your social media account password. If anyone claiming to represent {siteName} asks for your password, report it immediately to our support.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="prohibited-content" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  4
                </span>
                <span>PROHIBITED CONTENT &amp; BEHAVIOR</span>
              </h2>
              <div className="text-sm font-semibold text-rose-600 uppercase tracking-wide">
                Strict Prohibitions
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                We maintain zero tolerance for illicit or harmful content. You may not use {siteName} services for:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2.5 text-xs text-slate-600 pt-1">
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
                    className="p-3 rounded-xl bg-rose-50/50 border border-rose-200 text-slate-700 flex items-start gap-2.5"
                  >
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 leading-relaxed">
                Orders violating these guidelines will be cancelled immediately without refund, and associated accounts will be permanently banned.
              </p>
            </section>

            {/* Section 5 */}
            <section id="refund-policy" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  5
                </span>
                <span>REFUND &amp; BALANCE POLICY</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Clear &amp; Fair Financial Rules
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Due to the immediate digital dispatch of social media marketing services, the following refund rules apply:
              </p>

              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Automatic System Refunds:</h4>
                  <p className="text-slate-500">
                    If an order cannot be completed due to a server error or platform restriction, the system will automatically cancel or partial the order and refund the unfulfilled credits back to your {siteName} balance instantly.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 space-y-1.5">
                  <h4 className="font-bold text-slate-900">Balance Usability:</h4>
                  <p className="text-slate-500">
                    Deposited funds are designated for service orders on {siteName}. Once deposited and credited, balance funds cannot be refunded to external bank accounts, credit cards, or crypto wallets unless explicitly authorized by billing management.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1.5">
                  <h4 className="font-bold text-rose-950">Dispute &amp; Chargeback Warning:</h4>
                  <p>
                    Filing an unauthorized chargeback or dispute via PayPal, Stripe, credit card issuers, or crypto gateways without contacting our support first will result in immediate and permanent account termination, forfeiture of remaining balance, and permanent blacklisting of associated IP addresses and domains.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="refill-guarantee" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  6
                </span>
                <span>REFILL &amp; DROP PROTECTION</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Guarantees &amp; Social Platform Algorithm Updates
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Social media platforms periodically perform global routine cleanups and algorithm adjustments. This may occasionally cause follower or view drops across all market providers.
              </p>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs text-slate-600 space-y-3">
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Services with Refill:</strong> Services marked with &quot;Refill&quot; (e.g. 30 Days Refill, 60 Days Refill) include free top-up coverage if the count drops below the initial starting quantity + ordered amount during the warranty window.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>How to Trigger Refill:</strong> If your order qualifies, click the automated &quot;Refill&quot; button in your order history dashboard, or submit a support ticket referencing your Order ID.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>No-Refill Services:</strong> Services explicitly designated as &quot;No Refill&quot; are provided at ultra-cheap budget pricing and do not include drop compensation after completion.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="payments-deposits" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  7
                </span>
                <span>PAYMENTS &amp; BILLING</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Secure Deposits &amp; Transparent Currency
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {siteName} supports multiple verified deposit gateways. All deposit transactions are secured with 256-bit SSL encryption.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-1">
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    You certify that you are the lawful authorized cardholder or account owner for all payment methods utilized on {siteName}.
                  </span>
                </li>
                <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>
                    Deposit credits are assigned automatically upon confirmation from the corresponding payment processing gateway.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="api-resellers" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  8
                </span>
                <span>API &amp; RESELLER TERMS</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Wholesale Connectivity &amp; Reseller Responsibilities
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {siteName} provides high-performance REST APIs allowing resellers to connect external panels and automate order placement.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  <strong>Reseller End-Client Responsibility:</strong> Resellers are exclusively responsible for customer support, pricing, and communication with their end users. {siteName} maintains direct legal relationships solely with the registered account holder.
                </p>
                <p>
                  <strong>API Fair Usage:</strong> Automated API keys must not be used to launch denial-of-service attempts, spam endpoints with malformed requests, or abuse service catalogs. Rate limiting is enforced to ensure 99.9% uptime for all global users.
                </p>
              </div>
            </section>

            {/* Section 9 */}
            <section id="limitation-liability" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  9
                </span>
                <span>DISCLAIMER &amp; LIMITATION OF LIABILITY</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                As-Is Delivery &amp; Operational Boundaries
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-3">
                <p>
                  {siteName} services are provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express or implied, including fitness for a particular marketing goal or commercial gain.
                </p>
                <p>
                  In no event shall {siteName}, its operators, or technical infrastructure partners be liable for any direct, indirect, incidental, punitive, or consequential damages resulting from social media platform account restrictions, bans, suspension of monetization, or algorithmic demotions enacted by third-party social networks.
                </p>
                <p>
                  You choose to utilize promotional services at your own discretion and business evaluation.
                </p>
              </div>
            </section>

            {/* Section 10 */}
            <section id="account-termination" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  10
                </span>
                <span>ACCOUNT SUSPENSION &amp; TERMINATION</span>
              </h2>
              <div className="text-sm font-semibold text-rose-600 uppercase tracking-wide">
                Grounds for Action
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {siteName} reserves the right to suspend, terminate, or restrict any account without prior notice in the event of:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-5 list-disc">
                <li>Attempting to defraud the platform or exploit software vulnerabilities</li>
                <li>Initiating chargebacks, payment reversals, or dispute claims</li>
                <li>Harassment, threats, or abusive language towards support personnel</li>
                <li>Submitting fraudulent, scam, or prohibited content links</li>
                <li>Reselling memberships or impersonating {siteName} management</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section id="contact-support" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-sm font-extrabold">
                  11
                </span>
                <span>CONTACT &amp; DISPUTE RESOLUTION</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide">
                Dedicated Support Channels
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                If you encounter any order discrepancies, service delays, or have policy inquiries, please open a support ticket through your dashboard or contact our official channels:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">General Inquiries &amp; Policy</h3>
                  <p className="text-xs text-slate-500 mb-3">Official administrative contact</p>
                  <a
                    href={`mailto:${email}`}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 break-all"
                  >
                    {email}
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3 text-emerald-600">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">Customer &amp; Order Support</h3>
                  <p className="text-xs text-slate-500 mb-3">Order queries, refills, and support tickets</p>
                  <Link
                    href="/page/contact-us"
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 break-all"
                  >
                    Contact Support Desk
                  </Link>
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
