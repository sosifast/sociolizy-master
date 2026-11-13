import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MerchantNavbar from "./components/merchant-navbar";

export const metadata = {
  title: "Merchant Portal - Crypto Payment Gateway",
  description: "Manage merchant accounts, website integrations, and cryptocurrency payment transactions.",
};

export const instant = false;

export default async function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("user_session")?.value;
  const user = await verifySessionToken(token);

  if (!user) {
    redirect("/auth/login?redirect=/merchant");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      email: true,
      level: true,
    },
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  const siteSetting = await prisma.setting.findFirst({
    select: { site_name: true, logo: true },
  });

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <MerchantNavbar
        user={dbUser}
        siteName={siteSetting?.site_name || "Payment Gateway"}
        logo={siteSetting?.logo || "/logo/logo.png"}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
