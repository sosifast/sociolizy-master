import React from "react";
import type { Metadata } from "next";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = {
  title: {
    absolute: "Forgot Password - Recover Your Sociolizy Account | Sociolizy",
  },
  description:
    "Reset and recover access to your Sociolizy SMM panel account. Enter your username or email address to receive secure password recovery instructions via email.",
  keywords: [
    "sociolizy forgot password",
    "smm panel password reset",
    "recover sociolizy account",
    "reset smm panel password",
  ],
  alternates: {
    canonical: "https://sociolizy.com/auth/forgot-password",
  },
  openGraph: {
    title: "Forgot Password - Recover Your Sociolizy Account | Sociolizy",
    description:
      "Reset and recover access to your Sociolizy SMM panel account. Enter your username or email address to receive secure password recovery instructions via email.",
    url: "https://sociolizy.com/auth/forgot-password",
    siteName: "Sociolizy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sociolizy - Password Recovery",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot Password - Recover Your Sociolizy Account | Sociolizy",
    description:
      "Reset and recover access to your Sociolizy SMM panel account. Enter your username or email to receive recovery instructions.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": "https://sociolizy.com/auth/forgot-password#webpage",
      "url": "https://sociolizy.com/auth/forgot-password",
      "name": "Forgot Password - Recover Your Sociolizy Account | Sociolizy",
      "description":
        "Reset and recover access to your Sociolizy SMM panel account.",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://sociolizy.com/#website",
        "url": "https://sociolizy.com",
        "name": "Sociolizy",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://sociolizy.com/auth/forgot-password#breadcrumb",
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
          "name": "Forgot Password",
          "item": "https://sociolizy.com/auth/forgot-password",
        },
      ],
    },
  ],
};

export default function ForgotPasswordPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ForgotPasswordForm />
    </>
  );
}
