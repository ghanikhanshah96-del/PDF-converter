const fs = require("fs");
const path = require("path");

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_seo-extract.json"), "utf8"),
);

function esc(s) {
  return JSON.stringify(s);
}

// --- toolPages.ts ---
let pages = `import type { ToolPagesMap } from "./types";

export const toolPages: ToolPagesMap = {\n`;

for (const [id, tool] of Object.entries(data)) {
  pages += `  ${esc(id)}: {\n    sections: [\n`;
  for (const section of tool.sections) {
    pages += `      ${JSON.stringify(section, null, 6).replace(/\n/g, "\n      ")},\n`;
  }
  pages += `    ],\n  },\n`;
}
pages += `};\n`;

fs.writeFileSync(
  path.join(__dirname, "..", "lib", "content", "toolPages.ts"),
  pages,
);

// --- seoFields overlay for tools.ts ---
const overlays = {};
for (const [id, tool] of Object.entries(data)) {
  const keywords = [];
  if (tool.primary) keywords.push(tool.primary);
  for (const k of tool.secondary || []) {
    if (!keywords.includes(k)) keywords.push(k);
  }
  overlays[id] = {
    title: tool.title,
    metaDescription: tool.metaDescription,
    h1: tool.h1,
    description: tool.description,
    howTo: tool.howTo,
    faqs: tool.faqs,
    keywords,
    summary: tool.metaDescription
      ? tool.metaDescription.replace(/\.$/, "").slice(0, 110)
      : tool.description.slice(0, 110),
  };
}

fs.writeFileSync(
  path.join(__dirname, "_seo-overlays.json"),
  JSON.stringify(overlays, null, 2),
);

console.log("Wrote lib/content/toolPages.ts and _seo-overlays.json");
