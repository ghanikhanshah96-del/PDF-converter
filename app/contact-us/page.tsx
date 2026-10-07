import type { Metadata } from "next";
import Image from "next/image";
import { ContactForm } from "@/components/ContactForm";
import { ContentPage } from "@/components/ContentPage";
import {
  contactBlocks,
  contactMeta,
  contactTitle,
} from "@/lib/content/legal/contact";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: contactMeta.title,
  description: contactMeta.description,
  alternates: { canonical: `${SITE.url}/contact-us` },
};

export default function ContactPage() {
  const email = `support@${SITE.domain}`;

  return (
    <div className="bg-[var(--bg-a)] py-5 sm:py-8 md:py-10">
      <div className="site-container space-y-4 sm:space-y-5">
        <section className="overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-white shadow-[var(--shadow)]">
          <div className="grid lg:grid-cols-2 lg:items-stretch">
            {/* Contact-themed visual */}
            <div className="relative flex flex-col justify-center bg-[linear-gradient(165deg,#fff0f0_0%,#fff8f8_50%,#f3f7ff_100%)] px-5 py-6 sm:px-7 sm:py-8 lg:px-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)] sm:text-xs">
                Get in touch
              </p>
              <h2 className="mt-2 max-w-md font-display text-xl font-bold leading-snug text-[var(--ink)] sm:text-2xl">
                Message our team — we read every note about tools, privacy, and
                ideas.
              </h2>
              <p className="mt-2 max-w-md text-sm leading-snug text-[var(--ink-muted)]">
                Prefer email? Use the form, or write us at{" "}
                <a
                  href={`mailto:${email}`}
                  className="font-semibold text-[var(--brand)] underline underline-offset-2"
                >
                  {email}
                </a>
                .
              </p>
              <div className="relative mx-auto mt-5 w-full max-w-[360px] sm:max-w-[400px] lg:mt-6 lg:max-w-none">
                <Image
                  src="/assets/free/contact-support.svg"
                  alt="Contact support: email, chat messages, and headset"
                  width={640}
                  height={480}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
              <ul className="mt-4 grid gap-2 text-sm text-[var(--ink)] sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  ["Email", "Send a clear request"],
                  ["Chat-ready", "We reply when we can"],
                  ["Support", "Tools & privacy help"],
                ].map(([title, text]) => (
                  <li
                    key={title}
                    className="rounded-[var(--radius)] border border-[var(--line)] bg-white/80 px-3 py-2"
                  >
                    <p className="font-semibold text-[var(--brand-deep)]">
                      {title}
                    </p>
                    <p className="text-xs text-[var(--ink-muted)]">{text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Form */}
            <div className="border-t border-[var(--line)] px-4 py-5 sm:px-6 sm:py-6 md:px-8 lg:border-l lg:border-t-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)] sm:text-xs">
                Contact
              </p>
              <h1 className="mt-1 font-display text-[clamp(1.5rem,4.5vw,2.25rem)] font-bold leading-tight text-[var(--ink)]">
                {contactTitle}
              </h1>
              <p className="mt-2 text-[15px] leading-snug text-[var(--ink-muted)]">
                Include the tool name and browser when reporting a problem. Do
                not attach confidential documents.
              </p>
              <ContactForm supportEmail={email} />
            </div>
          </div>
        </section>

        <ContentPage
          nested
          eyebrow="Helpful details"
          title="Before you write"
          blocks={contactBlocks}
        />
      </div>
    </div>
  );
}
