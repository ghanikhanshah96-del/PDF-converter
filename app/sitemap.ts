import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/blog-service";
import { SITE } from "@/lib/site";
import { tools, type ToolId } from "@/lib/tools";

const SITE_UPDATED = new Date("2026-10-07");

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
  "protect-pdf": 0.85,
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    entry("/", 1.0, "daily"),
    entry("/about-us", 0.6, "monthly"),
    entry("/team/editorial", 0.5, "monthly", new Date("2026-10-21")),
    entry("/blog", 0.75, "weekly"),
    entry("/contact-us", 0.55, "monthly"),
    entry("/privacy-policy", 0.4, "yearly"),
    entry("/terms-and-conditions", 0.4, "yearly"),
    entry("/disclaimer", 0.35, "yearly"),
    entry("/editorial-policy", 0.35, "yearly"),
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) =>
    entry(tool.href, TOOL_PRIORITY[tool.id] ?? 0.8, "weekly", SITE_UPDATED),
  );
  toolPages.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPublishedBlogPosts();
    articlePages = posts.map((post) =>
      entry(
        post.href,
        0.65,
        "monthly",
        post.updatedAt || post.date
          ? new Date(post.updatedAt ?? post.date)
          : SITE_UPDATED,
      ),
    );
  } catch {
    // Firestore may be offline during build
  }

  return [...staticPages, ...toolPages, ...articlePages];
}
