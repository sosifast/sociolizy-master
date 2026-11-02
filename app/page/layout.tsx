import React from "react";
import GoogleTag from "@/app/components/google-tag";

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

