export type ToolId =
  | "pdf-to-word"
  | "word-to-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "compress-pdf"
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "edit-pdf"
  | "pdf-password-remover"
  | "sign-pdf"
  | "excel-to-pdf"
  | "pdf-to-excel"
  | "rotate-pdf"
  | "unlock-pdf";

export type ToolCategory =
  | "convert"
  | "organize"
  | "optimize"
  | "edit"
  | "secure";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: ToolId;
  slug: string;
  href: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  summary: string;
  description: string;
  h1: string;
  title: string;
  metaDescription: string;
  howTo: string[];
  faqs: ToolFaq[];
  related: ToolId[];
  accept: string;
  multiple: boolean;
  keywords: string[];
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  convert: "Convert",
  organize: "Organize",
  optimize: "Optimize",
  edit: "Edit & Sign",
  secure: "Secure",
};

export const tools: ToolDefinition[] = [
  {
    id: "pdf-to-word",
    slug: "pdf-to-word",
    href: "/pdf-to-word",
    name: "PDF to Word",
    shortName: "PDF → Word",
    category: "convert",
    summary: "Extract text from a PDF into an editable Word document.",
    description:
      "Convert PDF files to Word (.docx) in your browser. Best for text-based PDFs; scanned pages without OCR text will have limited results.",
    h1: "PDF to Word Converter",
    title: "PDF to Word Converter Free Online | best free pdf converter",
    metaDescription:
      "Convert PDF to Word free online. Extract text into an editable .docx file in your browser — files never uploaded.",
    howTo: [
      "Choose or drop your PDF file.",
      "Wait while text is extracted locally in your browser.",
      "Download the generated Word (.docx) file.",
    ],
    faqs: [
      {
        question: "Is this PDF to Word converter free?",
        answer:
          "Yes. best free pdf converter’s PDF to Word tool is free to use with no account required.",
      },
      {
        question: "Are my files uploaded to a server?",
        answer:
          "No. Conversion runs entirely in your browser. Your PDF never leaves your device.",
      },
      {
        question: "Will formatting match the original PDF perfectly?",
        answer:
          "Layout is best-effort. Text-based PDFs convert well for editing; complex layouts and scanned pages may need cleanup.",
      },
    ],
    related: ["word-to-pdf", "pdf-to-excel", "pdf-to-jpg"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["pdf to word", "pdf to docx", "convert pdf to word"],
  },
  {
    id: "word-to-pdf",
    slug: "word-to-pdf",
    href: "/word-to-pdf",
    name: "Word to PDF",
    shortName: "Word → PDF",
    category: "convert",
    summary: "Turn a Word document into a shareable PDF.",
    description:
      "Convert .docx files to PDF in your browser. Content is rendered from the document text and structure for a clean, shareable PDF.",
    h1: "Word to PDF Converter",
    title: "Word to PDF Converter Free Online | best free pdf converter",
    metaDescription:
      "Convert Word to PDF free online. Turn .docx into PDF in your browser with no uploads.",
    howTo: [
      "Upload your .docx Word file.",
      "We render the document content locally.",
      "Download your new PDF.",
    ],
    faqs: [
      {
        question: "Which Word formats are supported?",
        answer:
          "Use .docx files. Older .doc formats are not supported in this free browser tool.",
      },
      {
        question: "Is conversion private?",
        answer:
          "Yes. Processing happens on your device; nothing is uploaded to our servers.",
      },
      {
        question: "Will images and complex layouts convert perfectly?",
        answer:
          "This is a best-effort client-side converter. Simple text documents work best; complex desktop publishing layouts may differ.",
      },
    ],
    related: ["pdf-to-word", "excel-to-pdf", "merge-pdf"],
    accept:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx",
    multiple: false,
    keywords: ["word to pdf", "docx to pdf", "convert word to pdf"],
  },
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    href: "/merge-pdf",
    name: "Merge PDF",
    shortName: "Merge",
    category: "organize",
    summary: "Combine multiple PDFs into one file.",
    description:
      "Merge PDF files online for free. Select several PDFs, arrange them, and download a single combined document — all in your browser.",
    h1: "Merge PDF Files",
    title: "Merge PDF Free Online | Combine PDFs | best free pdf converter",
    metaDescription:
      "Merge PDF files free online. Combine multiple PDFs into one document in your browser — no uploads.",
    howTo: [
      "Add two or more PDF files.",
      "Reorder them if needed.",
      "Merge and download the combined PDF.",
    ],
    faqs: [
      {
        question: "How many PDFs can I merge?",
        answer:
          "You can merge as many as your device can handle in memory. Very large batches may be slower on mobile.",
      },
      {
        question: "Do you keep the original page order?",
        answer:
          "Yes. Pages are combined in the order you select (or rearrange) before merging.",
      },
      {
        question: "Is merging secure?",
        answer:
          "Files stay on your device. We never receive or store your PDFs.",
      },
    ],
    related: ["split-pdf", "compress-pdf", "rotate-pdf"],
    accept: "application/pdf,.pdf",
    multiple: true,
    keywords: ["merge pdf", "combine pdf", "join pdf files"],
  },
  {
    id: "split-pdf",
    slug: "split-pdf",
    href: "/split-pdf",
    name: "Split PDF",
    shortName: "Split",
    category: "organize",
    summary: "Extract pages or split a PDF into separate files.",
    description:
      "Split a PDF by page ranges or extract individual pages. Download a new PDF or a ZIP of page files — processed locally.",
    h1: "Split PDF",
    title: "Split PDF Free Online | Extract Pages | best free pdf converter",
    metaDescription:
      "Split PDF free online. Extract pages or ranges into new PDFs in your browser with no file uploads.",
    howTo: [
      "Upload the PDF you want to split.",
      "Choose pages or ranges to extract.",
      "Download the result as PDF or ZIP.",
    ],
    faqs: [
      {
        question: "Can I extract a single page?",
        answer:
          "Yes. Select one page or a custom range such as 1–3, 5, 8–10.",
      },
      {
        question: "Will the original PDF be changed?",
        answer:
          "No. Your original file stays untouched; you download a new file.",
      },
      {
        question: "Does split work offline after the page loads?",
        answer:
          "Once the page and libraries are loaded, processing runs locally without uploading.",
      },
    ],
    related: ["merge-pdf", "rotate-pdf", "compress-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["split pdf", "extract pdf pages", "separate pdf"],
  },
  {
    id: "compress-pdf",
    slug: "compress-pdf",
    href: "/compress-pdf",
    name: "Compress PDF",
    shortName: "Compress",
    category: "optimize",
    summary: "Reduce PDF file size for sharing and email.",
    description:
      "Compress PDF files in your browser by re-encoding pages at a smaller size. Ideal for email attachments and faster downloads.",
    h1: "Compress PDF",
    title: "Compress PDF Free Online | Reduce File Size | best free pdf converter",
    metaDescription:
      "Compress PDF free online. Reduce PDF file size in your browser — private, no uploads.",
    howTo: [
      "Select the PDF to compress.",
      "Choose a quality level.",
      "Download the smaller PDF.",
    ],
    faqs: [
      {
        question: "How much smaller will my PDF get?",
        answer:
          "Savings depend on content. Image-heavy PDFs usually shrink more than text-only files.",
      },
      {
        question: "Does compression reduce quality?",
        answer:
          "Lower quality settings rasterize pages more aggressively. Pick higher quality when fidelity matters.",
      },
      {
        question: "Are files uploaded for compression?",
        answer: "No. Compression runs entirely on your device.",
      },
    ],
    related: ["merge-pdf", "pdf-to-jpg", "jpg-to-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["compress pdf", "reduce pdf size", "shrink pdf"],
  },
  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    href: "/pdf-to-jpg",
    name: "PDF to JPG",
    shortName: "PDF → JPG",
    category: "convert",
    summary: "Turn each PDF page into a JPG image.",
    description:
      "Convert PDF pages to high-quality JPG images. Download a single image or a ZIP of all pages — rendered locally with PDF.js.",
    h1: "PDF to JPG Converter",
    title: "PDF to JPG Converter Free Online | best free pdf converter",
    metaDescription:
      "Convert PDF to JPG free online. Export PDF pages as images in your browser with no uploads.",
    howTo: [
      "Upload your PDF.",
      "Pages are rendered to images in your browser.",
      "Download JPGs or a ZIP of all pages.",
    ],
    faqs: [
      {
        question: "Can I convert all pages at once?",
        answer:
          "Yes. Multi-page PDFs download as a ZIP containing one JPG per page.",
      },
      {
        question: "What resolution do I get?",
        answer:
          "Pages are rendered at a clear screen-friendly resolution suitable for sharing and previews.",
      },
      {
        question: "Is this private?",
        answer: "Yes. Rendering happens on your device only.",
      },
    ],
    related: ["jpg-to-pdf", "compress-pdf", "pdf-to-word"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["pdf to jpg", "pdf to jpeg", "pdf to image"],
  },
  {
    id: "jpg-to-pdf",
    slug: "jpg-to-pdf",
    href: "/jpg-to-pdf",
    name: "JPG to PDF",
    shortName: "JPG → PDF",
    category: "convert",
    summary: "Combine images into a single PDF.",
    description:
      "Convert JPG, PNG, or WEBP images into a PDF. Perfect for scans, receipts, and photo documents — processed in your browser.",
    h1: "JPG to PDF Converter",
    title: "JPG to PDF Converter Free Online | best free pdf converter",
    metaDescription:
      "Convert JPG to PDF free online. Combine images into one PDF in your browser — no uploads.",
    howTo: [
      "Add one or more JPG, PNG, or WEBP images.",
      "Reorder if needed.",
      "Create and download your PDF.",
    ],
    faqs: [
      {
        question: "Which image formats work?",
        answer: "JPG/JPEG, PNG, and WEBP images are supported.",
      },
      {
        question: "Can I combine multiple images?",
        answer: "Yes. Each image becomes a page in the resulting PDF.",
      },
      {
        question: "Do you store my photos?",
        answer: "No. Images stay on your device during conversion.",
      },
    ],
    related: ["pdf-to-jpg", "merge-pdf", "compress-pdf"],
    accept: "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    multiple: true,
    keywords: ["jpg to pdf", "jpeg to pdf", "image to pdf"],
  },
  {
    id: "edit-pdf",
    slug: "edit-pdf",
    href: "/edit-pdf",
    name: "Edit PDF",
    shortName: "Edit",
    category: "edit",
    summary: "Add text and image overlays to PDF pages.",
    description:
      "Edit PDF files by placing text and images on pages. A simple overlay editor — not a full word processor — running fully client-side.",
    h1: "Edit PDF Online",
    title: "Edit PDF Free Online | Add Text & Images | best free pdf converter",
    metaDescription:
      "Edit PDF free online. Add text and image overlays to pages in your browser — private and free.",
    howTo: [
      "Upload the PDF you want to annotate.",
      "Add text or image overlays on the selected page.",
      "Download the updated PDF.",
    ],
    faqs: [
      {
        question: "Can I edit existing paragraph text like Word?",
        answer:
          "This tool stamps new text and images onto pages. It is not a full reflowing word processor.",
      },
      {
        question: "Are edits private?",
        answer: "Yes. Editing happens locally; files are not uploaded.",
      },
      {
        question: "Can I add images to a PDF?",
        answer: "Yes. Upload an image and place it as an overlay on a page.",
      },
    ],
    related: ["sign-pdf", "rotate-pdf", "merge-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["edit pdf", "annotate pdf", "add text to pdf"],
  },
  {
    id: "pdf-password-remover",
    slug: "pdf-password-remover",
    href: "/pdf-password-remover",
    name: "PDF Password Remover",
    shortName: "Remove Password",
    category: "secure",
    summary: "Remove a known password and download an unlocked PDF.",
    description:
      "Remove PDF password protection when you know the password. Unlock and download an unprotected copy — we cannot crack unknown passwords.",
    h1: "PDF Password Remover",
    title: "PDF Password Remover Free Online | best free pdf converter",
    metaDescription:
      "Remove PDF password free online when you know the password. Unlock PDFs in your browser — no cracking, no uploads.",
    howTo: [
      "Upload a password-protected PDF you are authorized to open.",
      "Enter the known password.",
      "Download the unlocked PDF.",
    ],
    faqs: [
      {
        question: "Can you crack a forgotten password?",
        answer:
          "No. This tool only removes protection when you supply the correct password for a file you own or are authorized to open.",
      },
      {
        question: "Is unlocking legal?",
        answer:
          "Only use it on PDFs you own or have permission to unlock. Unauthorized access to protected files is not allowed.",
      },
      {
        question: "Does the password leave my device?",
        answer:
          "No. Unlocking runs in your browser; the password and file stay local.",
      },
    ],
    related: ["unlock-pdf", "sign-pdf", "compress-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["pdf password remover", "remove pdf password", "unlock pdf"],
  },
  {
    id: "sign-pdf",
    slug: "sign-pdf",
    href: "/sign-pdf",
    name: "Sign PDF",
    shortName: "Sign",
    category: "edit",
    summary: "Draw or upload a signature and place it on a PDF.",
    description:
      "Sign PDF documents online by drawing or uploading a signature image, positioning it on a page, and baking it into the file locally.",
    h1: "Sign PDF Online",
    title: "Sign PDF Free Online | Add Signature | best free pdf converter",
    metaDescription:
      "Sign PDF free online. Draw or upload a signature and place it on your PDF in the browser — no uploads.",
    howTo: [
      "Upload the PDF to sign.",
      "Draw or upload your signature.",
      "Place it on the page and download the signed PDF.",
    ],
    faqs: [
      {
        question: "Is an electronic signature legally binding?",
        answer:
          "Requirements vary by jurisdiction and document type. This tool places a signature image; consult local rules for legal validity.",
      },
      {
        question: "Can I draw my signature?",
        answer: "Yes. Use the signature pad or upload a PNG/JPG of your signature.",
      },
      {
        question: "Do you store signed documents?",
        answer: "No. Signing happens entirely on your device.",
      },
    ],
    related: ["edit-pdf", "unlock-pdf", "merge-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["sign pdf", "pdf signature", "add signature to pdf"],
  },
  {
    id: "excel-to-pdf",
    slug: "excel-to-pdf",
    href: "/excel-to-pdf",
    name: "Excel to PDF",
    shortName: "Excel → PDF",
    category: "convert",
    summary: "Export spreadsheet data to a printable PDF.",
    description:
      "Convert Excel (.xlsx) sheets to PDF in your browser. Tabular data is laid out for reading and sharing — best-effort client-side conversion.",
    h1: "Excel to PDF Converter",
    title: "Excel to PDF Converter Free Online | best free pdf converter",
    metaDescription:
      "Convert Excel to PDF free online. Turn .xlsx spreadsheets into PDF in your browser with no uploads.",
    howTo: [
      "Upload your .xlsx spreadsheet.",
      "We render sheet data locally into pages.",
      "Download the PDF.",
    ],
    faqs: [
      {
        question: "Which Excel formats are supported?",
        answer: "Use .xlsx files. Legacy .xls is not the primary target for this tool.",
      },
      {
        question: "Will charts and macros convert?",
        answer:
          "This converter focuses on cell values and basic table layout. Charts, macros, and complex formatting are not fully preserved.",
      },
      {
        question: "Is my spreadsheet uploaded?",
        answer: "No. Conversion stays on your device.",
      },
    ],
    related: ["pdf-to-excel", "word-to-pdf", "jpg-to-pdf"],
    accept:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx",
    multiple: false,
    keywords: ["excel to pdf", "xlsx to pdf", "spreadsheet to pdf"],
  },
  {
    id: "pdf-to-excel",
    slug: "pdf-to-excel",
    href: "/pdf-to-excel",
    name: "PDF to Excel",
    shortName: "PDF → Excel",
    category: "convert",
    summary: "Extract table-like text from a PDF into a spreadsheet.",
    description:
      "Convert PDF tables to Excel (.xlsx) by extracting text and grouping lines into rows. Best for clean, text-based tables — not scanned sheets without OCR.",
    h1: "PDF to Excel Converter",
    title: "PDF to Excel Converter Free Online | best free pdf converter",
    metaDescription:
      "Convert PDF to Excel free online. Extract table text into .xlsx in your browser — no uploads.",
    howTo: [
      "Upload a PDF that contains tabular text.",
      "Text is extracted and grouped into rows locally.",
      "Download the Excel (.xlsx) file.",
    ],
    faqs: [
      {
        question: "Does this use OCR for scanned PDFs?",
        answer:
          "No OCR in v1. Scanned image-only PDFs will not extract meaningful tables.",
      },
      {
        question: "How accurate is table detection?",
        answer:
          "Detection is best-effort based on text positions and spacing. Complex multi-column layouts may need cleanup in Excel.",
      },
      {
        question: "Is conversion private?",
        answer: "Yes. Extraction runs in your browser only.",
      },
    ],
    related: ["excel-to-pdf", "pdf-to-word", "pdf-to-jpg"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["pdf to excel", "pdf to xlsx", "pdf table to excel"],
  },
  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    href: "/rotate-pdf",
    name: "Rotate PDF",
    shortName: "Rotate",
    category: "organize",
    summary: "Rotate pages left, right, or upside down.",
    description:
      "Rotate PDF pages by 90°, 180°, or 270° in your browser. Fix scanned pages that are sideways or upside down without uploading.",
    h1: "Rotate PDF",
    title: "Rotate PDF Free Online | Fix Page Orientation | best free pdf converter",
    metaDescription:
      "Rotate PDF free online. Turn pages 90°, 180°, or 270° in your browser — no uploads.",
    howTo: [
      "Upload your PDF.",
      "Choose a rotation angle for all pages.",
      "Download the rotated PDF.",
    ],
    faqs: [
      {
        question: "Can I rotate only one page?",
        answer:
          "This version rotates all pages by the selected angle. Split first if you need page-specific rotation.",
      },
      {
        question: "Does rotation reduce quality?",
        answer:
          "No. Rotation updates page orientation metadata/content without re-rasterizing for this tool path.",
      },
      {
        question: "Are files uploaded?",
        answer: "No. Rotation is processed locally.",
      },
    ],
    related: ["split-pdf", "merge-pdf", "edit-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["rotate pdf", "rotate pdf pages", "fix pdf orientation"],
  },
  {
    id: "unlock-pdf",
    slug: "unlock-pdf",
    href: "/unlock-pdf",
    name: "Unlock PDF",
    shortName: "Unlock",
    category: "secure",
    summary: "Unlock a PDF with the password you already know.",
    description:
      "Unlock password-protected PDFs when you know the password. Same privacy-first flow as password remover — no cracking of unknown passwords.",
    h1: "Unlock PDF",
    title: "Unlock PDF Free Online | Open Protected PDF | best free pdf converter",
    metaDescription:
      "Unlock PDF free online with the password you know. Remove protection in your browser — no uploads, no cracking.",
    howTo: [
      "Upload a PDF you are authorized to unlock.",
      "Enter the known open password.",
      "Download the unlocked file.",
    ],
    faqs: [
      {
        question: "What is the difference between Unlock PDF and Password Remover?",
        answer:
          "They share the same flow: supply the known password and download an unprotected copy. Use whichever page matches your search.",
      },
      {
        question: "Can you unlock a PDF without the password?",
        answer:
          "No. We do not crack or bypass unknown passwords.",
      },
      {
        question: "Who should use this tool?",
        answer:
          "Only people who own the file or have permission to remove its password protection.",
      },
    ],
    related: ["pdf-password-remover", "sign-pdf", "edit-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["unlock pdf", "open protected pdf", "pdf unlocker"],
  },
];

export const toolsById: Record<ToolId, ToolDefinition> = Object.fromEntries(
  tools.map((t) => [t.id, t]),
) as Record<ToolId, ToolDefinition>;

export const toolsBySlug: Record<string, ToolDefinition> = Object.fromEntries(
  tools.map((t) => [t.slug, t]),
);

export function getTool(idOrSlug: string): ToolDefinition | undefined {
  return toolsById[idOrSlug as ToolId] ?? toolsBySlug[idOrSlug];
}

export function getRelatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.related.map((id) => toolsById[id]).filter(Boolean);
}
