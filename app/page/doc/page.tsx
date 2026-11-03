import type { Metadata } from "next";
import ApiDocumentationClient from "./doc-client";

export const metadata: Metadata = {
  title: {
    absolute: "API Documentation - SMM Reseller REST API | Sociolizy",
  },
  description:
    "Official REST API documentation for Sociolizy. Integrate high-speed automated social media order placement, status tracking, balance inquiries, and webhooks.",
  alternates: {
    canonical: "https://sociolizy.com/page/doc",
  },
  openGraph: {
    title: "API Documentation - SMM Reseller REST API | Sociolizy",
    description:
      "Official REST API documentation for Sociolizy. Integrate high-speed automated social media order placement, status tracking, balance inquiries, and webhooks.",
    url: "https://sociolizy.com/page/doc",
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
    title: "API Documentation - SMM Reseller REST API | Sociolizy",
    description:
      "Official REST API documentation for Sociolizy. Integrate high-speed automated social media order placement.",
    images: ["/og-image.jpg"],
  },
};

export default function ApiDocumentationPage() {
  return <ApiDocumentationClient />;
}
