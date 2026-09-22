import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { SITE } from "@/lib/site";
import { toolsById } from "@/lib/tools";

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | ${SITE.name}`,
    description: post.excerpt,
    alternates: { canonical: `${SITE.url}${post.href}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${SITE.url}${post.href}`,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const tool = toolsById[post.toolId];
  const relatedPosts = blogPosts
    .filter((item) => item.slug !== post.slug && item.category === post.category)
    .slice(0, 3);
  const articleUrl = `${SITE.url}${post.href}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: `${SITE.url}${post.image}`,
    datePublished: post.updated,
    dateModified: post.updated,
    author: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/logo.svg`,
      },
    },
    mainEntityOfPage: articleUrl,
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: articleUrl,
      },
    ],
  };

  return (
    <article className="bg-[var(--bg-a)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="py-10 sm:py-14">
        <div className="site-container">
          <nav className="text-sm text-[var(--ink-muted)]" aria-label="Breadcrumb">
            <Link href="/blog" className="hover:text-[var(--brand)]">
              Blog
            </Link>{" "}
            / <span>{post.toolName}</span>
          </nav>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
            <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[var(--brand)]">
              {post.category}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[var(--ink-muted)]">
              {post.readTime}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[var(--ink-muted)]">
              Updated {post.updated}
            </span>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2.1rem,6vw,4rem)] font-semibold leading-tight text-[var(--ink)]">
            {post.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--ink-muted)]">
            {post.excerpt}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href={post.toolHref} className="btn btn-primary">
              Open {post.toolName}
            </Link>
            <Link href="/blog" className="btn btn-secondary">
              All guides
            </Link>
          </div>
        </div>
      </header>

      <div className="site-container pb-16">
        <div className="relative h-64 overflow-hidden rounded-lg border border-[var(--line)] bg-white sm:h-96">
          <Image
            src={post.image}
            alt={post.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-lg border border-[var(--line)] bg-white p-6 shadow-[0_2px_12px_rgba(22,22,22,0.05)] sm:p-8">
            <section className="space-y-4 leading-relaxed">
              <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
                When to use {tool.name}
              </h2>
              <p>{post.intent}</p>
              <ul className="grid gap-2">
                {post.bestFor.map((item) => (
                  <li key={item} className="rounded-lg bg-[var(--bg-a)] p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8 space-y-4 leading-relaxed">
              <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
                How to use it
              </h2>
              <ol className="grid gap-3">
                {tool.howTo.map((step, index) => (
                  <li
                    key={step}
                    className="grid grid-cols-[2.25rem_1fr] gap-3 rounded-lg border border-[var(--line)] p-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="mt-8 space-y-4 leading-relaxed">
              <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
                How it helps
              </h2>
              <ul className="grid gap-2">
                {post.helps.map((item) => (
                  <li key={item} className="rounded-lg bg-[var(--brand-soft)] p-3">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
                  Practical tips
                </h2>
                <ul className="mt-4 space-y-3 leading-relaxed text-[var(--ink-muted)]">
                  {post.tips.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold text-[var(--ink)]">
                  Honest limits
                </h2>
                <ul className="mt-4 space-y-3 leading-relaxed text-[var(--ink-muted)]">
                  {post.limitations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mt-8 rounded-lg bg-[var(--bg-a)] p-5">
              <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
                Privacy note
              </h2>
              <p className="mt-2 leading-relaxed text-[var(--ink-muted)]">
                Core processing for {tool.name} runs in your browser. That
                means the selected file is handled locally by the page instead
                of being uploaded to a conversion API.
              </p>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-[0_2px_12px_rgba(22,22,22,0.05)]">
              <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                Ready to try it?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                Open the tool, choose your file, and download the result from
                your browser.
              </p>
              <Link href={post.toolHref} className="btn btn-primary mt-4 w-full">
                Open {post.toolName}
              </Link>
            </div>

            {relatedPosts.length > 0 && (
              <div className="rounded-lg border border-[var(--line)] bg-white p-5 shadow-[0_2px_12px_rgba(22,22,22,0.05)]">
                <h2 className="font-display text-lg font-semibold text-[var(--ink)]">
                  Related guides
                </h2>
                <div className="mt-4 space-y-3">
                  {relatedPosts.map((item) => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="block rounded-lg border border-[var(--line)] p-3 text-sm font-semibold transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  );
}
