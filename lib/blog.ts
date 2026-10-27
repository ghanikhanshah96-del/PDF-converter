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
  tags?: string[];
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
  {
    slug: "add-pdf-to-word-document",
    title: "Add PDF to Word Document: 3 Easy Methods",
    seoTitle:
      "Add PDF to Word Document: Easy Step-by-Step Guide | BestFreePDFConverter",
    description:
      "Learn how to add PDF to Word document as an attachment or editable content. Follow easy steps to insert, convert, and manage PDF files in Word.",
    excerpt:
      "Embed a PDF as an object, convert it to Word, or open it in Microsoft Word — then choose what fits your document.",
    category: "Convert",
    readTime: "10 min read",
    image: "/blog/bestfreepdfconverter-add-pdf-to-word.svg",
    imageAlt:
      "Three ways to add a PDF to Word: attach as an object, convert PDF to DOCX, or open the PDF in Microsoft Word",
    published: "2026-10-21",
    updated: "2026-10-21",
    toolId: "pdf-to-word",
  },
  {
    slug: "how-can-i-open-pdf-file-in-word",
    title: "How Can I Open PDF File in Word? Easy Step-by-Step Guide",
    seoTitle:
      "How Can I Open PDF File in Word? Easy Step-by-Step Guide | BestFreePDFConverter",
    description:
      "Wondering how can I open PDF file in Word? Follow easy steps to open, convert, and edit PDFs using Microsoft Word or a free online converter.",
    excerpt:
      "Open a PDF in Microsoft Word or convert it online to DOCX first, then review layout limits before you edit.",
    category: "Convert",
    readTime: "9 min read",
    image: "/blog/bestfreepdfconverter-open-pdf-in-word.svg",
    imageAlt:
      "Two ways to open a PDF in Word: File Open in Microsoft Word, or convert PDF to DOCX online first",
    published: "2026-10-21",
    updated: "2026-10-21",
    toolId: "pdf-to-word",
  },
  {
    slug: "how-to-make-a-file-less-than-10-mb",
    title: "How to Make a File Less Than 10 MB: Easy Methods",
    seoTitle:
      "How to Make a File Less Than 10 MB: Easy Methods | BestFreePDFConverter",
    description:
      "Learn how to make a file less than 10 MB. Reduce PDF, Word, and image file sizes with simple compression steps for uploads and email attachments.",
    excerpt:
      "Compress a PDF, shrink pictures in Word, or resize an image so the file stays under a 10 MB upload or email limit.",
    category: "Optimize",
    readTime: "8 min read",
    image: "/blog/bestfreepdfconverter-file-under-10mb.svg",
    imageAlt:
      "Diagram of reducing a PDF, Word document, and image so each file is under 10 MB",
    published: "2026-10-27",
    updated: "2026-10-27",
    toolId: "compress-pdf",
    tags: [
      "how to make a file less than 10 mb",
      "reduce file size to 10 MB",
      "compress PDF under 10 MB",
      "make a file smaller",
      "compress Word document",
      "reduce image file size",
      "file compression online",
    ],
  },
  {
    slug: "what-does-compressing-a-pdf-do",
    title: "What Does Compressing a PDF Do? Simple Explanation",
    seoTitle:
      "What Does Compressing a PDF Do? Simple Explanation | BestFreePDFConverter",
    description:
      "What does compressing a PDF do? Learn how PDF compression reduces file size, whether it affects quality, and how to compress PDF files for free.",
    excerpt:
      "Compression shrinks a PDF by optimizing images and extra data so the file is easier to email, upload, and store.",
    category: "Optimize",
    readTime: "7 min read",
    image: "/blog/bestfreepdfconverter-what-compressing-a-pdf-does.svg",
    imageAlt:
      "Diagram of a large PDF becoming a smaller PDF after image optimization, data compression, and removal of extra data",
    published: "2026-10-28",
    updated: "2026-10-28",
    toolId: "compress-pdf",
    tags: [
      "what does compressing a pdf do",
      "PDF compression",
      "reduce PDF file size",
      "compress PDF online free",
      "PDF compression quality",
      "how PDF compression works",
      "PDF compressor",
    ],
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
