import React from "react";
import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: {
    absolute: "Best and Cheapest Smm Services in The World! | Sociolizy",
  },
  description:
    "Sociolizy has the Cheapest SMM Panel and 100% High Quality for all social networks. Get the best Instagram panel today! ",
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
    canonical: "https://www.sociolizy.com/auth/register",
  },
  openGraph: {
    title: "Best and Cheapest Smm Services in The World! | Sociolizy",
    description:
      "Sociolizy has the Cheapest SMM Panel and 100% High Quality for all social networks. Get the best Instagram panel today! ",
    url: "https://www.sociolizy.com/auth/register",
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
    title: "Best and Cheapest Smm Services in The World! | Sociolizy",
    description:
      "Sociolizy has the Cheapest SMM Panel and 100% High Quality for all social networks. Get the best Instagram panel today! ",
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
      "@id": "https://www.sociolizy.com/auth/register#webpage",
      "url": "https://www.sociolizy.com/auth/register",
      "name": "Best and Cheapest Smm Services in The World! | Sociolizy",
      "description":
        "Sociolizy has the Cheapest SMM Panel and 100% High Quality for all social networks. Get the best Instagram panel today! ",
      "isPartOf": {
        "@type": "WebSite",
        "@id": "https://www.sociolizy.com/#website",
        "url": "https://www.sociolizy.com",
        "name": "Sociolizy",
      },
      "inLanguage": "en-US",
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://www.sociolizy.com/auth/register#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.sociolizy.com",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Register",
          "item": "https://www.sociolizy.com/auth/register",
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
