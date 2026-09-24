"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";

const NAV_LINKS = [
  { href: "/#tools", label: "Tools" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/privacy", label: "Privacy" },
  { href: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="relative sticky top-0 z-40 border-b border-[var(--line)] bg-white text-[var(--ink)]">
      <div className="site-container flex items-center justify-between gap-3 py-3">
        <Link
          href="/"
          className="group flex min-w-0 flex-col"
          onClick={() => setOpen(false)}
        >
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

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-10 rounded-lg px-3 py-2 text-sm text-[var(--ink-muted)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--ink)] transition hover:bg-[var(--brand-soft)] md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-[73px] z-40 bg-black/30 md:hidden"
            aria-label="Close menu overlay"
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav"
            className="absolute inset-x-0 top-full z-50 border-b border-[var(--line)] bg-white shadow-[var(--shadow)] md:hidden"
            aria-label="Mobile"
          >
            <ul className="site-container flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-[var(--ink)] transition hover:bg-[var(--brand-soft)] hover:text-[var(--brand)]"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
