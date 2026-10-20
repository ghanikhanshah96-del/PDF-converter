import { readdirSync, readFileSync, writeFileSync, statSync } from "fs";
import path from "path";

const root = process.cwd();
const replacements = [
  [/StellixSoft Admin/g, "BestFreePDFConverter Admin"],
  [/StellixSoft/g, "BestFreePDFConverter"],
  [/stellixsoft\.com/g, "bestfreepdfconverter.com"],
  [/\/assets\/images\/stellixsoft-logo\.png/g, "/logo.png"],
  [/var\(--color-electricBlue-solid\)/g, "var(--brand)"],
  [/var\(--color-electricBlue\)/g, "var(--brand)"],
  [/var\(--color-deepSpace\)/g, "#2b2b33"],
  [/Enterprise Development/g, "Guides"],
];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(name)) continue;
    let text = readFileSync(full, "utf8");
    let next = text;
    for (const [re, to] of replacements) next = next.replace(re, to);
    if (next !== text) {
      writeFileSync(full, next);
      console.log("updated", path.relative(root, full));
    }
  }
}

for (const d of ["lib", "components/admin", "app/admin", "app/api/admin"]) {
  walk(path.join(root, d));
}
