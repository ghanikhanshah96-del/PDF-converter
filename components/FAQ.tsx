"use client";

import { useState } from "react";
import type { ToolFaq } from "@/lib/tools";

export function FAQ({
  faqs,
  heading = "Frequently asked questions",
}: {
  faqs: ToolFaq[];
  heading?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-display text-xl font-bold">
        {heading}
      </h2>
      <div className="mt-4 space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const buttonId = `faq-button-${index}`;

          return (
            <div
              key={faq.question}
              className={`rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 ${
                isOpen ? "shadow-[var(--shadow)]" : ""
              }`}
            >
              <h3>
                <button
                  type="button"
                  id={buttonId}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 text-left font-semibold"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
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
              </h3>
              {isOpen && (
                <p
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]"
                >
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
