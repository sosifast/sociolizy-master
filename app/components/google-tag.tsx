import Script from "next/script";

export default function GoogleTag() {
  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-XYHHN73Q6P"
      />
      <Script id="google-tag-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-XYHHN73Q6P');
        `}
      </Script>
    </>
  );
}
