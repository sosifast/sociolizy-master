import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Zap, Wallet, ShoppingCart, User, Globe, LogOut, Shield, History } from "lucide-react";
import LogoutButton from "@/app/components/logout-button";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { countOrdersInMongo } from "@/lib/mongodb";

export default async function MemberDashboardPage() {
  await connection();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
      {/* Welcome banner */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Welcome Back, {session?.username || "Member"}!
        </h1>
      </div>

      {/* Quick summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2.5">
              <span className="font-semibold">Available Balance</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-600">
              ${userBalance.toFixed(2)}
            </div>
          </div>
          <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Ready for orders</span>
            <Link
              href="/member/payment"
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              + Deposit Funds
            </Link>
          </div>
        </div>

        <Link
          href="/member/history/order"
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/40 hover:shadow-xs transition-all block shadow-xs group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2.5">
            <span className="font-semibold">Total Orders Placed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {orderCount}
          </div>
          <div className="text-xs text-emerald-600 mt-3 pt-3.5 border-t border-slate-100 font-semibold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
            <span>View all orders</span>
            <History className="w-3.5 h-3.5" />
          </div>
        </Link>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs mb-2.5">
              <span className="font-semibold">Account Status</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              Active
            </div>
          </div>
          <div className="text-xs text-slate-500 pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Tier:</span>
            <strong className="text-slate-800 font-semibold uppercase">{session?.level || "Member"}</strong>
          </div>
        </div>
      </div>

      {/* Action card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white border border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Ready to Place Your SMM Orders?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Browse our full catalog of high-speed social media services with instant automated processing across all platforms.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap justify-center md:justify-end shrink-0">
          <Link
            href="/member/order"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Place New Order
          </Link>
          <Link
            href="/member/payment"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 font-semibold text-xs sm:text-sm text-slate-700 transition-all cursor-pointer whitespace-nowrap shadow-xs"
          >
            Deposit Funds
          </Link>
        </div>
      </div>
    </div>
  );
}
