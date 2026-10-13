"use client";

import { useId, useState, type ReactNode } from "react";

export function FAQ({
  faqs,
  heading = "Frequently asked questions",
  id,
}: {
  faqs: { question: string; answer: ReactNode }[];
  heading?: string;
  /** Optional anchor so in-page links can scroll to this block. */
  id?: string;
}) {
  const uid = useId();
  const headingId = id ? `${id}-heading` : `${uid}-heading`;
  const [openIndex, setOpenIndex] = useState<number | null>(
    faqs.length > 0 ? 0 : null,
  );

  return (
    <section id={id} className="mt-12 scroll-mt-28" aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="font-display text-xl font-bold sm:text-2xl"
      >
        {heading}
      </h2>
      <div className="mt-4 space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const panelId = `${uid}-panel-${index}`;
          const buttonId = `${uid}-button-${index}`;

          return (
            <div
              key={faq.question}
              className={`rounded-2xl border border-[var(--line)] bg-white px-4 py-3 transition-shadow duration-300 ${
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
                    className="faq-plus shrink-0 text-lg leading-none text-[var(--brand)]"
                    data-open={isOpen ? "true" : "false"}
                    aria-hidden
                  >
                    +
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                aria-hidden={!isOpen}
                className="faq-panel"
                data-open={isOpen ? "true" : "false"}
              >
                <div className="faq-panel-inner" inert={isOpen ? undefined : true}>
                  <p className="pt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
