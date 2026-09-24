const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "lib/content/toolPages.ts");
const outDir = path.join(root, "lib/content/pages");
fs.mkdirSync(outDir, { recursive: true });

const text = fs.readFileSync(src, "utf8");
const start = text.indexOf("export const toolPages");
const eq = text.indexOf("{", start);
let depth = 0;
let end = -1;
for (let i = eq; i < text.length; i++) {
  const c = text[i];
  if (c === "{") depth++;
  else if (c === "}") {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}

const objText = text.slice(eq, end + 1);
const toolPages = Function(`return (${objText})`)();
const ids = Object.keys(toolPages);

for (const id of ids) {
  const file = [
    'import type { ToolPageContent } from "../types";',
    "",
    `const content: ToolPageContent = ${JSON.stringify(toolPages[id], null, 2)};`,
    "",
    "export default content;",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(outDir, `${id}.ts`), file);
}

console.log("Wrote", ids.length, "files");
