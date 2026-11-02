import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MemberTopbar, { MemberUserData } from "./layouts/topbar";
import MemberHeader from "./layouts/header";
import MemberFooter from "./layouts/footer";

export const instant = false;

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session")?.value;
  const session = await verifySessionToken(sessionCookie);

  // Jika belum login, alihkan ke halaman login
  if (!session) {
    redirect("/auth/login?redirect=/member");
  }

  // Ambil profil data user realtime dari PostgreSQL
  const user = session.uuid
    ? await prisma.user.findUnique({
        where: { uuid: session.uuid },
        select: {
          username: true,
          email: true,
          balance: true,
          server_area: true,
          level: true,
        },
      })
    : null;

  const userData: MemberUserData = {
    username: user?.username || session.username || "Member",
    email: user?.email || session.email || "",
    balance: Number(user?.balance || 0),
    server_area: user?.server_area || session.server_area || "SG",
    level: user?.level || session.level || "Member",
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Topbar: Server cluster & realtime balance */}
      <MemberTopbar user={userData} />

      {/* Main Header: Brand & Navigation Menu */}
      <MemberHeader user={userData} />

      {/* Page Content Body */}
      <main className="flex-1 w-full flex flex-col">{children}</main>

      {/* Footer: Multi-column links & Security badge */}
      <MemberFooter />
    </div>
  );
}
