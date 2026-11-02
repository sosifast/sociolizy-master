import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Zap, Wallet, ShoppingCart, User, Globe, LogOut, Shield, History } from "lucide-react";
import LogoutButton from "@/app/components/logout-button";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { countOrdersInMongo } from "@/lib/mongodb";

export const instant = false;

export default async function MemberDashboardPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session")?.value;
  const session = await verifySessionToken(sessionCookie);

  const user = session?.uuid
    ? await prisma.user.findUnique({
      where: { uuid: session.uuid },
      select: { balance: true, server_area: true },
    })
    : null;

  const orderCount = session?.uuid
      ? await countOrdersInMongo(session.uuid, user?.server_area)
      : 0;

  const userBalance = Number(user?.balance || 0);

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-8">
      {/* Welcome banner */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Verified Member Account
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Welcome Back, {session?.username || "Member"}!
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Your central dashboard for automated SMM orders and balance management.
        </p>
      </div>

      {/* Quick summary cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl bg-[#0c1222] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-bold">Available Balance</span>
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              ${userBalance.toFixed(2)}
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Ready for orders</span>
            <Link
              href="/member/payment"
              className="text-[11px] font-bold text-emerald-400 hover:underline"
            >
              + Deposit Funds
            </Link>
          </div>
        </div>

        <Link
          href="/member/history/order"
          className="p-5 rounded-3xl bg-[#0c1222] border border-slate-800 hover:border-indigo-500/40 transition-colors block shadow-xl"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-bold">Total Orders Placed</span>
            <ShoppingCart className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{orderCount}</div>
          <div className="text-[11px] text-indigo-400 mt-4 pt-2 border-t border-slate-800/80 font-semibold flex items-center gap-1">
            <span>View all orders</span>
            <History className="w-3 h-3" />
          </div>
        </Link>

        <div className="p-5 rounded-3xl bg-[#0c1222] border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
              <span className="font-bold">Account Status</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">Active</div>
          </div>
          <div className="text-[11px] text-slate-400 pt-4 mt-2 border-t border-slate-800/80">
            Tier: <strong className="text-slate-200">{session?.level || "Member"}</strong>
          </div>
        </div>
      </div>

      {/* Action card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/30 via-slate-900 to-[#0c1222] border border-indigo-500/20 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-lg font-bold text-white">Ready to Place Your SMM Orders?</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
            Browse our full catalog of high-speed social media services with instant automated processing.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
          <Link
            href="/member/order"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs sm:text-sm text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
          >
            Place Order Now
          </Link>
          <Link
            href="/member/payment"
            className="px-5 py-3 rounded-2xl bg-[#0c1222] hover:bg-slate-800 border border-slate-700 font-bold text-xs sm:text-sm text-slate-200 transition-all cursor-pointer whitespace-nowrap"
          >
            Deposit Funds
          </Link>
        </div>
      </div>
    </div>
  );
}
