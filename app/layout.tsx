import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/app/components/posthog-provider";
import { PostHogErrorBoundary } from "@/app/components/posthog-error-boundary";
import gscConfig from "@/app/data/gsc.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MasterSMM - The Best Social Media Panel in The Market!",
  description:
    "Manage all social media networks from a single panel, quality and cheap. We provide services on Instagram, Twitter, Facebook, YouTube, TikTok, Spotify and more.",
  keywords: [
    "SMM panel",
    "cheapest smm panel",
    "best smm panel",
    "mastersmm",
    "reseller smm panel",
    "instagram smm panel",
    "tiktok smm panel",
    "youtube smm panel",
    "facebook smm panel",
    "spotify smm panel",
  ],
  verification: {
    google: gscConfig.googleSiteVerification || gscConfig.content,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-emerald-500 selection:text-white"
      >
        <PostHogProvider>
          <PostHogErrorBoundary>
            {children}
          </PostHogErrorBoundary>
        </PostHogProvider>
      </body>
    </html>
  );
}
