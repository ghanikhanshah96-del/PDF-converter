import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/blog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Blog | ${SITE.name}`,
  description:
    "Step-by-step PDF guides for every best free pdf converter tool, written for practical document workflows and privacy-first browser processing.",
  alternates: { canonical: `${SITE.url}/blog` },
};

export default function BlogPage() {
  const [featured, ...posts] = blogPosts;

  return (
    <div className="bg-[var(--bg-a)]">
      <section className="py-10 sm:py-14">
        <div className="site-container text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--brand)]">
            PDF tool guides
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,6vw,3.5rem)] font-semibold leading-tight text-[var(--ink)]">
            Learn how to use every PDF tool
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            Clear, original guides for converting, compressing, signing,
            organizing, and protecting PDFs with privacy-first browser tools.
          </p>
        </div>
      </section>

      <section className="site-container pb-16">
        <Link
          href={featured.href}
          className="group grid overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_2px_12px_rgba(22,22,22,0.06)] transition hover:-translate-y-0.5 hover:border-[rgba(229,50,45,0.36)] hover:shadow-[var(--shadow)] md:grid-cols-[1.08fr_0.92fr]"
        >
          <div className="relative h-60 bg-[var(--brand-soft)] sm:h-72 md:h-auto md:min-h-[360px]">
            <Image
              src={featured.image}
              alt={featured.imageAlt}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[var(--brand)]">
                {featured.category}
              </span>
              <span className="rounded-full bg-[var(--bg-c)] px-3 py-1 text-[var(--ink-muted)]">
                {featured.readTime}
              </span>
            </div>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-[var(--ink)] group-hover:text-[var(--brand)]">
              {featured.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)]">
              {featured.excerpt}
            </p>
            <span className="mt-6 text-sm font-bold text-[var(--brand)]">
              Read guide
            </span>
          </div>
        </Link>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={post.href}
              className="group overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_2px_12px_rgba(22,22,22,0.04)] transition hover:-translate-y-0.5 hover:border-[rgba(229,50,45,0.36)] hover:shadow-[var(--shadow)]"
            >
              <div className="relative h-44 bg-[var(--brand-soft)] sm:h-52">
                <Image
                  src={post.image}
                  alt={post.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                  <span>{post.category}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--brand)]">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                  {post.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
