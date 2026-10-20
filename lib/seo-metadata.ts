import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export function absoluteUrl(path: string): string {
  const base = SITE.url.replace(/\/$/, "");
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords?.length ? { keywords: opts.keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: "website",
      siteName: SITE.name,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}

export function buildArticleMetadata(opts: {
  title: string;
  description: string;
  path: string;
  publishedTime: string;
  modifiedTime?: string;
  ogImageUrl: string;
  tags?: string[];
}): Metadata {
  const url = absoluteUrl(opts.path);
  const images = [
    {
      url: opts.ogImageUrl,
      width: 1200,
      height: 630,
      alt: opts.title,
    },
  ];
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: "article",
      publishedTime: opts.publishedTime,
      modifiedTime: opts.modifiedTime ?? opts.publishedTime,
      authors: [SITE.name],
      siteName: SITE.name,
      locale: "en_US",
      ...(opts.tags?.length ? { tags: opts.tags } : {}),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [opts.ogImageUrl],
    },
  };
}
