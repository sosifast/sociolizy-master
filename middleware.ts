import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth";

function getTargetUrl(path: string, request: NextRequest): URL {
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ||
    (request.url.startsWith("https") ? "https" : "http");

  if (forwardedHost) {
    return new URL(path, `${forwardedProto}://${forwardedHost}`);
  }
  return new URL(path, request.url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("user_session")?.value;
  const session = await verifySessionToken(sessionCookie);

  // 1. PROTEKSI ROUTE ADMIN (/admin & /admin/*)
  if (pathname.startsWith("/admin")) {
    // Jika belum login, redirect ke /auth/login
    if (!session) {
      const loginUrl = getTargetUrl("/auth/login", request);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika sudah login tapi level bukan Admin, tolak dan alihkan ke /member
    if (session.level !== "Admin") {
      return NextResponse.redirect(getTargetUrl("/member", request));
    }

    return NextResponse.next();
  }

  // 2. PROTEKSI ROUTE MEMBER (/member & /member/*)
  if (pathname.startsWith("/member")) {
    // Jika belum login, redirect ke /auth/login
    if (!session) {
      const loginUrl = getTargetUrl("/auth/login", request);
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
      return NextResponse.redirect(getTargetUrl(redirectTarget, request));
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
