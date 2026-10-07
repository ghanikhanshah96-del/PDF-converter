const fs = require("fs");
const path = require("path");

const overlays = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_seo-overlays.json"), "utf8"),
);

/** Structural fields preserved from product (not SEO copy). */
const structure = {
  "pdf-to-word": {
    slug: "pdf-to-word-converter-free",
    href: "/pdf-to-word-converter-free",
    name: "PDF to Word",
    shortName: "PDF → Word",
    category: "convert",
    related: ["word-to-pdf", "pdf-to-excel", "pdf-to-jpg"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "word-to-pdf": {
    slug: "word-to-pdf-converter-free",
    href: "/word-to-pdf-converter-free",
    name: "Word to PDF",
    shortName: "Word → PDF",
    category: "convert",
    related: ["pdf-to-word", "excel-to-pdf", "merge-pdf"],
    accept:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx",
    multiple: false,
  },
  "merge-pdf": {
    slug: "merge-pdf-online-free",
    href: "/merge-pdf-online-free",
    name: "Merge PDF",
    shortName: "Merge",
    category: "organize",
    related: ["split-pdf", "compress-pdf", "rotate-pdf"],
    accept: "application/pdf,.pdf",
    multiple: true,
  },
  "split-pdf": {
    slug: "split-pdf-online-free",
    href: "/split-pdf-online-free",
    name: "Split PDF",
    shortName: "Split",
    category: "organize",
    related: ["merge-pdf", "rotate-pdf", "compress-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "compress-pdf": {
    slug: "compress-pdf-free",
    href: "/compress-pdf-free",
    name: "Compress PDF",
    shortName: "Compress",
    category: "optimize",
    related: ["merge-pdf", "pdf-to-jpg", "jpg-to-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "pdf-to-jpg": {
    slug: "pdf-to-jpg-converter-free",
    href: "/pdf-to-jpg-converter-free",
    name: "PDF to JPG",
    shortName: "PDF → JPG",
    category: "convert",
    related: ["jpg-to-pdf", "compress-pdf", "pdf-to-word"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "jpg-to-pdf": {
    slug: "jpg-to-pdf-converter-free",
    href: "/jpg-to-pdf-converter-free",
    name: "JPG to PDF",
    shortName: "JPG → PDF",
    category: "convert",
    related: ["pdf-to-jpg", "merge-pdf", "compress-pdf"],
    accept: "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    multiple: true,
  },
  "edit-pdf": {
    slug: "edit-pdf-online-free",
    href: "/edit-pdf-online-free",
    name: "Edit PDF",
    shortName: "Edit",
    category: "edit",
    related: ["sign-pdf", "rotate-pdf", "merge-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "pdf-password-remover": {
    slug: "pdf-password-remover",
    href: "/pdf-password-remover",
    name: "PDF Password Remover",
    shortName: "Remove Password",
    category: "secure",
    related: ["unlock-pdf", "sign-pdf", "compress-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "sign-pdf": {
    slug: "sign-pdf-online-free",
    href: "/sign-pdf-online-free",
    name: "Sign PDF",
    shortName: "Sign",
    category: "edit",
    related: ["edit-pdf", "unlock-pdf", "merge-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "excel-to-pdf": {
    slug: "excel-to-pdf-converter",
    href: "/excel-to-pdf-converter",
    name: "Excel to PDF",
    shortName: "Excel → PDF",
    category: "convert",
    related: ["pdf-to-excel", "word-to-pdf", "jpg-to-pdf"],
    accept:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx",
    multiple: false,
  },
  "pdf-to-excel": {
    slug: "pdf-to-excel-converter",
    href: "/pdf-to-excel-converter",
    name: "PDF to Excel",
    shortName: "PDF → Excel",
    category: "convert",
    related: ["excel-to-pdf", "pdf-to-word", "pdf-to-jpg"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "rotate-pdf": {
    slug: "rotate-pdf-online",
    href: "/rotate-pdf-online",
    name: "Rotate PDF",
    shortName: "Rotate",
    category: "organize",
    related: ["split-pdf", "merge-pdf", "edit-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
  "unlock-pdf": {
    slug: "unlock-pdf-online",
    href: "/unlock-pdf-online",
    name: "Unlock PDF",
    shortName: "Unlock",
    category: "secure",
    related: ["pdf-password-remover", "sign-pdf", "edit-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
  },
};

const order = Object.keys(structure);

function q(s) {
  return JSON.stringify(s);
}

let out = `export type ToolId =
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
`;

for (const id of order) {
  const s = structure[id];
  const o = overlays[id];
  const summary = o.description.split(/(?<=\.)\s+/)[0].slice(0, 160);
  const keywords = o.keywords.length
    ? o.keywords
    : [id.replace(/-/g, " ")];

  out += `  {
    id: ${q(id)},
    slug: ${q(s.slug)},
    href: ${q(s.href)},
    name: ${q(s.name)},
    shortName: ${q(s.shortName)},
    category: ${q(s.category)},
    summary: ${q(summary)},
    description: ${q(o.description)},
    h1: ${q(o.h1)},
    title: ${q(o.title)},
    metaDescription: ${q(o.metaDescription)},
    howTo: ${JSON.stringify(o.howTo, null, 6).replace(/\n/g, "\n    ")},
    faqs: ${JSON.stringify(o.faqs, null, 6).replace(/\n/g, "\n    ")},
    related: ${JSON.stringify(s.related)},
    accept: ${q(s.accept)},
    multiple: ${s.multiple},
    keywords: ${JSON.stringify(keywords)},
  },
`;
}

out += `];

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
`;

fs.writeFileSync(path.join(__dirname, "..", "lib", "tools.ts"), out);
console.log("Regenerated lib/tools.ts with", order.length, "tools");
