import { toolsById, type ToolId } from "@/lib/tools";

export interface BlogPost {
  slug: string;
  /** Visible article H1. */
  title: string;
  /** HTML title. Kept separate from the H1 on purpose. */
  seoTitle: string;
  description: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  imageAlt: string;
  published: string;
  updated: string;
  toolId: ToolId;
}

const blogInput: BlogPost[] = [
  {
    slug: "how-to-split-pdf-pages",
    title: "How to Split PDF Pages Online for Free: A Step-by-Step Guide",
    seoTitle:
      "How to Split PDF Pages Online for Free (Step-by-Step) | BestFreePDFConverter",
    description:
      "Learn how to split PDF pages online for free, select exact page ranges, save separate PDFs, and avoid common errors. No account needed.",
    excerpt:
      "Save selected pages as one PDF or as a ZIP of single pages. Page ranges, two-part splits, passwords, and the 50 MB limit.",
    category: "Organize",
    readTime: "12 min read",
    image: "/blog/bestfreepdfconverter-split-pdf-modes.svg",
    imageAlt:
      "Diagram of a page range saved as one PDF or as separate page files in a ZIP",
    published: "2026-10-17",
    updated: "2026-10-17",
    toolId: "split-pdf",
  },
  {
    slug: "how-to-merge-pdf-files",
    title: "Merge PDF Online Free: How to Combine Multiple PDF Files Into One",
    seoTitle:
      "Merge PDF Online Free: Combine Multiple PDF Files | BestFreePDFConverter",
    description:
      "Combine PDF files online for free. Arrange the order, unlock protected PDFs, and download one merged PDF.",
    excerpt:
      "Put two to twenty PDFs in order, handle locked files, and download merged.pdf without installing software.",
    category: "Organize",
    readTime: "11 min read",
    image: "/blog/bestfreepdfconverter-merge-pdf-order.svg",
    imageAlt:
      "Diagram of a cover letter, resume, and certificates combined into one merged PDF",
    published: "2026-10-17",
    updated: "2026-10-17",
    toolId: "merge-pdf",
  },
  {
    slug: "how-to-download-word-document-as-pdf",
    title: "How to Download a Word Document as a PDF",
    seoTitle:
      "How to Download a Word Document as a PDF | BestFreePDFConverter",
    description:
      "Learn how to save a Word document as a PDF, convert DOCX files with BestFreePDFConverter, and understand formatting limitations and common fixes.",
    excerpt:
      "Use the DOCX converter when you need the words in a PDF, or export from Word or Google Docs when the original layout has to stay.",
    category: "Convert",
    readTime: "11 min read",
    image: "/blog/bestfreepdfconverter-docx-to-pdf-process.svg",
    imageAlt:
      "Diagram of a DOCX file, browser text extraction, and a new PDF made of plain lines rather than the original layout",
    published: "2026-10-10",
    updated: "2026-10-10",
    toolId: "word-to-pdf",
  },
];

export const blogPosts = blogInput.map((post) => ({
  ...post,
  href: `/blog/${post.slug}`,
  toolHref: toolsById[post.toolId].href,
  toolName: toolsById[post.toolId].name,
}));

export type PublishedBlogPost = (typeof blogPosts)[number];

export const blogPostsBySlug: Record<string, PublishedBlogPost> =
  Object.fromEntries(blogPosts.map((post) => [post.slug, post]));

export function getBlogPost(slug: string): PublishedBlogPost | undefined {
  return blogPostsBySlug[slug];
}
