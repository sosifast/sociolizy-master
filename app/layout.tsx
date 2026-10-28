import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sociolizy - #1 Best & Cheapest SMM Panel | Automated Social Media Services",
  description:
    "Sociolizy is the world's most affordable automated SMM panel for creators, resellers, and agencies across Instagram, TikTok, YouTube, Facebook, and more.",
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
  ],
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
        className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-indigo-500 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
