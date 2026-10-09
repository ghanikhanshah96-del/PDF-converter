import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DownloadWordAsPdfArticle } from "@/components/blog/DownloadWordAsPdfArticle";
import { blogPosts, getBlogPost } from "@/lib/blog";
import { SITE } from "@/lib/site";

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

  const url = `${SITE.url}${post.href}`;

  return {
    title: { absolute: post.seoTitle },
    description: post.description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: post.seoTitle,
      description: post.description,
      url,
      siteName: SITE.name,
      publishedTime: post.published,
      modifiedTime: post.updated,
      images: [{ url: post.image, alt: post.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.description,
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

  const articleUrl = `${SITE.url}${post.href}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: `${SITE.url}${post.image}`,
    datePublished: post.published,
    dateModified: post.updated,
    author: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
      logo: {
        "@type": "ImageObject",
        url: `${SITE.url}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE.url}/`,
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

  const publishedLabel = new Date(`${post.published}T00:00:00Z`).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" },
  );

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

      <header className="py-8 sm:py-12">
        <div className="site-container">
          <div className="mx-auto max-w-3xl">
            <nav className="text-sm text-[var(--ink-muted)]" aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                  <Link
                    href="/"
                    className="rounded-sm hover:text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
                  >
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link
                    href="/blog"
                    className="rounded-sm hover:text-[var(--brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="min-w-0 text-[var(--ink)]">{post.title}</li>
              </ol>
            </nav>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
              <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-[var(--brand)]">
                {post.category}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[var(--ink-muted)]">
                {post.readTime}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-[var(--ink-muted)]">
                Published {publishedLabel}
              </span>
            </div>
            <h1 className="mt-4 font-display text-[clamp(1.85rem,5vw,2.75rem)] font-semibold leading-tight text-[var(--ink)]">
              {post.title}
            </h1>
          </div>
        </div>
      </header>

      <div className="site-container pb-16">
        <DownloadWordAsPdfArticle />
      </div>
    </article>
  );
}
