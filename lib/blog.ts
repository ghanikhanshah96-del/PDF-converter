import { toolsById, type ToolId } from "@/lib/tools";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  imageAlt: string;
  toolId: ToolId;
  intent: string;
  bestFor: string[];
  helps: string[];
  tips: string[];
  limitations: string[];
  updated: string;
}

const blogInput: BlogPost[] = [
  {
    slug: "how-to-use-pdf-to-word",
    title: "How to use PDF to Word for editable documents",
    excerpt:
      "Turn a text-based PDF into a Word document you can edit, quote, or reformat without uploading the file.",
    category: "Convert",
    readTime: "4 min read",
    image: "/assets/free/article-convert.svg",
    imageAlt: "A PDF document converting into editable office file formats",
    toolId: "pdf-to-word",
    intent:
      "Use PDF to Word when you need editable text from a PDF, such as a proposal, report, letter, or handout.",
    bestFor: [
      "Text-based PDFs where words can be selected in a PDF reader.",
      "Drafts that need copy edits, formatting changes, or quotes.",
      "Documents you want to reuse in Microsoft Word or compatible editors.",
    ],
    helps: [
      "Saves time compared with manually retyping long documents.",
      "Keeps private documents on your device during conversion.",
      "Creates a DOCX file that is easier to edit, search, and repurpose.",
    ],
    tips: [
      "Use clean text PDFs for the best result.",
      "Review headings, tables, and spacing after conversion.",
      "For scanned image-only PDFs, use OCR software first.",
    ],
    limitations: [
      "Complex layouts may need cleanup in Word.",
      "Scanned pages without embedded text are not converted with OCR.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-use-word-to-pdf",
    title: "How to convert Word to PDF for clean sharing",
    excerpt:
      "Create a shareable PDF from a DOCX file so the document is easier to send, print, and archive.",
    category: "Convert",
    readTime: "4 min read",
    image: "/assets/free/article-convert.svg",
    imageAlt: "A Word document converting into a PDF file",
    toolId: "word-to-pdf",
    intent:
      "Use Word to PDF when a document is ready to share and you want a stable file that opens consistently for recipients.",
    bestFor: [
      "Letters, resumes, forms, reports, and simple office documents.",
      "Files that should be emailed or printed without editing.",
      "Keeping a readable copy of a DOCX document.",
    ],
    helps: [
      "Reduces accidental edits after sending a document.",
      "Makes files easier to view on phones and computers.",
      "Keeps processing local for private drafts and business files.",
    ],
    tips: [
      "Check page breaks in your Word file before converting.",
      "Use standard fonts for more predictable rendering.",
      "Open the PDF once after conversion to verify spacing.",
    ],
    limitations: [
      "Highly designed Word layouts may not match desktop Word exactly.",
      "Macros and advanced Office features are not preserved.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-merge-pdf-files",
    title: "How to merge PDF files into one document",
    excerpt:
      "Combine contracts, receipts, forms, or reports into one PDF while keeping control of the page order.",
    category: "Organize",
    readTime: "4 min read",
    image: "/assets/free/article-organize.svg",
    imageAlt: "Several PDF pages arranged into one organized document",
    toolId: "merge-pdf",
    intent:
      "Use Merge PDF when several related PDFs belong together and you want one clean file to send or store.",
    bestFor: [
      "Combining invoices, receipts, applications, and supporting documents.",
      "Joining chapters or sections into a single packet.",
      "Reducing email attachments by sending one file instead of many.",
    ],
    helps: [
      "Keeps related pages together in the correct order.",
      "Makes document review simpler for clients, teachers, or teams.",
      "Avoids uploading sensitive PDFs to a remote merge service.",
    ],
    tips: [
      "Name files clearly before selecting them.",
      "Place cover pages or summary pages first.",
      "Preview the merged output before sending it externally.",
    ],
    limitations: [
      "Very large batches depend on your device memory.",
      "Encrypted PDFs may need to be unlocked first.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-split-pdf-pages",
    title: "How to split a PDF and extract only the pages you need",
    excerpt:
      "Pull out specific pages or ranges from a PDF so you can share a smaller, focused document.",
    category: "Organize",
    readTime: "4 min read",
    image: "/assets/free/article-organize.svg",
    imageAlt: "PDF pages being separated into smaller documents",
    toolId: "split-pdf",
    intent:
      "Use Split PDF when a long document contains only a few pages you need to send, save, or edit separately.",
    bestFor: [
      "Extracting a signed page, invoice, certificate, or form section.",
      "Separating chapters, handouts, or client-specific pages.",
      "Reducing file size by keeping only relevant pages.",
    ],
    helps: [
      "Keeps the original file unchanged.",
      "Makes sharing faster because the output is smaller.",
      "Removes unrelated pages from a document package.",
    ],
    tips: [
      "Write page ranges before you start, such as 1-3, 5, 8-10.",
      "Check that the PDF viewer page number matches the printed page number.",
      "Use Merge PDF afterward if you need to recombine selected ranges.",
    ],
    limitations: [
      "Page-specific rotation should be handled before or after splitting.",
      "Large image-heavy PDFs can take longer on older phones.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-compress-pdf",
    title: "How to compress a PDF for email and uploads",
    excerpt:
      "Reduce PDF file size so documents are easier to email, upload, and store while balancing quality.",
    category: "Optimize",
    readTime: "4 min read",
    image: "/assets/free/article-optimize.svg",
    imageAlt: "A large PDF being compressed into a smaller file",
    toolId: "compress-pdf",
    intent:
      "Use Compress PDF when a file is too large for email, online forms, messaging apps, or storage limits.",
    bestFor: [
      "Image-heavy PDFs, scanned documents, portfolios, and forms.",
      "Reducing attachment size before sending a document.",
      "Preparing files for websites that limit upload size.",
    ],
    helps: [
      "Makes sharing faster on slow connections.",
      "Can reduce storage usage for archived documents.",
      "Lets you choose the quality level that fits the job.",
    ],
    tips: [
      "Use higher quality for documents that must be printed.",
      "Use stronger compression for quick previews or email attachments.",
      "Keep an original copy before heavy compression.",
    ],
    limitations: [
      "Compression savings depend on the PDF content.",
      "Lower quality settings can reduce image sharpness.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-convert-pdf-to-jpg",
    title: "How to convert PDF pages to JPG images",
    excerpt:
      "Export PDF pages as image files for previews, thumbnails, presentations, and quick sharing.",
    category: "Convert",
    readTime: "3 min read",
    image: "/assets/free/article-convert.svg",
    imageAlt: "A PDF document converting into image files",
    toolId: "pdf-to-jpg",
    intent:
      "Use PDF to JPG when you need page images instead of a PDF document.",
    bestFor: [
      "Creating image previews of PDF pages.",
      "Sharing one page in a chat or presentation.",
      "Extracting visual pages from flyers, menus, or forms.",
    ],
    helps: [
      "Turns each page into a common image format.",
      "Works well for visual documents that do not need editing.",
      "Keeps rendering inside the browser.",
    ],
    tips: [
      "Use the ZIP download for multi-page PDFs.",
      "Rename exported images so they stay in order.",
      "Use JPG to PDF afterward if you need to rebuild a PDF from images.",
    ],
    limitations: [
      "Text in JPG output is not editable text.",
      "Very large PDFs can take longer to render page by page.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-convert-jpg-to-pdf",
    title: "How to convert JPG images into one PDF",
    excerpt:
      "Combine photos, scans, receipts, or screenshots into a single PDF that is easier to send and archive.",
    category: "Convert",
    readTime: "3 min read",
    image: "/assets/free/article-convert.svg",
    imageAlt: "Image files converting into a PDF document",
    toolId: "jpg-to-pdf",
    intent:
      "Use JPG to PDF when several images should become one ordered document.",
    bestFor: [
      "Phone scans, receipts, IDs, handwritten notes, and screenshots.",
      "Turning image evidence into a single document package.",
      "Creating a PDF from JPG, PNG, or WEBP images.",
    ],
    helps: [
      "Keeps multiple images together in one file.",
      "Makes printing and emailing image sets easier.",
      "Lets you order images before creating the PDF.",
    ],
    tips: [
      "Crop or rotate photos before converting when possible.",
      "Put images in the order you want them to appear.",
      "Use clear, high-resolution images for readable text.",
    ],
    limitations: [
      "The output contains page images, not OCR text.",
      "Large high-resolution photos can make a large PDF.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-edit-pdf-online",
    title: "How to edit a PDF by adding text and images",
    excerpt:
      "Add simple text notes and image overlays to a PDF without changing the original file.",
    category: "Edit",
    readTime: "4 min read",
    image: "/assets/free/article-edit-sign.svg",
    imageAlt: "A PDF document with text editing and annotation controls",
    toolId: "edit-pdf",
    intent:
      "Use Edit PDF when you need to place new text or images on top of an existing page.",
    bestFor: [
      "Adding notes, labels, dates, initials, or simple corrections.",
      "Marking up forms that do not require full text reflow.",
      "Adding an image stamp or visual overlay.",
    ],
    helps: [
      "Avoids printing and scanning for small updates.",
      "Keeps the edited output as a downloadable copy.",
      "Works in the browser for quick annotation tasks.",
    ],
    tips: [
      "Zoom in when placing small text.",
      "Use short text blocks for cleaner results.",
      "Save a copy before making important edits.",
    ],
    limitations: [
      "This is an overlay editor, not a full Word-style editor.",
      "Existing paragraph text is not reflowed or rewritten.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-remove-pdf-password",
    title: "How to remove a PDF password when you know it",
    excerpt:
      "Create an unlocked copy of a protected PDF after entering the correct password locally.",
    category: "Secure",
    readTime: "4 min read",
    image: "/assets/free/article-secure.svg",
    imageAlt: "A protected PDF with a lock and local privacy badge",
    toolId: "pdf-password-remover",
    intent:
      "Use PDF Password Remover only for files you own or are authorized to open.",
    bestFor: [
      "Removing repeated password prompts from your own documents.",
      "Preparing an unlocked copy for editing or merging.",
      "Working with protected files when you already know the password.",
    ],
    helps: [
      "Keeps the password and document in your browser.",
      "Creates a new copy without modifying your original file.",
      "Avoids unsafe claims about cracking unknown passwords.",
    ],
    tips: [
      "Confirm you have permission before unlocking a file.",
      "Store unlocked copies carefully because they are easier to open.",
      "Use the exact password, including capitalization.",
    ],
    limitations: [
      "It cannot recover, guess, or crack forgotten passwords.",
      "Some restricted PDFs may not allow all edits after unlocking.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-sign-pdf-online",
    title: "How to sign a PDF online without printing",
    excerpt:
      "Draw or upload a signature, place it on the page, and download a signed PDF copy.",
    category: "Edit",
    readTime: "4 min read",
    image: "/assets/free/article-edit-sign.svg",
    imageAlt: "A PDF document with a signature being placed on it",
    toolId: "sign-pdf",
    intent:
      "Use Sign PDF when a document needs a visible signature image and you do not want to print and scan it.",
    bestFor: [
      "Basic approvals, forms, acknowledgements, and internal paperwork.",
      "Adding a drawn signature or uploaded signature image.",
      "Quick signing workflows on desktop or mobile.",
    ],
    helps: [
      "Saves paper, scanner time, and repeated email steps.",
      "Lets you position a signature on the correct page.",
      "Keeps signing work inside your browser.",
    ],
    tips: [
      "Use a transparent PNG for a clean uploaded signature.",
      "Place the signature inside the intended signature box.",
      "Confirm legal requirements for important contracts.",
    ],
    limitations: [
      "This places a signature image; it is not a certificate-based digital signature.",
      "Legal validity depends on document type and jurisdiction.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-convert-excel-to-pdf",
    title: "How to convert Excel to PDF for sharing",
    excerpt:
      "Turn spreadsheet data into a readable PDF when you need a fixed copy for review or printing.",
    category: "Convert",
    readTime: "4 min read",
    image: "/assets/free/article-spreadsheet.svg",
    imageAlt: "A spreadsheet grid connected to a PDF document",
    toolId: "excel-to-pdf",
    intent:
      "Use Excel to PDF when spreadsheet information should be shared as a fixed, readable document.",
    bestFor: [
      "Simple tables, lists, budgets, reports, and schedules.",
      "Sharing spreadsheet data with people who should not edit cells.",
      "Creating printable copies from XLSX files.",
    ],
    helps: [
      "Makes spreadsheet data easier to review without spreadsheet software.",
      "Reduces accidental formula or cell edits.",
      "Creates a document format that is easy to email and archive.",
    ],
    tips: [
      "Clean empty rows and columns before converting.",
      "Use clear column headers for readability.",
      "Check wide sheets because they may wrap across pages.",
    ],
    limitations: [
      "Charts, macros, and complex formatting are not fully preserved.",
      "Very wide sheets may need layout cleanup after conversion.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-convert-pdf-to-excel",
    title: "How to convert PDF tables to Excel",
    excerpt:
      "Extract table-like text from a clean PDF into a spreadsheet for review, sorting, and cleanup.",
    category: "Convert",
    readTime: "4 min read",
    image: "/assets/free/article-spreadsheet.svg",
    imageAlt: "A PDF table converting into spreadsheet rows",
    toolId: "pdf-to-excel",
    intent:
      "Use PDF to Excel when a text-based PDF contains tables you want to analyze in a spreadsheet.",
    bestFor: [
      "Clean invoices, statements, lists, and tabular reports.",
      "Moving data into rows for sorting or review.",
      "Documents where table text can be selected.",
    ],
    helps: [
      "Reduces manual copy and paste from PDF tables.",
      "Creates an XLSX file for spreadsheet cleanup.",
      "Keeps extraction local for private financial or work documents.",
    ],
    tips: [
      "Use PDFs with clear rows and columns.",
      "Review merged cells and multi-line rows after export.",
      "Use OCR first for scanned table images.",
    ],
    limitations: [
      "No OCR is included for image-only scanned PDFs.",
      "Complex table layouts may require manual cleanup.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-rotate-pdf-pages",
    title: "How to rotate PDF pages and fix orientation",
    excerpt:
      "Turn sideways or upside-down PDF pages into the correct reading direction before sharing.",
    category: "Organize",
    readTime: "3 min read",
    image: "/assets/free/article-organize.svg",
    imageAlt: "PDF pages being rotated into the correct orientation",
    toolId: "rotate-pdf",
    intent:
      "Use Rotate PDF when scanned pages, forms, or imported documents face the wrong direction.",
    bestFor: [
      "Sideways scans from phone cameras or office scanners.",
      "PDFs that need consistent portrait or landscape orientation.",
      "Fixing documents before merging or signing.",
    ],
    helps: [
      "Makes documents easier to read on any screen.",
      "Prepares pages for signing, editing, or merging.",
      "Avoids re-scanning pages just to fix orientation.",
    ],
    tips: [
      "Preview the file to choose 90, 180, or 270 degrees.",
      "Rotate before signing so the signature is easier to place.",
      "Split first if only one page needs a different treatment.",
    ],
    limitations: [
      "This version rotates all pages by the selected angle.",
      "Mixed-orientation files may need splitting first.",
    ],
    updated: "2026-09-22",
  },
  {
    slug: "how-to-unlock-pdf",
    title: "How to unlock a PDF safely when you have the password",
    excerpt:
      "Open a protected PDF with the correct password and download an unlocked copy for your next task.",
    category: "Secure",
    readTime: "4 min read",
    image: "/assets/free/article-secure.svg",
    imageAlt: "A password-protected PDF being unlocked locally",
    toolId: "unlock-pdf",
    intent:
      "Use Unlock PDF when you know the password and need a normal copy for editing, merging, or printing.",
    bestFor: [
      "Personal documents protected with a known password.",
      "Files you are authorized to open and process.",
      "Preparing protected PDFs for another tool in the workflow.",
    ],
    helps: [
      "Removes repetitive password prompts from your own copy.",
      "Keeps the password entry local in the browser.",
      "Makes the file easier to use with merge, split, or sign tools.",
    ],
    tips: [
      "Only unlock documents you own or have permission to use.",
      "Store the unlocked output securely.",
      "Use the password exactly as provided by the document owner.",
    ],
    limitations: [
      "It does not bypass unknown passwords.",
      "It is not a password recovery or cracking service.",
    ],
    updated: "2026-09-22",
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
