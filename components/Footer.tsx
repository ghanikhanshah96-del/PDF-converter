import Link from "next/link";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";

export function Footer() {
  return (
    <footer className="mt-auto bg-[#2b2b33] text-white">
      <div className="site-container grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-lg font-bold">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/68">
            Free PDF utilities that process files in your browser. No uploads.
            No accounts required for core tools.
          </p>
          <p className="mt-3 text-xs text-white/55">
            {SITE.domain}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/92">
            Popular tools
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/62">
            {tools.slice(0, 6).map((tool) => (
              <li key={tool.id}>
                <Link href={tool.href} className="hover:text-white">
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
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/92">
            Privacy
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/62">
            <li>Local conversion</li>
            <li>No core uploads</li>
            <li>No account required</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {SITE.name}. Files never leave your device.
      </div>
    </footer>
  );
}
