import {
  blogPosts as staticBlogPosts,
  type BlogPost as StaticBlogPost,
} from "@/lib/blog";
import {
  getBlogPostById,
  getBlogPostBySlug as getRepoPostBySlug,
  listBlogPosts,
  type BlogPostRecord,
} from "@/lib/blog-repo";

export type CmsBlogPostView = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  contentFormat?: "html" | "markdown";
  date: string;
  updatedAt?: string;
  readTime: string;
  category: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  focusKeyword?: string;
  featured?: boolean;
  coverImage?: string;
  coverImageAlt?: string;
  status?: string;
  /** True when this row comes from the static React articles in lib/blog.ts */
  staticGuide?: boolean;
  href: string;
};

export function dbPostToView(post: BlogPostRecord): CmsBlogPostView {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    contentFormat: post.contentFormat || "html",
    date: post.date,
    updatedAt: post.updatedAt ?? undefined,
    readTime: post.readTime,
    category: post.category,
    tags: post.tags,
    metaTitle: post.metaTitle || post.title,
    metaDescription: post.metaDescription || post.excerpt,
    focusKeyword: post.focusKeyword || undefined,
    featured: post.featured,
    coverImage: post.coverImage ?? undefined,
    coverImageAlt: post.coverImageAlt || undefined,
    status: post.status,
    href: `/blog/${post.slug}`,
  };
}

function staticToView(post: StaticBlogPost & { href: string }): CmsBlogPostView {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: "",
    contentFormat: "html",
    date: post.published,
    updatedAt: post.updated,
    readTime: post.readTime,
    category: post.category,
    tags: post.tags ?? [],
    metaTitle: post.seoTitle,
    metaDescription: post.description,
    featured: false,
    coverImage: post.image,
    coverImageAlt: post.imageAlt,
    status: "published",
    staticGuide: true,
    href: post.href,
  };
}

export function getBlogCoverImageSrc(post: CmsBlogPostView): string {
  if (post.coverImage) return post.coverImage;
  return "/blog/bestfreepdfconverter-docx-to-pdf-process.svg";
}

/** Published CMS posts + static guide posts that are not overridden in Firestore. */
export async function getPublishedBlogPosts(): Promise<CmsBlogPostView[]> {
  let cms: CmsBlogPostView[] = [];
  try {
    const posts = await listBlogPosts({
      status: "published",
      orderBy: "date",
    });
    cms = posts.map(dbPostToView);
  } catch {
    // Firestore unavailable
  }

  const cmsSlugs = new Set(cms.map((p) => p.slug));
  const staticOnly = staticBlogPosts
    .filter((p) => !cmsSlugs.has(p.slug))
    .map(staticToView);

  return [...cms, ...staticOnly].sort((a, b) =>
    (b.updatedAt ?? b.date).localeCompare(a.updatedAt ?? a.date),
  );
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<CmsBlogPostView | null> {
  try {
    const post = await getRepoPostBySlug(slug);
    if (post?.status === "published") {
      return dbPostToView(post);
    }
  } catch {
    // fall through
  }

  const staticPost = staticBlogPosts.find((p) => p.slug === slug);
  if (staticPost) return staticToView(staticPost);
  return null;
}

export async function getAllAdminBlogPosts(): Promise<CmsBlogPostView[]> {
  const posts = await listBlogPosts({ orderBy: "modifiedAt" });
  return posts.map(dbPostToView);
}

export async function getAdminBlogPostById(
  id: string,
): Promise<CmsBlogPostView | null> {
  const post = await getBlogPostById(id);
  return post ? dbPostToView(post) : null;
}
