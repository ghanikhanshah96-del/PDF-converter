"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Google Analytics must not run on Word→PDF: that route uses COEP and needs
 * cross-origin isolation for the WASM document engine.
 */
export function Analytics() {
  const pathname = usePathname() || "";
  if (pathname.startsWith("/word-to-pdf-converter-free")) {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-MK79VBSCT9"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-MK79VBSCT9');
        `}
      </Script>
    </>
  );
}
