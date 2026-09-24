import Link from "next/link";
import type { ToolDefinition } from "@/lib/tools";
import { getRelatedTools } from "@/lib/tools";
import type { RelatedVariant } from "@/lib/content/toolLayouts";

export function RelatedTools({
  tool,
  variant = "grid",
}: {
  tool: ToolDefinition;
  variant?: RelatedVariant;
}) {
  const related = getRelatedTools(tool);
  if (!related.length) return null;

  if (variant === "chips") {
    return (
      <section className="mt-12" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-display text-xl font-bold">
          Related tools
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {related.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  if (variant === "list") {
    return (
      <section className="mt-12" aria-labelledby="related-heading">
        <h2 id="related-heading" className="font-display text-xl font-bold">
          Related tools
        </h2>
        <ul className="mt-4 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-white">
          {related.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex flex-col gap-1 px-4 py-3 transition hover:bg-[var(--brand-soft)] sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-semibold">{item.name}</span>
                <span className="text-sm text-[var(--ink-muted)]">
                  {item.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="mt-12" aria-labelledby="related-heading">
      <h2 id="related-heading" className="font-display text-xl font-bold">
        Related tools
      </h2>
      <p className="mt-1 text-sm text-[var(--ink-muted)]">
        Keep working locally with these nearby utilities.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {related.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="block rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 transition hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[var(--shadow)]"
            >
              <span className="font-semibold text-[var(--ink)]">{item.name}</span>
              <span className="mt-1 block text-sm text-[var(--ink-muted)]">
                {item.summary}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
