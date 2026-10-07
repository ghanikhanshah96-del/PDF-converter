import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const mdPath = path.join(root, "best free pdf converter content.md");
const outDir = path.join(root, "lib", "content", "legal");

fs.mkdirSync(outDir, { recursive: true });

const raw = fs.readFileSync(mdPath, "utf8");

function stripMd(s) {
  return s
    .replace(/\\+/g, "")
    .replace(/\*\*/g, "")
    .replace(/^\d+\\\.\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .trim();
}

function slugify(s) {
  return stripMd(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Split into documents by top-level numbered sections */
const docs = [];
const chunks = raw.split(/\n(?=# \*\*\d+\\?\.)/);
for (const chunk of chunks) {
  if (!chunk.trim()) continue;
  docs.push(chunk.trim());
}

function parseDoc(chunk) {
  const lines = chunk.split(/\r?\n/);
  let seoTitle = "";
  let metaDescription = "";
  let title = "";
  let updated = "";
  const blocks = [];
  let listBuf = [];

  const flushList = () => {
    if (!listBuf.length) return;
    blocks.push({ type: "ul", items: listBuf.map((t) => t.replace(/\*\*/g, "**")) });
    // keep ** for rich text
    listBuf = [];
  };

  let i = 0;
  // skip doc number heading
  if (lines[0]?.startsWith("# **")) i = 1;

  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line === "---") continue;
    // Skip empty markdown heading leftovers like "#"
    if (/^#+\s*$/.test(line) || line === "#") continue;

    if (line.startsWith("**SEO Title:**")) {
      seoTitle = line.replace("**SEO Title:**", "").trim();
      continue;
    }
    if (line.startsWith("**Meta Description:**")) {
      metaDescription = line.replace("**Meta Description:**", "").trim();
      continue;
    }
    if (/^\*\*Last Updated:/i.test(line)) {
      updated = line.replace(/\*\*/g, "").replace(/^Last Updated:\s*/i, "").trim();
      continue;
    }
    if (line.startsWith("# **")) {
      flushList();
      title = stripMd(line.replace(/^#\s*/, ""));
      continue;
    }
    if (line.startsWith("## **")) {
      flushList();
      const text = stripMd(line.replace(/^##\s*/, ""));
      const id = slugify(text);
      blocks.push({ type: "h2", id, text });
      continue;
    }
    if (line.startsWith("### **")) {
      flushList();
      blocks.push({ type: "h3", text: stripMd(line.replace(/^###\s*/, "")) });
      continue;
    }
    if (line.startsWith("* ")) {
      listBuf.push(line.slice(2).trim());
      continue;
    }
    // email-only line
    if (/^\*\*[^*]+@[^ *]+\*\*$/.test(line) || /^[^\s]+@[^\s]+$/.test(line.replace(/\*\*/g, ""))) {
      flushList();
      const address = line.replace(/\*\*/g, "").trim();
      if (address.includes("@")) {
        blocks.push({ type: "email", address });
        continue;
      }
    }
    flushList();
    // preserve ** for bold in paragraphs
    blocks.push({ type: "p", text: line });
  }
  flushList();

  // First paragraph after title becomes lead if present
  const firstP = blocks.findIndex((b) => b.type === "p");
  if (firstP >= 0) {
    blocks[firstP] = { type: "lead", text: blocks[firstP].text };
  }

  if (updated) {
    blocks.unshift({ type: "meta", text: `Last updated: ${updated}` });
  }

  return { seoTitle, metaDescription, title, blocks };
}

const map = {
  0: "about",
  1: "contact",
  2: "privacy",
  3: "disclaimer",
  4: "terms",
  5: "editorial",
};

// Remap privacy anchors to keep footer links working
const PRIVACY_ID_MAP = {
  "1-core-pdf-files-are-processed-locally": "local-conversion",
  "core-pdf-files-are-processed-locally": "local-conversion",
  "2-files-you-select": "no-uploads",
  "files-you-select": "no-uploads",
  "3-no-account-required-for-core-tools": "no-accounts",
  "no-account-required-for-core-tools": "no-accounts",
};

function q(s) {
  return JSON.stringify(s);
}

function emitTs(name, data) {
  // Fix privacy ids
  if (name === "privacy") {
    for (const b of data.blocks) {
      if (b.type === "h2" && b.id && PRIVACY_ID_MAP[b.id]) {
        b.id = PRIVACY_ID_MAP[b.id];
      }
    }
  }

  const lines = [];
  lines.push(`import type { ContentBlock } from "@/components/ContentPage";`);
  lines.push("");
  lines.push(`export const ${name}Meta = {`);
  lines.push(`  title: ${q(data.seoTitle)},`);
  lines.push(`  description: ${q(data.metaDescription)},`);
  lines.push(`} as const;`);
  lines.push("");
  lines.push(`export const ${name}Title = ${q(data.title)};`);
  lines.push("");
  lines.push(`export const ${name}Blocks: ContentBlock[] = ${JSON.stringify(data.blocks, null, 2)};`);
  lines.push("");
  fs.writeFileSync(path.join(outDir, `${name}.ts`), lines.join("\n"));
  console.log("Wrote", name, data.blocks.length, "blocks");
}

docs.forEach((chunk, idx) => {
  const key = map[idx];
  if (!key) return;
  emitTs(key, parseDoc(chunk));
});
