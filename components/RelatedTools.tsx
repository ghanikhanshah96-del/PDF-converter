import Link from "next/link";
import type { ToolDefinition } from "@/lib/tools";
import { getRelatedTools } from "@/lib/tools";

export function RelatedTools({ tool }: { tool: ToolDefinition }) {
  const related = getRelatedTools(tool);
  if (!related.length) return null;

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
