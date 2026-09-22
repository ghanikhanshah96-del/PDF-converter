import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `About | ${SITE.name}`,
  description:
    "best free pdf converter is a privacy-first suite of free browser-based PDF tools for bestfreepdfconverter.com.",
  alternates: { canonical: `${SITE.url}/about` },
};

export default function AboutPage() {
  return (
    <div className="bg-[var(--bg-a)] py-12 sm:py-16">
      <article className="site-container rounded-lg border border-[var(--line)] bg-white py-6 shadow-[0_2px_12px_rgba(22,22,22,0.05)] sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
          About us
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,3.75rem)] font-semibold leading-tight text-[var(--ink)]">
          Free PDF tools that respect your files
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--ink-muted)]">
          {SITE.name} is an all-in-one hub of free PDF utilities for{" "}
          <strong className="text-[var(--ink)]">{SITE.domain}</strong>. Core
          tools run in your browser so documents stay on your device.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Convert", "PDF, Word, Excel, JPG, and everyday document formats."],
            ["Organize", "Merge, split, rotate, compress, and prepare clean files."],
            ["Protect", "Unlock known-password PDFs and sign documents locally."],
          ].map(([title, text]) => (
            <section
              key={title}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg-a)] p-4"
            >
              <h2 className="font-display text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                {text}
              </p>
            </section>
          ))}
        </div>

        <div className="mt-8 space-y-6 leading-relaxed">
          <h2 className="font-display text-2xl font-semibold">Honest scope</h2>
          <p>
            Browser-only processing means useful free tools, not desktop-suite
            fidelity. We avoid deceptive perfect-conversion claims and document
            limitations such as no OCR for scanned PDFs and no password
            cracking.
          </p>

          <p>
            <Link href="/#tools" className="btn btn-primary inline-flex">
              Explore tools
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
