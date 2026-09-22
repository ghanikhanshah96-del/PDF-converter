import type { ToolFaq } from "@/lib/tools";

export function FAQ({
  faqs,
  heading = "Frequently asked questions",
}: {
  faqs: ToolFaq[];
  heading?: string;
}) {
  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="font-display text-xl font-bold">
        {heading}
      </h2>
      <div className="mt-4 space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 open:shadow-[var(--shadow)]"
          >
            <summary className="cursor-pointer list-none font-semibold marker:content-none">
              <span className="flex items-center justify-between gap-3">
                {faq.question}
                <span className="text-[var(--brand)] transition group-open:rotate-45">
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
