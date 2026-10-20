import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { AddPdfToWordArticle } from "@/components/blog/AddPdfToWordArticle";
import { CmsArticleBody } from "@/components/blog/CmsArticleBody";
import { DownloadWordAsPdfArticle } from "@/components/blog/DownloadWordAsPdfArticle";
import { MergePdfArticle } from "@/components/blog/MergePdfArticle";
import { OpenPdfInWordArticle } from "@/components/blog/OpenPdfInWordArticle";
import { SplitPdfArticle } from "@/components/blog/SplitPdfArticle";
import {
  getBlogCoverImageSrc,
  getBlogPostBySlug,
  getPublishedBlogPosts,
} from "@/lib/blog-service";
import { buildArticleMetadata, absoluteUrl } from "@/lib/seo-metadata";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

const staticArticles: Record<string, ComponentType> = {
  "how-to-download-word-document-as-pdf": DownloadWordAsPdfArticle,
  "how-to-split-pdf-pages": SplitPdfArticle,
  "how-to-merge-pdf-files": MergePdfArticle,
  "add-pdf-to-word-document": AddPdfToWordArticle,
  "how-can-i-open-pdf-file-in-word": OpenPdfInWordArticle,
};

interface BlogArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};

  const cover = getBlogCoverImageSrc(post);
  const ogImageUrl = cover.startsWith("http") ? cover : absoluteUrl(cover);

  return buildArticleMetadata({
    title: post.metaTitle,
    description: post.metaDescription,
    path: `/blog/${post.slug}`,
    publishedTime: post.date,
    modifiedTime: post.updatedAt ?? post.date,
    ogImageUrl,
    tags: post.tags,
  });
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const StaticArticle = post.staticGuide ? staticArticles[slug] : undefined;
  if (post.staticGuide && !StaticArticle) notFound();

  const articleUrl = absoluteUrl(`/blog/${post.slug}`);
  const cover = getBlogCoverImageSrc(post);
  const coverAbsolute = cover.startsWith("http") ? cover : absoluteUrl(cover);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: coverAbsolute,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
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
        url: absoluteUrl("/logo.png"),
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

  const publishedLabel = new Date(`${post.date}T00:00:00Z`).toLocaleDateString(
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
          {post.excerpt ? (
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
              {post.excerpt}
            </p>
          ) : null}
        </div>
      </header>

      <div className="site-container pb-16">
        {StaticArticle ? <StaticArticle /> : <CmsArticleBody post={post} />}
      </div>
    </article>
  );
}
