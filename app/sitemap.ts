import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blog";
import { SITE } from "@/lib/site";
import { tools, type ToolId } from "@/lib/tools";

/** Content refresh date used when a page has no per-entry updated field. */
const SITE_UPDATED = new Date("2026-09-24");

/**
 * SEO priority by tool — higher for primary commercial keywords
 * from the SEO brief (convert / merge / compress / edit).
 */
const TOOL_PRIORITY: Partial<Record<ToolId, number>> = {
  "pdf-to-word": 0.95,
  "word-to-pdf": 0.95,
  "merge-pdf": 0.92,
  "split-pdf": 0.9,
  "compress-pdf": 0.92,
  "pdf-to-jpg": 0.88,
  "jpg-to-pdf": 0.88,
  "edit-pdf": 0.9,
  "sign-pdf": 0.88,
  "pdf-password-remover": 0.85,
  "unlock-pdf": 0.85,
  "excel-to-pdf": 0.88,
  "pdf-to-excel": 0.9,
  "rotate-pdf": 0.82,
};

type Freq = MetadataRoute.Sitemap[number]["changeFrequency"];

function entry(
  path: string,
  priority: number,
  changeFrequency: Freq,
  lastModified: Date = SITE_UPDATED,
): MetadataRoute.Sitemap[number] {
  const url = path === "/" ? `${SITE.url}/` : `${SITE.url}${path}`;
  return {
    url,
    lastModified,
    changeFrequency,
    priority,
  };
}

/**
 * Fully SEO-oriented sitemap for Google / Bing.
 * Served at /sitemap.xml via Next.js App Router.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    entry("/", 1.0, "daily"),
    entry("/about", 0.6, "monthly"),
    entry("/blog", 0.75, "weekly"),
    entry("/contact", 0.55, "monthly"),
    entry("/privacy", 0.35, "yearly"),
    entry("/terms", 0.35, "yearly"),
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) =>
    entry(
      tool.href,
      TOOL_PRIORITY[tool.id] ?? 0.8,
      "weekly",
      SITE_UPDATED,
    ),
  );

  // Sort tools by priority (highest first) for cleaner SEO review of the XML
  toolPages.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  const articlePages: MetadataRoute.Sitemap = blogPosts.map((post) =>
    entry(
      post.href,
      0.65,
      "monthly",
      post.updated ? new Date(post.updated) : SITE_UPDATED,
    ),
  );

  return [...staticPages, ...toolPages, ...articlePages];
}
