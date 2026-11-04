import React from "react";
import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: {
    absolute: "Sign In to Member Dashboard | Sociolizy",
  },
  description:
    "Log in to your Sociolizy account to order high-speed SMM services, track orders, manage your balance, and access reseller APIs with 24/7 instant automated delivery.",
  keywords: [
    "sociolizy login",
    "smm panel login",
    "smm reseller sign in",
    "social media panel login",
    "cheap smm dashboard",
    "sociolizy member area",
    "instant smm login",
  ],
  alternates: {
    canonical: "https://sociolizy.com/auth/login",
  },
  openGraph: {
    title: "Sign In to Member Dashboard | Sociolizy SMM Panel",
    description:
      "Log in to your Sociolizy account to order high-speed SMM services, track orders, manage your balance, and access reseller APIs with 24/7 instant automated delivery.",
    url: "https://sociolizy.com/auth/login",
    siteName: "Sociolizy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sociolizy Member Sign In",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In to Member Dashboard | Sociolizy SMM Panel",
    description:
      "Log in to your Sociolizy account to order high-speed SMM services, track orders, and access reseller APIs.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://sociolizy.com/auth/login#webpage",
      "url": "https://sociolizy.com/auth/login",
      "name": "Sign In to Member Dashboard | Sociolizy SMM Panel",
      "description":
        "Log in to your Sociolizy account to order high-speed SMM services, track orders, manage your balance, and access reseller APIs with 24/7 instant automated delivery.",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://sociolizy.com/#website",
        "url": "https://sociolizy.com",
        "name": "Sociolizy",
      },
      "inLanguage": "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://sociolizy.com/auth/login#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://sociolizy.com",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Sign In",
          "item": "https://sociolizy.com/auth/login",
        },
      ],
    },
  ],
};

export default function LoginPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LoginForm />
    </>
  );
}
