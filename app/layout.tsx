import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { SiteChrome } from "@/components/SiteChrome";
import { SITE } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: true,
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.seoTitle,
    template: `%s`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "free PDF converter",
    "online PDF tools",
    "PDF converter online",
    "PDF tools free",
    "convert PDF online",
    "PDF editor online",
    "compress PDF online",
    "merge PDF online",
    "PDF file converter",
    "bestfreepdfconverter",
  ],
  authors: [{ name: SITE.name }],
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "192x192" }],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.seoTitle,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.seoTitle,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE.url,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9309280380486229"
          crossOrigin="anonymous"
        />
        <meta
          name="google-site-verification"
          content="DitQAgl2NUL0gASsHbsDC7lX9Fbp7UcDc_nC33zPE-4"
        />
      </head>
      <body
        className={`${outfit.variable} ${sourceSans.variable} flex min-h-screen flex-col antialiased`}
      >
        <Analytics />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
