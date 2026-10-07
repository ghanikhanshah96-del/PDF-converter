import type { ReactNode } from "react";
import Link from "next/link";

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "lead"; text: string }
  | { type: "note"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "h2"; id?: string; text: string }
  | { type: "h3"; text: string }
  | { type: "meta"; text: string }
  | { type: "email"; address: string }
  | { type: "link"; href: string; label: string; before?: string; after?: string };

function richText(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 flex list-none flex-wrap gap-x-6 gap-y-1.5 text-[14px] leading-snug text-[var(--ink)] sm:gap-x-8 sm:text-[15px]">
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-4 before:absolute before:left-0 before:content-['•'] before:text-[var(--brand)]"
        >
          {richText(item)}
        </li>
      ))}
    </ul>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "meta":
      return (
        <p className="mt-1 text-xs text-[var(--ink-muted)] sm:text-sm">
          {block.text}
        </p>
      );
    case "lead":
      return (
        <p className="mt-2 text-[15px] leading-snug text-[var(--ink-muted)] sm:text-base">
          {richText(block.text)}
        </p>
      );
    case "note":
      return (
        <p className="mt-3 rounded-[var(--radius)] bg-[var(--brand-soft)] px-3 py-2.5 text-[13px] leading-snug text-[var(--ink)] sm:px-4 sm:py-3 sm:text-sm">
          {richText(block.text)}
        </p>
      );
    case "p": {
      const t = block.text.trim();
      if (!t || t === "#" || /^#+\s*$/.test(t)) return null;
      return (
        <p className="mt-2 text-[14px] leading-snug text-[var(--ink)] sm:text-[15px]">
          {richText(block.text)}
        </p>
      );
    }
    case "ul":
      return <BulletList items={block.items} />;
    case "h2":
      return (
        <h2
          id={block.id}
          className="scroll-mt-24 mt-5 font-display text-lg font-semibold text-[var(--ink)] sm:mt-6 sm:text-xl"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3 className="mt-3 font-display text-[15px] font-semibold text-[var(--ink)] sm:text-base">
          {block.text}
        </h3>
      );
    case "email":
      return (
        <p className="mt-1.5">
          <a
            href={`mailto:${block.address}`}
            className="text-sm font-semibold text-[var(--brand)] underline underline-offset-2 hover:text-[var(--brand-deep)]"
          >
            {block.address}
          </a>
        </p>
      );
    case "link":
      return (
        <p className="mt-2 text-[14px] leading-snug sm:text-[15px]">
          {block.before}
          <Link
            href={block.href}
            className="font-semibold text-[var(--brand)] underline underline-offset-2 hover:text-[var(--brand-deep)]"
          >
            {block.label}
          </Link>
          {block.after}
        </p>
      );
    default:
      return null;
  }
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </>
  );
}

export function ContentPage({
  eyebrow,
  title,
  blocks,
  aside,
  /** When true, render only the article card (no outer page padding/container). */
  nested = false,
}: {
  eyebrow?: string;
  title: string;
  blocks: ContentBlock[];
  aside?: ReactNode;
  nested?: boolean;
}) {
  const article = (
    <article className="min-w-0 rounded-[var(--radius)] border border-[var(--line)] bg-white px-4 py-4 shadow-[var(--shadow)] sm:px-5 sm:py-5 md:px-6 md:py-6">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)] sm:text-xs">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1 font-display text-[clamp(1.5rem,4.5vw,2.25rem)] font-bold leading-tight text-[var(--ink)]">
        {title}
      </h1>
      <div className="mt-1">
        <ContentBlocks blocks={blocks} />
      </div>
    </article>
  );

  if (nested) {
    return aside ? (
      <div className="grid gap-4 lg:grid-cols-[1fr_minmax(0,20rem)] lg:items-start lg:gap-5">
        {article}
        <aside className="min-w-0">{aside}</aside>
      </div>
    ) : (
      article
    );
  }

  return (
    <div className="bg-[var(--bg-a)] py-5 sm:py-8 md:py-10">
      <div
        className={[
          "site-container",
          aside
            ? "grid gap-4 lg:grid-cols-[1fr_minmax(0,20rem)] lg:items-start lg:gap-5"
            : "",
        ].join(" ")}
      >
        {article}
        {aside && <aside className="min-w-0">{aside}</aside>}
      </div>
    </div>
  );
}
