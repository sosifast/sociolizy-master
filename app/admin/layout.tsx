import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";
import AdminClientLayout from "./components/admin-client-layout";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("user_session")?.value;
  const session = await verifySessionToken(sessionCookie);

  // Jika belum login, alihkan ke halaman login
  if (!session) {
    redirect("/auth/login?redirect=/admin");
  }

  // Jika sudah login tapi level bukan Admin, tolak dan alihkan ke member dashboard
  if (session.level !== "Admin") {
    redirect("/member");
  }

  return <AdminClientLayout session={session}>{children}</AdminClientLayout>;
}
