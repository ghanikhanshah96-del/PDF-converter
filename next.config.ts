import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  middlewareClientMaxBodySize: "50mb",
  serverExternalPackages: ["firebase-admin"],
  // Keep Node-only optional peer out of browser bundles.
  // Do not put docx/pdf-lib/etc in optimizePackageImports — they are single-entry
  // bundles; barrel-optimizing them breaks the production webpack parse (super/keyword).
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      canvas: "./lib/empty-module.js",
    },
  },
  async headers() {
    return [
      // Zeta WASM needs SharedArrayBuffer → cross-origin isolation on this route only.
      // credentialless allows same-page third parties more easily than require-corp.
      {
        source: "/word-to-pdf-converter-free",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      {
        source: "/word-to-pdf-converter-free/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
      // Engine assets must opt into embedding when isolation is on.
      {
        source: "/engine/:path*",
        headers: [
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/pdf-to-word", destination: "/pdf-to-word-converter-free", permanent: true },
      { source: "/word-to-pdf", destination: "/word-to-pdf-converter-free", permanent: true },
      { source: "/merge-pdf", destination: "/merge-pdf-online-free", permanent: true },
      { source: "/split-pdf", destination: "/split-pdf-online-free", permanent: true },
      { source: "/compress-pdf", destination: "/compress-pdf-free", permanent: true },
      { source: "/pdf-to-jpg", destination: "/pdf-to-jpg-converter-free", permanent: true },
      { source: "/jpg-to-pdf", destination: "/jpg-to-pdf-converter-free", permanent: true },
      { source: "/edit-pdf", destination: "/edit-pdf-online-free", permanent: true },
      { source: "/sign-pdf", destination: "/sign-pdf-online-free", permanent: true },
      { source: "/excel-to-pdf", destination: "/excel-to-pdf-converter", permanent: true },
      { source: "/pdf-to-excel", destination: "/pdf-to-excel-converter", permanent: true },
      { source: "/rotate-pdf", destination: "/rotate-pdf-online", permanent: true },
      { source: "/unlock-pdf", destination: "/protect-pdf-online", permanent: true },
      { source: "/unlock-pdf-online", destination: "/protect-pdf-online", permanent: true },
      { source: "/protect-pdf", destination: "/protect-pdf-online", permanent: true },
      { source: "/pdf-viewer", destination: "/pdf-viewer-online-free", permanent: true },
      { source: "/view-pdf", destination: "/pdf-viewer-online-free", permanent: true },
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/terms", destination: "/terms-and-conditions", permanent: true },
      { source: "/how-to-split-pdf-pages", destination: "/blog/how-to-split-pdf-pages", permanent: true },
      { source: "/how-to-merge-pdf-files", destination: "/blog/how-to-merge-pdf-files", permanent: true },
    ];
  },
};

export default nextConfig;
