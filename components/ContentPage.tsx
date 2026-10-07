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

function bulletGridClass(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2";
  if (count === 3) return "grid-cols-1 sm:grid-cols-3";
  if (count === 4) return "grid-cols-2 lg:grid-cols-4";
  if (count <= 6) return "grid-cols-2 sm:grid-cols-3";
  return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul
      className={`mt-3 grid w-full list-none gap-x-4 gap-y-2 text-[14px] leading-snug text-[var(--ink)] sm:text-[15px] ${bulletGridClass(items.length)}`}
    >
      {items.map((item) => (
        <li
          key={item}
          className="relative min-w-0 rounded-lg bg-[var(--bg-a)] px-3 py-2 pl-7 before:absolute before:left-2.5 before:top-2 before:content-['•'] before:text-[var(--brand)]"
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
        <p className="text-xs text-[var(--ink-muted)] sm:text-sm">{block.text}</p>
      );
    case "lead":
      return (
        <p className="w-full text-[15px] leading-relaxed text-[var(--ink-muted)] sm:text-base">
          {richText(block.text)}
        </p>
      );
    case "note":
      return (
        <p className="w-full rounded-[var(--radius)] border border-[var(--brand)]/15 bg-[var(--brand-soft)] px-3 py-2.5 text-[13px] leading-relaxed text-[var(--ink)] sm:px-4 sm:py-3 sm:text-sm">
          {richText(block.text)}
        </p>
      );
    case "p": {
      const t = block.text.trim();
      if (!t || t === "#" || /^#+\s*$/.test(t)) return null;
      return (
        <p className="w-full text-[14px] leading-relaxed text-[var(--ink)] sm:text-[15px]">
          {richText(block.text)}
        </p>
      );
    }
    case "ul":
      return <BulletList items={block.items} />;
    case "h3":
      return (
        <h3 className="font-display text-[15px] font-semibold text-[var(--ink)] sm:text-base">
          {block.text}
        </h3>
      );
    case "email":
      return (
        <p>
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
        <p className="text-[14px] leading-relaxed sm:text-[15px]">
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
    case "h2":
      return null;
    default:
      return null;
  }
}

type DocSection = {
  heading?: Extract<ContentBlock, { type: "h2" }>;
  blocks: ContentBlock[];
};

function isEmptyParagraph(block: ContentBlock): boolean {
  if (block.type !== "p" && block.type !== "lead") return false;
  const t = block.text.trim();
  return !t || t === "#" || /^#+\s*$/.test(t);
}

/**
 * Join consecutive paragraph/lead blocks into one flowing block so short
 * sentences don't each force a new row / empty right space.
 */
function coalesceTextBlocks(blocks: ContentBlock[]): ContentBlock[] {
  const out: ContentBlock[] = [];

  for (const block of blocks) {
    if (isEmptyParagraph(block)) continue;

    if (block.type === "p" || block.type === "lead") {
      const prev = out[out.length - 1];
      if (prev && (prev.type === "p" || prev.type === "lead")) {
        const joined = `${prev.text.trim()} ${block.text.trim()}`;
        out[out.length - 1] =
          prev.type === "lead"
            ? { type: "lead", text: joined }
            : { type: "p", text: joined };
        continue;
      }
    }

    out.push(block);
  }

  return out;
}

/** Split document blocks so each h2 starts a new visual section. */
function splitIntoSections(blocks: ContentBlock[]): DocSection[] {
  const sections: DocSection[] = [];
  let current: DocSection = { blocks: [] };

  for (const block of blocks) {
    if (block.type === "h2") {
      if (current.heading || current.blocks.length) {
        sections.push({
          ...current,
          blocks: coalesceTextBlocks(current.blocks),
        });
      }
      current = { heading: block, blocks: [] };
      continue;
    }
    current.blocks.push(block);
  }

  if (current.heading || current.blocks.length) {
    sections.push({
      ...current,
      blocks: coalesceTextBlocks(current.blocks),
    });
  }

  return sections;
}

type RichPart =
  | { type: "text"; text: string }
  | { type: "email"; address: string };

type RenderUnit =
  | { kind: "block"; block: ContentBlock }
  | { kind: "term"; title: string; text: string }
  | { kind: "richP"; parts: RichPart[] };

/** Turn h3+p and p+email(+p) into flowing units — no forced empty lines. */
function toRenderUnits(blocks: ContentBlock[]): RenderUnit[] {
  const units: RenderUnit[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    const next = blocks[i + 1];
    const after = blocks[i + 2];

    if (block.type === "h3" && next?.type === "p") {
      units.push({
        kind: "term",
        title: block.text.trim(),
        text: next.text.trim(),
      });
      i += 2;
      continue;
    }

    if (
      (block.type === "p" || block.type === "lead") &&
      next?.type === "email"
    ) {
      const parts: RichPart[] = [
        { type: "text", text: `${block.text.trim()} ` },
        { type: "email", address: next.address },
      ];
      i += 2;
      if (after && (after.type === "p" || after.type === "lead")) {
        parts.push({ type: "text", text: ` ${after.text.trim()}` });
        i += 1;
      }
      units.push({ kind: "richP", parts });
      continue;
    }

    if (block.type === "email") {
      const parts: RichPart[] = [
        { type: "email", address: block.address },
      ];
      i += 1;
      if (next && (next.type === "p" || next.type === "lead")) {
        parts.push({ type: "text", text: ` ${next.text.trim()}` });
        i += 1;
      }
      units.push({ kind: "richP", parts });
      continue;
    }

    units.push({ kind: "block", block });
    i += 1;
  }

  return units;
}

function EmailLink({ address }: { address: string }) {
  return (
    <a
      href={`mailto:${address}`}
      className="font-semibold text-[var(--brand)] underline underline-offset-2 hover:text-[var(--brand-deep)]"
    >
      {address}
    </a>
  );
}

function SectionBody({ blocks }: { blocks: ContentBlock[] }) {
  const units = toRenderUnits(blocks);
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < units.length) {
    const unit = units[i];

    if (unit.kind === "term") {
      const terms: Extract<RenderUnit, { kind: "term" }>[] = [];
      while (i < units.length && units[i].kind === "term") {
        terms.push(units[i] as Extract<RenderUnit, { kind: "term" }>);
        i += 1;
      }
      nodes.push(
        <ul
          key={`terms-${i}`}
          className={`grid w-full list-none gap-3 ${
            terms.length <= 2
              ? "sm:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {terms.map((term) => (
            <li
              key={term.title}
              className="rounded-lg border border-[var(--line)] bg-[var(--bg-a)] px-3 py-3"
            >
              <p className="w-full text-[14px] leading-relaxed text-[var(--ink)] sm:text-[15px]">
                <strong className="font-semibold text-[var(--ink)]">
                  {term.title}.{" "}
                </strong>
                <span className="text-[var(--ink-muted)]">{term.text}</span>
              </p>
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (unit.kind === "richP") {
      nodes.push(
        <p
          key={`rich-${i}`}
          className="w-full text-[14px] leading-relaxed text-[var(--ink)] sm:text-[15px]"
        >
          {unit.parts.map((part, j) =>
            part.type === "email" ? (
              <EmailLink key={j} address={part.address} />
            ) : (
              <span key={j}>{richText(part.text)}</span>
            ),
          )}
        </p>,
      );
      i += 1;
      continue;
    }

    nodes.push(<Block key={`block-${i}`} block={unit.block} />);
    i += 1;
  }

  return <div className="mt-3 w-full space-y-3">{nodes}</div>;
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
  const sections = splitIntoSections(blocks);
  const intro = sections.find((s) => !s.heading);
  const bodySections = sections.filter((s) => s.heading);

  const article = (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      {/* Title + intro */}
      <header className="rounded-[var(--radius)] border border-[var(--line)] bg-white px-4 py-5 shadow-[var(--shadow)] sm:px-6 sm:py-6 md:px-7 md:py-7">
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)] sm:text-xs">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 font-display text-[clamp(1.5rem,4.5vw,2.25rem)] font-bold leading-tight text-[var(--ink)]">
          {title}
        </h1>
        {intro && intro.blocks.length > 0 && (
          <div className="mt-4 border-t border-[var(--line)] pt-1">
            <SectionBody blocks={intro.blocks} />
          </div>
        )}
      </header>

      {/* Each subheading as its own separated section */}
      {bodySections.map((section) => (
        <section
          key={section.heading!.id || section.heading!.text}
          id={section.heading!.id}
          aria-labelledby={
            section.heading!.id ? `${section.heading!.id}-heading` : undefined
          }
          className="scroll-mt-24 rounded-[var(--radius)] border border-[var(--line)] bg-white px-4 py-5 shadow-[var(--shadow)] sm:px-6 sm:py-6"
        >
          <div className="flex items-start gap-3 border-b border-[var(--line)] pb-3">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand)]"
              aria-hidden
            />
            <h2
              id={
                section.heading!.id
                  ? `${section.heading!.id}-heading`
                  : undefined
              }
              className="font-display text-lg font-semibold leading-snug text-[var(--ink)] sm:text-xl"
            >
              {section.heading!.text}
            </h2>
          </div>
          <SectionBody blocks={section.blocks} />
        </section>
      ))}
    </div>
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
