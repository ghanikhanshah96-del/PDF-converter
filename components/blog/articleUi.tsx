import Link from "next/link";
import type { ReactNode } from "react";

export const linkClass =
  "font-semibold text-[var(--brand-deep)] underline decoration-[rgba(200,36,32,0.35)] underline-offset-2 hover:decoration-[var(--brand-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]";

export const h2Class =
  "scroll-mt-28 font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.65rem]";

export const h3Class =
  "scroll-mt-28 mt-6 font-display text-lg font-semibold text-[var(--ink)]";

export function In({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

export function Out({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className={linkClass} rel="noopener noreferrer">
      {children}
    </a>
  );
}

export function ArticleToc({
  items,
}: {
  items: readonly { href: string; label: string }[];
}) {
  return (
    <nav
      aria-label="On this page"
      className="mt-6 rounded-lg border border-[var(--line)] bg-white p-4 sm:p-5"
    >
      <p className="text-sm font-semibold text-[var(--ink)]">On this page</p>
      <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="inline-flex rounded-md py-1 text-sm text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--brand-deep)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function DataTable({
  caption,
  minWidth = "44rem",
  children,
}: {
  caption: string;
  minWidth?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
      <table
        className="w-full border-collapse text-left text-sm leading-6"
        style={{ minWidth }}
      >
        <caption className="border-b border-[var(--line)] px-3 py-2 text-left text-xs text-[var(--ink-muted)]">
          {caption}
        </caption>
        {children}
      </table>
    </div>
  );
}

export const thClass = "px-3 py-2 font-semibold";
export const tdClass = "px-3 py-3 align-top";
export const rowClass = "border-t border-[var(--line)] align-top";
