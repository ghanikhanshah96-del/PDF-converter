import Link from "next/link";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import type { ToolDefinition } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { PrivacyCallout } from "@/components/PrivacyCallout";
import { FAQ } from "@/components/FAQ";
import { RelatedTools } from "@/components/RelatedTools";
import { ToolJsonLd } from "@/components/ToolJsonLd";

export function toolMetadata(tool: ToolDefinition): Metadata {
  const url = `${SITE.url}${tool.href}`;
  return {
    title: tool.title,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: tool.title,
      description: tool.metaDescription,
      url,
      siteName: SITE.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.title,
      description: tool.metaDescription,
    },
  };
}

export function ToolPageShell({
  tool,
  children,
  notice,
}: {
  tool: ToolDefinition;
  children: ReactNode;
  notice?: ReactNode;
}) {
  return (
    <div className="site-container py-6 sm:py-12">
      <ToolJsonLd tool={tool} />
      <nav className="text-sm text-[var(--ink-muted)]" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[var(--brand)]">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-[var(--ink)]">{tool.name}</li>
        </ol>
      </nav>

      <p className="mt-5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-[var(--brand)]">
        {SITE.name}
      </p>
      <h1 className="mt-2 font-display text-[clamp(2rem,9vw,2.5rem)] font-bold leading-tight sm:text-4xl">
        {tool.h1}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
        {tool.description}
      </p>

      <PrivacyCallout className="mt-6" />
      {notice}

      <div className="mt-6">{children}</div>

      <section className="mt-12" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="font-display text-xl font-bold">
          How to use {tool.name}
        </h2>
        <ol className="mt-4 space-y-3">
          {tool.howTo.map((step, i) => (
            <li
              key={step}
              className="flex gap-3 rounded-xl border border-[var(--line)] bg-white/70 px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed sm:text-base">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <FAQ faqs={tool.faqs} />
      <RelatedTools tool={tool} />
    </div>
  );
}
