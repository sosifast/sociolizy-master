import React from "react";
import type { Metadata } from "next";
import GoogleTag from "@/app/components/google-tag";
import posthog from 'posthog-js';

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2026-08-30'
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sociolizy.com"),
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Sociolizy - #1 Best & Cheapest SMM Panel for Resellers",
    description:
      "Grow your social media presence with Sociolizy. Automated wholesale SMM services with instant delivery.",
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
      "Grow your social media presence with Sociolizy. Automated wholesale SMM services with instant delivery.",
    images: ["/og-image.jpg"],
  },
};

export default function PageSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <GoogleTag />
      {children}
    </>
  );
}

