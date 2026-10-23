import { BlogIndex } from "@/components/blog/BlogIndex";
import type { Metadata } from "next";
import {
  getPublishedBlogPosts,
  getBlogCoverImageSrc,
} from "@/lib/blog-service";
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
        <BlogIndex posts={posts.map(post => ({
          slug: post.slug, href: post.href, title: post.title, excerpt: post.excerpt,
          category: post.category, readTime: post.readTime, date: post.date,
          coverImage: getBlogCoverImageSrc(post), coverImageAlt: post.coverImageAlt,
        }))} />
      </section>
    </div>
  );
}
