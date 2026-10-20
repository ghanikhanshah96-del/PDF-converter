import Image from "next/image";
import { renderBlogContentHtml } from "@/lib/blog-content";
import type { CmsBlogPostView } from "@/lib/blog-service";
import { getBlogCoverImageSrc } from "@/lib/blog-service";

export function CmsArticleBody({ post }: { post: CmsBlogPostView }) {
  const html = renderBlogContentHtml(post.content, post.contentFormat);
  const cover = getBlogCoverImageSrc(post);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-xl border border-[var(--line)] bg-white">
        <Image
          src={cover}
          alt={post.coverImageAlt?.trim() || post.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
      <div
        className="prose prose-sm max-w-none text-[var(--ink)] prose-headings:font-display prose-headings:text-[var(--ink)] prose-a:text-[var(--brand)] prose-strong:text-[var(--ink)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {post.tags.length > 0 && (
        <div className="mt-10 border-t border-[var(--line)] pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
            Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[var(--bg-c)] px-3 py-1 text-xs font-medium text-[var(--ink-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
