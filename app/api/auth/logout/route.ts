import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.json({
    success: true,
    message: "Berhasil keluar dari akun.",
  });

  // Hapus cookie user_session secara menyeluruh
  response.cookies.set("user_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
  });
  response.cookies.delete("user_session");

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const response = NextResponse.redirect(new URL("/auth/login", url.origin));

  // Hapus cookie user_session secara menyeluruh
  response.cookies.set("user_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
  });
  response.cookies.delete("user_session");

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );

  return response;
}
