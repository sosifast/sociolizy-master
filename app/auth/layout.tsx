import React from "react";
import GoogleTag from "@/app/components/google-tag";
import "./auth.css";
import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2026-08-30'
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page relative flex min-h-screen w-full flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Google tag (gtag.js) */}
      <GoogleTag />

      <main className="auth-content relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex w-full justify-center">
          {children}
        </div>
      </main>

      <footer className="relative z-10 w-full border-t py-3.5 text-center text-xs">
        <p>© 2026 Sociolizy. All rights reserved.</p>
      </footer>
    </div>
  );
}
