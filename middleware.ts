import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("user_session")?.value;
  const session = await verifySessionToken(sessionCookie);

  // 1. PROTEKSI ROUTE ADMIN (/admin & /admin/*)
  if (pathname.startsWith("/admin")) {
    // Jika belum login, redirect ke /auth/login
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika sudah login tapi level bukan Admin, tolak dan alihkan ke /member
    if (session.level !== "Admin") {
      return NextResponse.redirect(new URL("/member", request.url));
    }

    return NextResponse.next();
  }

  // 2. PROTEKSI ROUTE MEMBER (/member & /member/*)
  if (pathname.startsWith("/member")) {
    // Jika belum login, redirect ke /auth/login
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. PROTEKSI API ADMIN (/api/admin & /api/admin/*)
  if (pathname.startsWith("/api/admin")) {
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak: Anda harus login untuk mengakses endpoint ini.",
        },
        { status: 401 }
      );
    }

    if (session.level !== "Admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Akses ditolak: Hanya pengguna dengan level Admin yang diizinkan.",
        },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // 4. ROUTE AUTH (/auth/login & /auth/register)
  // Jika user sudah login, arahkan ke dashboard masing-masing agar tidak perlu login ulang
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    if (session) {
      const redirectTarget = session.level === "Admin" ? "/admin" : "/member";
      return NextResponse.redirect(new URL(redirectTarget, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/member/:path*",
    "/api/admin/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
