"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const GA_ID = "G-MK79VBSCT9";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname() || "";
  const excluded =
    pathname.startsWith("/word-to-pdf-converter-free") ||
    pathname.startsWith("/admin");

  const isFirstPath = useRef(true);
  useEffect(() => {
    if (excluded || typeof window.gtag !== "function") return;
    if (isFirstPath.current) {
      isFirstPath.current = false;
      return;
    }
    window.gtag("config", GA_ID, { page_path: pathname });
  }, [excluded, pathname]);

  if (excluded) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
