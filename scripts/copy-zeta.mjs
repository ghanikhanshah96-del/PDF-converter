import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(root, "node_modules", "zetajs", "source");
const to = join(root, "public", "zeta");
mkdirSync(to, { recursive: true });

copyFileSync(join(from, "zeta.js"), join(to, "zeta.js"));
copyFileSync(join(from, "zetaHelper.js"), join(to, "zetaHelper.js"));
