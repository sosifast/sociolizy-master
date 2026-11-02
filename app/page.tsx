import type { Metadata } from "next";
import gscConfig from "@/app/data/gsc.json";
import HomePageContent from "@/app/components/home-page-content";

export const metadata: Metadata = {
  title: "The Best Social Media Panel in The Market! - MasterSMM",
  description:
    "Manage all social media networks from a single panel, quality and cheap. We provide services on Instagram, Twitter, Facebook, YouTube, TikTok, Spotify and more.",
  verification: {
    google: gscConfig.googleSiteVerification || gscConfig.content,
  },
};

export default function HomePage() {
  const verificationCode = gscConfig.googleSiteVerification || gscConfig.content;

  return (
    <>
      {/* Explicit meta tag for Google Search Console verification */}
      {verificationCode && (
        <meta name="google-site-verification" content={verificationCode} />
      )}
      <HomePageContent />
    </>
  );
}
