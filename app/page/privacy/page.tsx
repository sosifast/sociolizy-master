import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Lock,
  FileText,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Server,
  Clock,
} from "lucide-react";
import { Topbar, Navbar, Footer } from "@/app/layouts";

export const metadata: Metadata = {
  title: "Privacy Policy - Sociolizy (Smmfollowom)",
  description:
    "Learn how Sociolizy (Smmfollowom) collects, uses, and protects your personal data and social media information.",
};

export default function PrivacyPolicyPage() {
  const sections = [
    { id: "info-we-collect", title: "1. Information We Collect" },
    { id: "how-we-use", title: "2. How We Use Your Information" },
    { id: "cookies-tracking", title: "3. Cookies & Tracking Technologies" },
    { id: "data-sharing", title: "4. Data Sharing & Third Parties" },
    { id: "data-security", title: "5. Data Protection & Security" },
    { id: "your-rights", title: "6. Your Rights Over Your Data" },
    { id: "order-data", title: "7. Order Data & Social Accounts" },
    { id: "external-links", title: "8. External Links" },
    { id: "policy-changes", title: "9. Changes to This Policy" },
    { id: "consent", title: "10. Consent" },
    { id: "contact-us", title: "11. Contact Us" },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />
      <div className="fixed -bottom-40 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-cyan-500/10 via-blue-600/10 to-transparent blur-[140px] rounded-full pointer-events-none animate-glow" />

      {/* Topbar Security Announcement */}
      <Topbar />

      {/* Main Navigation Header */}
      <Navbar currentBadge="Privacy" />

      {/* Hero Header */}
      <div className="relative z-10 border-b border-slate-800/80 bg-slate-900/30 py-12 lg:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl">
            At <strong className="text-white">Sociolizy (Smmfollowom)</strong>, your privacy is not an afterthought; it is a core part of how we operate. This Privacy Policy explains exactly what data we collect, why we collect it, how we protect it, and what rights you have over it.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Last Updated: October 2026
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              SSL 256-Bit Protection
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span>Contact: info@smmfollowom.com</span>
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
                <span>Table of Contents</span>
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
                <div className="text-[11px] text-slate-400 mb-2">Need help or account deletion?</div>
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

          {/* Privacy Policy Main Body */}
          <article className="lg:col-span-8 xl:col-span-9 space-y-12">
            
            {/* Overview Intro Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900/60 border border-indigo-500/20 text-slate-300 text-sm leading-relaxed">
              By accessing and using our website and services, you agree to the practices described in this policy. If you have any questions or require clarification about how your data is handled, our dedicated privacy team is always reachable at{" "}
              <a href="mailto:info@smmfollowom.com" className="text-indigo-400 underline font-medium">
                info@smmfollowom.com
              </a>.
            </div>

            {/* Section 1 */}
            <section id="info-we-collect" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  1
                </span>
                <span>INFORMATION WE COLLECT</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                What Data Do We Gather and Why?
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                To provide our automated social media marketing services and maintain your account, we may collect the following types of information:
              </p>

              <div className="grid md:grid-cols-3 gap-4 pt-2">
                {/* a) Personal Information */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h3 className="font-bold text-sm text-white mb-2 text-indigo-300">
                    a) Personal Information
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    When you register an account, place an order, or contact us:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span> Full name
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span> Email address
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span> Username (for social media accounts used in orders)
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span> Payment transaction details (amount, payment method used)
                    </li>
                  </ul>
                </div>

                {/* b) Technical & Usage Data */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h3 className="font-bold text-sm text-white mb-2 text-cyan-300">
                    b) Technical &amp; Usage Data
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Automatically collected technical information when you visit:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span> IP address and approximate location
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span> Browser type and version
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span> Device type and operating system
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span> Pages visited, time spent, and clickstream data
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span> Referral source (how you found us)
                    </li>
                  </ul>
                </div>

                {/* c) Order & Service Data */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <h3 className="font-bold text-sm text-white mb-2 text-purple-300">
                    c) Order &amp; Service Data
                  </h3>
                  <p className="text-xs text-slate-400 mb-3">
                    Collected when you submit orders through our platform:
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span> Social media account usernames or public URLs provided for service delivery
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span> Order history, quantities, and service preferences
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-purple-400">•</span> Communication history with our support team
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="how-we-use" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  2
                </span>
                <span>HOW WE USE YOUR INFORMATION</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                The Purpose Behind Every Data Point We Collect
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                We use the information we collect solely for legitimate business purposes. Specifically, your data helps us:
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {[
                  "Create and manage your Sociolizy (Smmfollowom) account securely",
                  "Process and deliver the social media services you have ordered",
                  "Communicate with you regarding your orders, balance, or support tickets",
                  "Send important service updates, announcements, or policy revisions",
                  "Improve our website performance, user experience, and service offerings",
                  "Detect and prevent fraudulent activity, abuse, or unauthorized access",
                  "Comply with legal and regulatory obligations where strictly required",
                ].map((purpose, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300 leading-relaxed">{purpose}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200">
                <strong>Our Commitment:</strong> We do not use your data for any purpose not listed above without your explicit prior consent.
              </div>
            </section>

            {/* Section 3 */}
            <section id="cookies-tracking" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  3
                </span>
                <span>COOKIES &amp; TRACKING TECHNOLOGIES</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                How We Use Cookies and Analytics Tools
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sociolizy uses cookies and similar tracking technologies to enhance your browsing experience and understand how visitors interact with our platform.
              </p>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block mb-1">What Are Cookies?</strong>
                Cookies are small text files stored on your device by your web browser. They help us recognise returning visitors, remember your preferences, and improve site performance. Cookies do not contain sensitive personal information such as passwords or payment card details.
              </div>

              {/* Cookies Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-bold">Type</th>
                      <th className="py-3 px-4 font-bold">Purpose</th>
                      <th className="py-3 px-4 font-bold">Can Be Disabled?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-900/40 text-slate-300">
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-white">Essential Cookies</td>
                      <td className="py-3.5 px-4">
                        Keep your session active; required for secure login, dashboard navigation, and order processing.
                      </td>
                      <td className="py-3.5 px-4 text-rose-400 font-medium">
                        No — Required for site function
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-white">Analytics Cookies</td>
                      <td className="py-3.5 px-4">
                        Google Analytics: tracks aggregated page visits, bounce rate, and user behavior to continuously improve our service.
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-medium">
                        Yes — via browser settings
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-white">Marketing Cookies</td>
                      <td className="py-3.5 px-4">
                        Facebook Pixel (used occasionally): measures the effectiveness of promotional campaigns and advertising reach.
                      </td>
                      <td className="py-3.5 px-4 text-emerald-400 font-medium">
                        Yes — via browser settings
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                You may disable non-essential cookies through your browser settings at any time. Please note that disabling certain cookies may limit some functionality of our website.
              </p>
            </section>

            {/* Section 4 */}
            <section id="data-sharing" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  4
                </span>
                <span>DATA SHARING &amp; THIRD PARTIES</span>
              </h2>
              <div className="text-sm font-semibold text-emerald-400 uppercase tracking-wide">
                We Do Not Sell Your Data — Ever
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sociolizy (Smmfollowom) does <strong className="text-white">not sell, rent, trade, or share</strong> your personal information with third parties for their own marketing or commercial purposes. Full stop.
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">Analytics Providers:</strong>
                  Google Analytics receives anonymized usage data to help us understand site performance. This data cannot be used to identify you personally.
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">Advertising Tools:</strong>
                  Facebook Pixel may receive anonymized behavioral data occasionally used to measure ad effectiveness. No personal identifying information is passed.
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white block mb-1">Legal Requirements:</strong>
                  If required by law, court order, or government authority, we may disclose certain data strictly to comply with legal obligations.
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                All third-party tools we use (Google, Meta/Facebook) maintain their own privacy policies, which we encourage you to review.
              </p>
            </section>

            {/* Section 5 */}
            <section id="data-security" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  5
                </span>
                <span>DATA PROTECTION &amp; SECURITY</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                How We Keep Your Information Safe
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                We take the security of your personal data seriously. Our platform and internal processes are designed with multiple layers of defense:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-white mb-1.5">
                    <Server className="w-4 h-4 text-indigo-400" />
                    <span>Encrypted Data Storage</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All sensitive user data is stored on secure, encrypted servers with strictly restricted access protocols.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-white mb-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Access Controls</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Only authorized team members can access user account records, and only when necessary to resolve support inquiries.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-white mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    <span>SSL (HTTPS) Encryption</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    All data transmitted between your web browser and our website is encrypted using industry-standard SSL technology.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-white mb-1.5">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <span>Regular Security Reviews</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We periodically review our infrastructure, patches, and practices to proactively address emerging cybersecurity threats.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                <em>Disclaimer:</em> While we implement industry-standard security measures, no method of transmission or electronic storage over the internet is 100% infallible. We cannot provide an absolute guarantee of security, but we commit to protecting your information with every reasonable measure available.
              </div>
            </section>

            {/* Section 6 */}
            <section id="your-rights" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  6
                </span>
                <span>YOUR RIGHTS OVER YOUR DATA</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                You Are in Control
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                As a valued user of Sociolizy (Smmfollowom), you have the following rights regarding your personal information:
              </p>

              <div className="space-y-2.5 pt-2">
                {[
                  {
                    right: "Right to Access",
                    desc: "You may request a copy of the personal data we hold about you at any time.",
                  },
                  {
                    right: "Right to Correction",
                    desc: "If any information we hold is inaccurate or incomplete, you have the right to request an immediate correction.",
                  },
                  {
                    right: "Right to Deletion",
                    desc: "You may request that we delete your personal data from our systems, subject to legal retention requirements.",
                  },
                  {
                    right: "Right to Opt-Out",
                    desc: "You can disable non-essential cookies (Analytics, Marketing) through your browser settings at any time.",
                  },
                  {
                    right: "Right to Data Portability",
                    desc: "Upon request, we can provide your data in a structured, commonly used digital format.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <span className="font-bold text-sm text-white">{item.right}</span>
                    <span className="text-xs text-slate-400 sm:text-right">{item.desc}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-300 pt-2">
                To exercise any of these rights, please email us directly at{" "}
                <a href="mailto:infosmmfollowom@gmail.com" className="text-indigo-400 underline font-semibold">
                  infosmmfollowom@gmail.com
                </a>{" "}
                or{" "}
                <a href="mailto:info@smmfollowom.com" className="text-indigo-400 underline font-semibold">
                  info@smmfollowom.com
                </a>
                . We will respond to all verified requests within a reasonable timeframe.
              </p>
            </section>

            {/* Section 7 */}
            <section id="order-data" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  7
                </span>
                <span>ORDER DATA &amp; SOCIAL MEDIA ACCOUNTS</span>
              </h2>
              <div className="text-sm font-semibold text-amber-400 uppercase tracking-wide">
                How We Handle the Accounts You Submit
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                When you place an order, you provide social media account usernames or public URLs required for service delivery. Here is how we handle this data:
              </p>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">
                    We use your account information <strong>solely to fulfill the specific order</strong> you have submitted.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">
                    <strong>We do NOT access, log into, or store your social media passwords</strong> at any point. Our service never requires private credentials.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">
                    Order data is retained in our secure system strictly for account history, order tracking, and customer support.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-300">
                    We never share your social media account details or targets with external third parties.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Important Notice:</strong> Please ensure that all account information and links you provide are accurate and public before placing an order. Orders placed with incorrect or private links may not qualify for refunds.
                </span>
              </div>
            </section>

            {/* Section 8 */}
            <section id="external-links" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  8
                </span>
                <span>EXTERNAL LINKS</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Links to Third-Party Websites
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Our website may contain links to external websites, social media platforms, or partner resources. These links are provided for your convenience and do not signify our endorsement of those sites.
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sociolizy (Smmfollowom) is not responsible for the privacy practices, content, or security of any external websites. We strongly recommend reviewing the privacy policy of any third-party site before sharing personal information.
              </p>
            </section>

            {/* Section 9 */}
            <section id="policy-changes" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  9
                </span>
                <span>CHANGES TO THIS PRIVACY POLICY</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Keeping You Informed of Updates
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                Sociolizy (Smmfollowom) may update this Privacy Policy from time to time to reflect changes in our operational practices, technological improvements, legal requirements, or other operational factors.
              </p>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p>When significant changes occur, we will:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>Update the &apos;Last Updated&apos; date at the top of this documentation page.</li>
                  <li>Post a prominent notice on our website or notify registered users via email where appropriate.</li>
                </ul>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                We encourage you to review this Privacy Policy periodically to stay informed about how we safeguard your data. Continued use of our services after changes are posted constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Section 10 */}
            <section id="consent" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  10
                </span>
                <span>CONSENT</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Your Agreement to This Policy
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                By accessing and using the Sociolizy (Smmfollowom) website and automated services, you acknowledge that you have read, understood, and agreed to this Privacy Policy and our Terms of Service.
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you do not agree with any part of this policy, please discontinue your use of our platform immediately and contact us at{" "}
                <a href="mailto:infosmmfollowom@gmail.com" className="text-indigo-400 underline font-medium">
                  infosmmfollowom@gmail.com
                </a>{" "}
                to request complete account deletion.
              </p>
            </section>

            {/* Section 11 */}
            <section id="contact-us" className="scroll-mt-24 space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-extrabold">
                  11
                </span>
                <span>CONTACT US</span>
              </h2>
              <div className="text-sm font-semibold text-indigo-300 uppercase tracking-wide">
                Questions? We Are Here to Help.
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                If you have any questions, concerns, or requests related to this Privacy Policy or how your personal data is handled, please reach out to us:
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">Primary Privacy Email</h3>
                  <p className="text-xs text-slate-400 mb-3">For general privacy and policy inquiries</p>
                  <a
                    href="mailto:info@smmfollowom.com"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 break-all"
                  >
                    info@smmfollowom.com
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1">Account &amp; Data Deletion</h3>
                  <p className="text-xs text-slate-400 mb-3">For data access, correction, or deletion requests</p>
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
