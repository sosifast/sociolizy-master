import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/app/components/posthog-provider";
import { PostHogErrorBoundary } from "@/app/components/posthog-error-boundary";
import gscConfig from "@/app/data/gsc.json";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://sociolizy.com"),
  title: {
    default: "Sociolizy - #1 Best & Cheapest SMM Panel & Crypto Payment Gateway",
    template: "%s | Sociolizy",
  },
  description:
    "Sociolizy is the #1 cheapest automated SMM panel for Instagram, TikTok, YouTube, Telegram & Facebook with instant wholesale delivery, direct API, and white-label crypto payment gateway.",
  keywords: [
    "SMM panel",
    "cheapest smm panel",
    "best smm panel",
    "sociolizy",
    "reseller smm panel",
    "crypto payment gateway",
    "merchant payment gateway",
    "accept usdt",
    "instagram smm panel",
    "tiktok smm panel",
    "youtube smm panel",
    "telegram smm panel",
  ],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Sociolizy - #1 Best & Cheapest SMM Panel & Crypto Payment Gateway",
    description:
      "Grow your social presence with Sociolizy. Automated wholesale SMM services and 100% white-label cryptocurrency payment gateway.",
    url: "https://sociolizy.com",
    siteName: "Sociolizy",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sociolizy - Your Ultimate SMM & Crypto Partner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sociolizy - #1 Best & Cheapest SMM Panel for Resellers",
    description:
      "The cheapest automated SMM panel and direct crypto payment gateway for merchants.",
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
  other: {
    "llms-txt": "/llms.txt",
    "ai-content-declaration": "indexed",
  },
};

const aiJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://sociolizy.com/#website",
      "url": "https://sociolizy.com",
      "name": "Sociolizy",
      "description": "The #1 cheapest automated wholesale SMM reseller panel and white-label cryptocurrency merchant payment gateway.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://sociolizy.com/services?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://sociolizy.com/#organization",
      "name": "Sociolizy",
      "url": "https://sociolizy.com",
      "logo": "https://sociolizy.com/logo/logo.png"
    },
    {
      "@type": "SoftwareApplication",
      "name": "Sociolizy SMM & Crypto Payment Gateway",
      "operatingSystem": "All",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "0.001",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Sociolizy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sociolizy is an enterprise wholesale SMM reseller panel providing high-speed social media marketing fulfillment alongside a 100% white-label cryptocurrency payment gateway for online merchants."
          }
        },
        {
          "@type": "Question",
          "name": "How to accept cryptocurrency payments on my website?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Using Sociolizy Merchant Payment Gateway, you can connect your website domain, generate API keys, and accept instant cryptocurrency checkouts with automated webhook callbacks and zero external gateway branding."
          }
        },
        {
          "@type": "Question",
          "name": "Which cryptocurrencies are supported on Sociolizy?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sociolizy supports USDT (TRC20, BEP20, Polygon), USDC, Bitcoin (BTC), Ethereum (ETH), TRON (TRX), Solana (SOL), Toncoin (TON), and Litecoin (LTC)."
          }
        }
      ]
    }
  ]
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
      className={`${geistMono.variable} antialiased scroll-smooth`}
    >
      <head>
        {/* LLM & AI Search Indexer Discovery Links */}
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLM Knowledge Index" />
        <link rel="llms-txt" href="/llms.txt" />

        {/* Google Fonts: Plus Jakarta Sans CDN (Regular 400 default) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />

        {/* Animate UI & Motion Animation CDNs (https://animate-ui.com/docs) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@animate-ui/react@latest/dist/index.css"
        />

        {/* Spectrum UI CDN (https://ui.spectrumhq.in/docs) */}
        <link
          rel="stylesheet"
          href="https://ui.spectrumhq.in/cdn/spectrum-ui.css"
        />

        {/* AI & Search Engine Structured Data (JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(aiJsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-white text-slate-900 font-sans font-normal selection:bg-emerald-500 selection:text-white"
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
