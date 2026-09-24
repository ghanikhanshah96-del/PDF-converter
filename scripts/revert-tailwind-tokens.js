const fs = require("fs");
const path = require("path");

const roots = [
  path.join(__dirname, "..", "app"),
  path.join(__dirname, "..", "components"),
];

// Reverse the earlier token migration that increased Problems noise
const replacements = [
  ["hover:bg-brand-soft", "hover:bg-[var(--brand-soft)]"],
  ["hover:border-brand", "hover:border-[var(--brand)]"],
  ["hover:text-brand", "hover:text-[var(--brand)]"],
  ["hover:bg-brand", "hover:bg-[var(--brand)]"],
  ["hover:border-line", "hover:border-[var(--line)]"],
  ["group-hover:text-brand", "group-hover:text-[var(--brand)]"],
  ["group-hover:border-brand", "group-hover:border-[var(--brand)]"],
  ["to-brand-soft", "to-[var(--brand-soft)]"],
  ["from-brand-soft", "from-[var(--brand-soft)]"],
  ["text-brand-deep", "text-[var(--brand-deep)]"],
  ["bg-brand-deep", "bg-[var(--brand-deep)]"],
  ["border-brand-deep", "border-[var(--brand-deep)]"],
  ["text-brand-soft", "text-[var(--brand-soft)]"],
  ["bg-brand-soft", "bg-[var(--brand-soft)]"],
  ["border-brand-soft", "border-[var(--brand-soft)]"],
  ["text-ink-muted", "text-[var(--ink-muted)]"],
  ["bg-ink-muted", "bg-[var(--ink-muted)]"],
  ["border-ink-muted", "border-[var(--ink-muted)]"],
  ["text-brand/25", "text-[var(--brand)]/25"],
  ["bg-brand/25", "bg-[var(--brand)]/25"],
  ["text-brand", "text-[var(--brand)]"],
  ["bg-brand", "bg-[var(--brand)]"],
  ["border-brand", "border-[var(--brand)]"],
  ["text-ink", "text-[var(--ink)]"],
  ["bg-ink", "bg-[var(--ink)]"],
  ["border-ink", "border-[var(--ink)]"],
  ["divide-line", "divide-[var(--line)]"],
  ["border-line", "border-[var(--line)]"],
  ["bg-line", "bg-[var(--line)]"],
  ["text-line", "text-[var(--line)]"],
  ["bg-bg-a", "bg-[var(--bg-a)]"],
  ["bg-bg-b", "bg-[var(--bg-b)]"],
  ["bg-bg-c", "bg-[var(--bg-c)]"],
  ["text-danger", "text-[var(--danger)]"],
  ["bg-danger", "bg-[var(--danger)]"],
  ["border-danger", "border-[var(--danger)]"],
  ["text-success", "text-[var(--success)]"],
  ["bg-success", "bg-[var(--success)]"],
  ["shadow-tool", "shadow-[var(--shadow)]"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changedFiles = 0;
let total = 0;
for (const root of roots) {
  for (const file of walk(root)) {
    let src = fs.readFileSync(file, "utf8");
    const before = src;
    let n = 0;
    for (const [from, to] of replacements) {
      if (!src.includes(from)) continue;
      const parts = src.split(from);
      const count = parts.length - 1;
      // Avoid breaking words like "linking" if any — our tokens are class-safe
      src = parts.join(to);
      n += count;
    }
    if (src !== before) {
      fs.writeFileSync(file, src);
      changedFiles += 1;
      total += n;
      console.log(path.relative(path.join(__dirname, ".."), file), n);
    }
  }
}
console.log("reverted files", changedFiles, "replacements", total);
