import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white text-[var(--ink)]">
      <div className="site-container flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <Link href="/" className="group flex min-w-0 flex-col">
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
              <Image
                src="/logo.svg"
                alt=""
                width={32}
                height={32}
                priority
                unoptimized
                className="h-8 w-8 object-contain"
              />
            </span>
            <span className="min-w-0 truncate font-display text-base font-bold sm:text-xl">
              {SITE.name}
            </span>
          </span>
          <span className="truncate text-xs text-[var(--ink-muted)] group-hover:text-[var(--brand)]">
            Private · client-side PDF tools
          </span>
        </Link>
        <nav className="grid w-full grid-cols-3 gap-1 rounded-lg bg-[var(--bg-a)] p-1 text-center text-sm min-[440px]:grid-cols-5 md:flex md:w-auto md:min-w-0 md:flex-wrap md:justify-end md:bg-transparent md:p-0">
          <Link
            href="/#tools"
            className="min-h-10 rounded-lg px-2 py-2 text-[var(--ink-muted)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] md:px-3"
          >
            Tools
          </Link>
          <Link
            href="/about"
            className="min-h-10 rounded-lg px-2 py-2 text-[var(--ink-muted)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] md:px-3"
          >
            About
          </Link>
          <Link
            href="/blog"
            className="min-h-10 rounded-lg px-2 py-2 text-[var(--ink-muted)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] md:px-3"
          >
            Blog
          </Link>
          <Link
            href="/privacy"
            className="min-h-10 rounded-lg px-2 py-2 text-[var(--ink-muted)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] md:px-3"
          >
            Privacy
          </Link>
          <Link
            href="/contact"
            className="min-h-10 rounded-lg px-2 py-2 text-[var(--ink-muted)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)] md:px-3"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
