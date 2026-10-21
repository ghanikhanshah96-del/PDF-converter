import Image from "next/image";
import { normalizePublishedArticleHtml, renderBlogContentHtml } from "@/lib/blog-content";
import type { CmsBlogPostView } from "@/lib/blog-service";
import { CmsArticleContent } from "@/components/blog/CmsArticleContent";

export function CmsArticleBody({ post }: { post: CmsBlogPostView }) {
  const html = normalizePublishedArticleHtml(renderBlogContentHtml(post.content, post.contentFormat));

  return (
    <div className="cms-article min-w-0 w-full">
      {post.coverImage && <div className="mb-6 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
        <Image
          src={post.coverImage}
          alt={post.coverImageAlt?.trim() || post.title}
          width={1200}
          height={600}
          priority
          sizes="(max-width: 1152px) 100vw, 1104px"
          className="h-auto w-full"
        />
      </div>}
      <CmsArticleContent html={html} />
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
