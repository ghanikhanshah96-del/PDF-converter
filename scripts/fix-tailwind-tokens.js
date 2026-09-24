const fs = require("fs");
const path = require("path");

const roots = [
  path.join(__dirname, "..", "app"),
  path.join(__dirname, "..", "components"),
];

const replacements = [
  // longer / more specific first
  ["hover:bg-[var(--brand-soft)]", "hover:bg-brand-soft"],
  ["hover:border-[var(--brand)]", "hover:border-brand"],
  ["hover:text-[var(--brand)]", "hover:text-brand"],
  ["hover:bg-[var(--brand)]", "hover:bg-brand"],
  ["hover:border-[var(--line)]", "hover:border-line"],
  ["group-hover:text-[var(--brand)]", "group-hover:text-brand"],
  ["group-hover:border-[var(--brand)]", "group-hover:border-brand"],
  ["to-[var(--brand-soft)]", "to-brand-soft"],
  ["from-[var(--brand-soft)]", "from-brand-soft"],
  ["text-[var(--brand-deep)]", "text-brand-deep"],
  ["bg-[var(--brand-deep)]", "bg-brand-deep"],
  ["border-[var(--brand-deep)]", "border-brand-deep"],
  ["text-[var(--brand-soft)]", "text-brand-soft"],
  ["bg-[var(--brand-soft)]", "bg-brand-soft"],
  ["border-[var(--brand-soft)]", "border-brand-soft"],
  ["text-[var(--ink-muted)]", "text-ink-muted"],
  ["bg-[var(--ink-muted)]", "bg-ink-muted"],
  ["border-[var(--ink-muted)]", "border-ink-muted"],
  ["text-[var(--ink)]", "text-ink"],
  ["bg-[var(--ink)]", "bg-ink"],
  ["border-[var(--ink)]", "border-ink"],
  ["text-[var(--brand)]", "text-brand"],
  ["bg-[var(--brand)]", "bg-brand"],
  ["border-[var(--brand)]", "border-brand"],
  ["text-[var(--line)]", "text-line"],
  ["bg-[var(--line)]", "bg-line"],
  ["border-[var(--line)]", "border-line"],
  ["bg-[var(--bg-a)]", "bg-bg-a"],
  ["bg-[var(--bg-b)]", "bg-bg-b"],
  ["bg-[var(--bg-c)]", "bg-bg-c"],
  ["text-[var(--danger)]", "text-danger"],
  ["bg-[var(--danger)]", "bg-danger"],
  ["border-[var(--danger)]", "border-danger"],
  ["text-[var(--success)]", "text-success"],
  ["bg-[var(--success)]", "bg-success"],
  ["shadow-[var(--shadow)]", "shadow-tool"],
  ["text-[var(--brand)]/25", "text-brand/25"],
  ["bg-[var(--brand)]/25", "bg-brand/25"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changedFiles = 0;
let totalReplacements = 0;

for (const root of roots) {
  for (const file of walk(root)) {
    let src = fs.readFileSync(file, "utf8");
    const before = src;
    let fileCount = 0;
    for (const [from, to] of replacements) {
      if (!src.includes(from)) continue;
      const parts = src.split(from);
      const n = parts.length - 1;
      if (n > 0) {
        src = parts.join(to);
        fileCount += n;
      }
    }
    if (src !== before) {
      fs.writeFileSync(file, src);
      changedFiles += 1;
      totalReplacements += fileCount;
      console.log(path.relative(path.join(__dirname, ".."), file), fileCount);
    }
  }
}

console.log("files", changedFiles, "replacements", totalReplacements);
