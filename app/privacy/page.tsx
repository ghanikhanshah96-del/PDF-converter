import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE.name}`,
  description:
    "best free pdf converter processes files in your browser. We do not upload, store, or access your documents on a server.",
  alternates: { canonical: `${SITE.url}/privacy` },
};

export default function PrivacyPage() {
  return (
    <div className="bg-[var(--bg-a)] py-12 sm:py-16">
      <article className="site-container rounded-lg border border-[var(--line)] bg-white py-6 shadow-[0_2px_12px_rgba(22,22,22,0.05)] sm:py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
          Privacy
        </p>
        <h1 className="mt-2 font-display text-[clamp(2rem,6vw,3.75rem)] font-semibold leading-tight text-[var(--ink)]">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-muted)]">
          Last updated: September 21, 2026
        </p>

        <div className="mt-8 space-y-6 text-[var(--ink)] leading-relaxed">
          <p className="rounded-lg bg-[var(--brand-soft)] p-5">
            {SITE.name} ({SITE.domain}) is built around a simple rule:{" "}
            <strong>your files never leave your device</strong> for core PDF
            tools. Processing happens in your browser using client-side
            JavaScript libraries.
          </p>

          <h2
            id="local-conversion"
            className="scroll-mt-24 font-display text-2xl font-semibold"
          >
            Local conversion
          </h2>
          <p>
            All core PDF tools convert and process files entirely in your
            browser on this device. Your documents are not sent to our servers
            for conversion.
          </p>

          <h2
            id="no-uploads"
            className="scroll-mt-24 font-display text-2xl font-semibold"
          >
            No uploads for tools
          </h2>
          <p>
            When you use merge, split, compress, convert, edit, sign, unlock,
            or related utilities on this site, selected files are read locally
            in your browser. We do not operate a file-upload API for these
            tools, and we do not receive or store your documents on our servers.
          </p>

          <h2
            id="no-accounts"
            className="scroll-mt-24 font-display text-2xl font-semibold"
          >
            No accounts required
          </h2>
          <p>
            Core tools do not require an account. If we add optional accounts or
            cloud features later, we will update this policy and clearly
            separate those flows from local processing.
          </p>

          <h2 className="font-display text-2xl font-semibold">
            Hosting and analytics
          </h2>
          <p>
            The website itself is hosted by a provider such as Vercel. The host
            may process standard request logs, including IP address, user agent,
            and requested URL, needed to serve pages. If we enable
            privacy-respectful analytics in the future, we will disclose the
            provider and settings here.
          </p>

          <h2 className="font-display text-2xl font-semibold">Cookies</h2>
          <p>
            We do not use advertising cookies for the core toolkit. Essential
            cookies may be set by the hosting platform for security or
            performance.
          </p>

          <h2 className="font-display text-2xl font-semibold">Contact</h2>
          <p>
            Questions about privacy: reach out through our{" "}
            <Link href="/contact" className="text-[var(--brand)] underline">
              Contact
            </Link>{" "}
            page.
          </p>
        </div>
      </article>
    </div>
  );
}
