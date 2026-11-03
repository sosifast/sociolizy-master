import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/app/components/posthog-provider";
import { PostHogErrorBoundary } from "@/app/components/posthog-error-boundary";
import gscConfig from "@/app/data/gsc.json";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sociolizy.com"),
  title: {
    default: "Sociolizy - #1 Best & Cheapest SMM Panel for Resellers",
    template: "%s | Sociolizy",
  },
  description:
    "Sociolizy is the #1 cheapest automated SMM panel for Instagram, TikTok, YouTube, Telegram & Facebook with instant wholesale delivery and direct API access.",
  keywords: [
    "SMM panel",
    "cheapest smm panel",
    "best smm panel",
    "sociolizy",
    "reseller smm panel",
    "instagram smm panel",
    "tiktok smm panel",
    "youtube smm panel",
    "facebook smm panel",
    "telegram smm panel",
    "spotify smm panel",
  ],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Sociolizy - #1 Best & Cheapest SMM Panel for Resellers",
    description:
      "Grow your social media presence with Sociolizy. The cheapest automated SMM panel for Instagram, TikTok, YouTube, Telegram & Facebook with instant fulfillment.",
    url: "https://sociolizy.com",
    siteName: "Sociolizy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sociolizy - Your Ultimate SMM Partner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sociolizy - #1 Best & Cheapest SMM Panel for Resellers",
    description:
      "The cheapest automated SMM panel for Instagram, TikTok, YouTube, Telegram & Facebook.",
    images: ["/og-image.jpg"],
  },
  verification: {
    google: gscConfig.googleSiteVerification || gscConfig.content,
  },
  icons: {
    icon: [
      { url: "/logo/favicon.png", type: "image/png" },
    ],
    shortcut: "/logo/favicon.png",
    apple: "/logo/favicon.png",
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
            <Analytics />
            <SpeedInsights />
          </PostHogErrorBoundary>
        </PostHogProvider>
      </body>
    </html>
  );
}
