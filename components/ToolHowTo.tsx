import type { HowToVariant } from "@/lib/content/toolLayouts";

export function ToolHowTo({
  toolName,
  steps,
  variant,
}: {
  toolName: string;
  steps: string[];
  variant: HowToVariant;
}) {
  const heading = `How to use ${toolName}`;

  if (variant === "horizontal-rail") {
    return (
      <section className="mt-12" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="font-display text-xl font-bold">
          {heading}
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li
              key={step}
              className="relative rounded-2xl border border-[var(--line)] bg-white p-4"
            >
              <span className="text-3xl font-bold text-[var(--brand)]/25">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (variant === "timeline") {
    return (
      <section className="mt-12" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="font-display text-xl font-bold">
          {heading}
        </h2>
        <ol className="relative mt-6 space-y-0 border-l-2 border-[var(--brand)] pl-6">
          {steps.map((step, i) => (
            <li key={step} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[1.55rem] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand)] text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed sm:text-base">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  if (variant === "checklist") {
    return (
      <section className="mt-12" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="font-display text-xl font-bold">
          {heading}
        </h2>
        <ul className="mt-4 space-y-2 rounded-2xl border border-[var(--line)] bg-[var(--bg-a)] p-4">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex gap-3 rounded-lg bg-white px-3 py-3 text-sm leading-relaxed"
            >
              <span
                className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-[var(--brand)] text-[10px] font-bold text-[var(--brand)]"
                aria-hidden
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (variant === "compact-list") {
    return (
      <section className="mt-12" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="font-display text-xl font-bold">
          {heading}
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    );
  }

  // numbered-cards (default)
  return (
    <section className="mt-12" aria-labelledby="howto-heading">
      <h2 id="howto-heading" className="font-display text-xl font-bold">
        {heading}
      </h2>
      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => (
          <li
            key={step}
            className="flex gap-3 rounded-xl border border-[var(--line)] bg-white/70 px-4 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5 text-sm leading-relaxed sm:text-base">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
