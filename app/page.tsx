import type { Metadata } from "next";
import Link from "next/link";
import { HomeToolsFilter } from "@/components/HomeToolsFilter";
import { FAQ } from "@/components/FAQ";
import { homeContent } from "@/lib/content/home";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: homeContent.seoTitle,
  description: homeContent.metaDescription,
  keywords: [...homeContent.keywords],
  alternates: { canonical: SITE.url },
  openGraph: {
    title: homeContent.seoTitle,
    description: homeContent.metaDescription,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: homeContent.seoTitle,
    description: homeContent.metaDescription,
  },
};

export default function HomePage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeContent.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="bg-[var(--bg-a)] py-10 sm:py-14">
        <div className="site-container text-center">
          <h1 className="font-display text-[clamp(2rem,7vw,3.25rem)] font-semibold leading-tight text-[var(--ink)]">
            {homeContent.hero.h1}
          </h1>
          {homeContent.hero.paragraphs.map((p) => (
            <p
              key={p.slice(0, 40)}
              className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg"
            >
              {p}
            </p>
          ))}
          <Link href={homeContent.hero.ctaHref} className="btn btn-primary mt-6">
            {homeContent.hero.ctaLabel}
          </Link>
        </div>
      </section>

      <section className="bg-white pt-10">
        <div className="site-container mb-6 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            {homeContent.toolsIntro.heading}
          </h2>
          {homeContent.toolsIntro.paragraphs.map((p) => (
            <p
              key={p.slice(0, 40)}
              className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base"
            >
              {p}
            </p>
          ))}
        </div>
        <HomeToolsFilter heading="All PDF tools" />
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="site-container">
          <h2 className="text-center font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            {homeContent.whyChoose.heading}
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            {homeContent.whyChoose.intro}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {homeContent.whyChoose.items.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-[var(--line)] bg-[var(--bg-a)] p-5"
              >
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="site-container">
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            {homeContent.howItWorks.heading}
          </h2>
          <p className="mt-3 text-sm text-[var(--ink-muted)] sm:text-base">
            {homeContent.howItWorks.intro}
          </p>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {homeContent.howItWorks.steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-[var(--line)] bg-white p-5"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[var(--bg-a)] py-12 sm:py-16">
        <div className="site-container">
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            {homeContent.capabilities.heading}
          </h2>
          <p className="mt-3 text-sm text-[var(--ink-muted)] sm:text-base">
            {homeContent.capabilities.intro}
          </p>
          <ul className="mt-4 grid list-disc gap-2 pl-5 text-sm text-[var(--ink-muted)] sm:grid-cols-2 sm:text-base">
            {homeContent.capabilities.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--ink-muted)] sm:text-base">
            {homeContent.capabilities.outro}
          </p>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="site-container">
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            {homeContent.audiences.heading}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {homeContent.audiences.items.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-[var(--line)] p-5"
              >
                <h3 className="font-display text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="site-container pb-4">
        <FAQ
          faqs={[...homeContent.faqs]}
          heading="Frequently Asked Questions About PDF Tools"
        />
      </div>

      <section className="bg-[#fff2f2] py-12 sm:py-16">
        <div className="site-container text-center">
          <h2 className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
            {homeContent.finalCta.heading}
          </h2>
          {homeContent.finalCta.paragraphs.map((p) => (
            <p
              key={p.slice(0, 40)}
              className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base"
            >
              {p}
            </p>
          ))}
          <Link
            href={homeContent.finalCta.ctaHref}
            className="btn btn-primary mt-6"
          >
            {homeContent.finalCta.ctaLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
