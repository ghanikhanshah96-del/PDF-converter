"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";
import { isNavActive } from "@/lib/navActive";

const PRIVACY_ITEMS = [
  {
    label: "Local conversion",
    href: "/privacy-policy#local-conversion",
  },
  {
    label: "No core uploads",
    href: "/privacy-policy#no-uploads",
  },
  {
    label: "No account required",
    href: "/privacy-policy#no-accounts",
  },
] as const;

const SITE_LINKS = [
  { href: "/about-us", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms and Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/editorial-policy", label: "Editorial Policy" },
] as const;

function footerLinkClass(active: boolean) {
  return [
    "transition",
    active
      ? "font-semibold text-white underline underline-offset-2"
      : "text-white/62 hover:text-white hover:underline",
  ].join(" ");
}

export function Footer() {
  const pathname = usePathname() || "/";

  return (
    <footer className="mt-auto bg-[#2b2b33] text-white">
      <div className="site-container grid grid-cols-2 gap-x-5 gap-y-8 py-8 sm:gap-x-8 sm:gap-y-10 sm:py-10 md:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            className="group inline-flex max-w-full items-center gap-2.5 rounded-lg outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-white/60"
            aria-label={`${SITE.name} home`}
          >
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
              <Image
                src="/logo.svg"
                alt=""
                width={32}
                height={32}
                unoptimized
                className="h-8 w-8 object-contain"
              />
            </span>
            <span className="min-w-0 truncate font-display text-lg font-bold group-hover:underline">
              {SITE.name}
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/68">
            Free PDF utilities that process files in your browser. No uploads.
            No accounts required for core tools.
          </p>
          <p className="mt-3 text-xs text-white/55">{SITE.domain}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/92">
            Popular tools
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {tools.slice(0, 6).map((tool) => {
              const active = isNavActive(pathname, tool.href);
              return (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className={footerLinkClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    {tool.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/92">
            Company
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {SITE_LINKS.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={footerLinkClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/92">
            Privacy
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {PRIVACY_ITEMS.map((item) => {
              const active = isNavActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={footerLinkClass(active)}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs leading-relaxed text-white/50">
        © {new Date().getFullYear()} {SITE.name}. Files never leave your device.
      </div>
    </footer>
  );
}
