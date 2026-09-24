const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "lib", "content", "toolLayouts.ts");
let s = fs.readFileSync(p, "utf8");
s = s.replace(/blocks:\s*\[([^\]]+)\]/g, (_, inner) => {
  const ids = inner
    .split(",")
    .map((x) => x.trim().replace(/["']/g, ""))
    .filter(Boolean);
  const rest = ids.filter(
    (id) => !["hero", "privacy", "workspace", "related"].includes(id),
  );
  const next = ["hero", "privacy", "workspace", ...rest];
  return `blocks: [${next.map((id) => `"${id}"`).join(", ")}]`;
});
fs.writeFileSync(p, s);
console.log("normalized block order");
