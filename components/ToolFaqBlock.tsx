"use client";

import { useState } from "react";
import type { ToolFaq } from "@/lib/tools";
import type { FaqVariant } from "@/lib/content/toolLayouts";

export function ToolFaqBlock({
  faqs,
  heading,
  variant,
}: {
  faqs: ToolFaq[];
  heading: string;
  variant: FaqVariant;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(
    variant === "stacked-panel" ? 0 : null,
  );

  if (variant === "two-column") {
    return (
      <section className="mt-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-xl font-bold sm:text-2xl">
          {heading}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-[var(--line)] bg-white p-4"
            >
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "stacked-panel") {
    return (
      <section className="mt-12" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-xl font-bold sm:text-2xl">
          {heading}
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--line)]">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="border-b border-[var(--line)] last:border-b-0"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 bg-[var(--bg-a)] px-4 py-3 text-left font-semibold"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpenIndex((current) => (current === index ? null : index))
                  }
                >
                  {faq.question}
                  <span className="text-[var(--brand)]" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <p className="bg-white px-4 py-3 text-sm leading-relaxed text-[var(--ink-muted)]">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // accordion (single open) — mirrors FAQ.tsx behavior
  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-display text-xl font-bold sm:text-2xl">
        {heading}
      </h2>
      <div className="mt-4 space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className={`rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 ${
                isOpen ? "shadow-[var(--shadow)]" : ""
              }`}
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left font-semibold"
                aria-expanded={isOpen}
                onClick={() =>
                  setOpenIndex((current) => (current === index ? null : index))
                }
              >
                <span>{faq.question}</span>
                <span
                  className={`shrink-0 text-[var(--brand)] transition ${
                    isOpen ? "rotate-45" : ""
                  }`}
                  aria-hidden
                >
                  +
                </span>
              </button>
              {isOpen && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
