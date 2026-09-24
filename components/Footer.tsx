import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";

const PRIVACY_ITEMS = [
  {
    label: "Local conversion",
    href: "/privacy#local-conversion",
  },
  {
    label: "No core uploads",
    href: "/privacy#no-uploads",
  },
  {
    label: "No account required",
    href: "/privacy#no-accounts",
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto bg-[#2b2b33] text-white">
      <div className="site-container grid grid-cols-2 gap-x-6 gap-y-8 py-8 sm:gap-8 sm:py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
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
          <ul className="mt-3 space-y-2 text-sm text-white/62">
            {tools.slice(0, 6).map((tool) => (
              <li key={tool.id}>
                <Link href={tool.href} className="hover:text-white hover:underline">
                  {tool.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/92">
            Site
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/62">
            <li>
              <Link href="/about" className="hover:text-white hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white hover:underline">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white hover:underline">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white hover:underline">
                Terms
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/92">
            Privacy
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/62">
            {PRIVACY_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {SITE.name}. Files never leave your device.
      </div>
    </footer>
  );
}
