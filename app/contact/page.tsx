import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contact Us | ${SITE.name}`,
  description:
    "Contact best free pdf converter for feedback, support questions, and privacy requests.",
  alternates: { canonical: `${SITE.url}/contact` },
};

export default function ContactPage() {
  const email = `support@${SITE.domain}`;

  return (
    <div className="bg-[var(--bg-a)] py-12 sm:py-16">
      <div className="site-container grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-[0_2px_12px_rgba(22,22,22,0.05)] sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
            Contact us
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-[var(--ink)]">
            We are here to help with PDF tools
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[var(--ink-muted)]">
            Send feedback, report a broken conversion flow, or ask a privacy
            question. Include the tool name and browser if you are reporting an
            issue.
          </p>

          <div className="mt-8 space-y-4 text-sm">
            <div className="rounded-lg bg-[var(--brand-soft)] p-4">
              <p className="font-semibold text-[var(--ink)]">Email</p>
              <a
                href={`mailto:${email}`}
                className="mt-1 inline-flex font-semibold text-[var(--brand)] underline"
              >
                {email}
              </a>
            </div>
            <div className="rounded-lg bg-[var(--bg-c)] p-4">
              <p className="font-semibold text-[var(--ink)]">Fast answers</p>
              <p className="mt-1 text-[var(--ink-muted)]">
                Most tool questions are answered on each converter page under
                the FAQ section.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-[0_2px_12px_rgba(22,22,22,0.05)] sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
            Send a message
          </h2>
          <ContactForm supportEmail={email} />
        </section>
      </div>
    </div>
  );
}
