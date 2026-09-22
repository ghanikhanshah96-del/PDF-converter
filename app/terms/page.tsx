import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Terms of Use | ${SITE.name}`,
  description:
    "Terms for using best free pdf converter: free personal use, conversion quality disclaimer, and no password cracking.",
  alternates: { canonical: `${SITE.url}/terms` },
};

export default function TermsPage() {
  return (
    <article className="site-container py-12">
      <h1 className="font-display text-4xl font-bold tracking-tight">
        Terms of Use
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">
        Last updated: September 15, 2026
      </p>

      <div className="mt-8 space-y-6 leading-relaxed">
        <p>
          By using {SITE.name} at {SITE.domain}, you agree to these terms.
        </p>

        <h2 className="font-display text-2xl font-bold">Free personal use</h2>
        <p>
          The toolkit is provided free for personal and reasonable business use
          subject to these terms. Do not abuse the service, attempt to disrupt
          hosting, or scrape the site in a way that harms availability.
        </p>

        <h2 className="font-display text-2xl font-bold">
          Conversion quality disclaimer
        </h2>
        <p>
          Tools are best-effort and browser-based. Output may differ from
          desktop software, especially for complex layouts, scanned documents
          without OCR, macros, charts, or advanced Office formatting. We do not
          guarantee pixel-perfect conversions or uninterrupted availability.
        </p>

        <h2 className="font-display text-2xl font-bold">
          Passwords and protected files
        </h2>
        <p>
          Unlock / password remover tools only work when you supply the correct
          password for a file you own or are authorized to open. You must not
          use these tools to access documents without permission. We do not
          provide password cracking or bypass of unknown credentials.
        </p>

        <h2 className="font-display text-2xl font-bold">Your responsibility</h2>
        <p>
          You are responsible for the files you process and for complying with
          applicable laws. Keep backups of important documents before editing.
        </p>

        <h2 className="font-display text-2xl font-bold">Limitation of liability</h2>
        <p>
          The service is provided “as is” without warranties of any kind. To the
          fullest extent permitted by law, {SITE.name} is not liable for data
          loss, inaccurate conversions, or damages arising from use of the
          tools.
        </p>

        <p>
          See also our{" "}
          <Link href="/privacy" className="text-[var(--brand)] underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </article>
  );
}
