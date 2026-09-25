import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
};

export default nextConfig;
