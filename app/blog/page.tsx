import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedBlogPosts } from "@/lib/blog-service";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Blog | ${SITE.name}`,
  description:
    "Guides for converting, editing, compressing, merging, and protecting PDF files with free online tools.",
  alternates: { canonical: `${SITE.url}/blog` },
  openGraph: {
    title: `Blog | ${SITE.name}`,
    description:
      "Guides for converting, editing, compressing, merging, and protecting PDF files with free online tools.",
    url: `${SITE.url}/blog`,
    type: "website",
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="bg-[var(--bg-a)]">
      <section className="py-10 sm:py-14">
        <div className="site-container">
          <h1 className="font-display text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-tight text-[var(--ink)]">
            Blog
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            Step-by-step guides for PDF conversion, editing, compression, and
            file management.
          </p>
        </div>
      </section>

      <section className="site-container pb-16">
        <ul className="grid gap-4">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={post.href}
                className="group block rounded-lg border border-[var(--line)] bg-white p-6 shadow-[0_2px_12px_rgba(22,22,22,0.05)] transition hover:-translate-y-0.5 hover:border-[rgba(229,50,45,0.36)] hover:shadow-[var(--shadow)] sm:p-8"
              >
                <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                  <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[var(--brand)]">
                    {post.category}
                  </span>
                  <span className="rounded-full bg-[var(--bg-c)] px-3 py-1 text-[var(--ink-muted)]">
                    {post.readTime}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--brand)] sm:text-3xl">
                  {post.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)]">
                  {post.excerpt}
                </p>
                <span className="mt-5 inline-block text-sm font-bold text-[var(--brand)]">
                  Read the guide
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
