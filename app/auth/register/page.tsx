import React from "react";
import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: {
    absolute: "Create Account - Register for Best Wholesale SMM Panel | Sociolizy",
  },
  description:
    "Join Sociolizy today. Create a free account to access wholesale rates on Instagram, TikTok, YouTube, Telegram & Facebook services with multi-region high-speed servers.",
  keywords: [
    "sociolizy register",
    "smm panel registration",
    "sign up smm panel",
    "create smm reseller account",
    "cheap smm panel sign up",
    "automated smm services register",
    "sociolizy signup",
  ],
  alternates: {
    canonical: "https://sociolizy.com/auth/register",
  },
  openGraph: {
    title: "Create Account - Register for Best Wholesale SMM Panel | Sociolizy",
    description:
      "Join Sociolizy today. Create a free account to access wholesale rates on Instagram, TikTok, YouTube, Telegram & Facebook services with multi-region high-speed servers.",
    url: "https://sociolizy.com/auth/register",
    siteName: "Sociolizy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sociolizy - Create Free SMM Account",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Account - Register for Best Wholesale SMM Panel | Sociolizy",
    description:
      "Join Sociolizy today. Create a free account to access wholesale rates on social media growth services.",
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
      "@id": "https://sociolizy.com/auth/register#webpage",
      "url": "https://sociolizy.com/auth/register",
      "name": "Create Account - Register for Best Wholesale SMM Panel | Sociolizy",
      "description":
        "Join Sociolizy today. Create a free account to access wholesale rates on Instagram, TikTok, YouTube, Telegram & Facebook services with multi-region high-speed servers.",
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
      "@id": "https://sociolizy.com/auth/register#breadcrumb",
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
          "name": "Register",
          "item": "https://sociolizy.com/auth/register",
        },
      ],
    },
  ],
};

export default function RegisterPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RegisterForm />
    </>
  );
}
