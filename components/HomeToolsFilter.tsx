"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ToolIcon } from "@/components/ToolIcon";
import { CATEGORY_LABELS, tools, type ToolCategory } from "@/lib/tools";

const categoryOrder: ToolCategory[] = [
  "convert",
  "organize",
  "optimize",
  "edit",
  "secure",
];

type ActiveCategory = "all" | ToolCategory;

const filterOptions: { id: ActiveCategory; label: string }[] = [
  { id: "all", label: "All tools" },
  ...categoryOrder.map((category) => ({
    id: category,
    label: CATEGORY_LABELS[category],
  })),
];

export function HomeToolsFilter({
  heading = "Choose your PDF tool",
  intro,
}: {
  heading?: string;
  intro?: string;
} = {}) {
  const [active, setActive] = useState<ActiveCategory>("all");

  const visibleTools = useMemo(() => {
    if (active === "all") {
      return tools;
    }

    return tools.filter((tool) => tool.category === active);
  }, [active]);

  return (
    <section
      id="tools"
      className="site-container pb-14"
      aria-labelledby="tools-heading"
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="tools-heading"
            className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl"
          >
            {heading}
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {intro ?? `${visibleTools.length} fast browser tools available`}
          </p>
        </div>

        <div
          className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-end sm:overflow-visible"
          aria-label="Tool categories"
        >
          {filterOptions.map((option) => {
            const isActive = option.id === active;

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(option.id)}
                className={[
                  "min-h-10 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
                  isActive
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white shadow-[0_8px_20px_rgba(229,50,45,0.22)]"
                    : "border-[var(--line)] bg-white text-[var(--ink-muted)] hover:border-[var(--brand)] hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleTools.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group flex min-h-[150px] flex-col rounded-lg border border-[var(--line)] bg-white p-5 shadow-[0_2px_10px_rgba(22,22,22,0.04)] transition hover:-translate-y-0.5 hover:border-[rgba(229,50,45,0.35)] hover:shadow-[var(--shadow)]"
          >
            <ToolIcon id={tool.id} />
            <span className="mt-4 font-display text-lg font-semibold text-[var(--ink)] group-hover:text-[var(--brand)]">
              {tool.name}
            </span>
            <span className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
              {tool.summary}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
