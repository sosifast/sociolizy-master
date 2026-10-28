import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";

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

  return <>{children}</>;
}
