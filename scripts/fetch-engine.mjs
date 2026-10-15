import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "engine");
const source = "https://cdn.zetaoffice.net/zetaoffice_latest/";
const stamp = "zetaoffice_latest-2025-05-13";

async function existingStamp() {
  try {
    return await readFile(join(outDir, "stamp.txt"), "utf8");
  } catch {
    return "";
  }
}

async function download(name) {
  const response = await fetch(source + name);
  if (!response.ok) {
    throw new Error(`Could not download ${name}: ${response.status}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

if ((await existingStamp()).trim() === stamp) {
  const wasmReady = await stat(join(outDir, "soffice.wasm.gz")).then(
    (info) => info.size > 0,
    () => false,
  );
  const dataReady = await stat(join(outDir, "soffice.data.gz")).then(
    (info) => info.size > 0,
    () => false,
  );
  const scriptReady = await stat(join(outDir, "soffice.js")).then(
    (info) => info.size > 0,
    () => false,
  );
  const metaReady = await stat(join(outDir, "soffice.data.js.metadata")).then(
    (info) => info.size > 0,
    () => false,
  );
  if (wasmReady && dataReady && scriptReady && metaReady) {
    console.log("Document engine already prepared.");
    process.exit(0);
  }
}

await mkdir(outDir, { recursive: true });
console.log("Downloading the document engine…");
const script = await download("soffice.js");
const wasm = await download("soffice.wasm");
const data = await download("soffice.data");
const metadata = await download("soffice.data.js.metadata");
if (wasm[0] !== 0x00 || wasm[1] !== 0x61 || wasm[2] !== 0x73 || wasm[3] !== 0x6d) {
  throw new Error("The downloaded document engine is not a valid wasm file.");
}
if (data.length < 1000) throw new Error("The downloaded document data file is empty.");

await writeFile(join(outDir, "soffice.js"), script);
await writeFile(join(outDir, "soffice.data.js.metadata"), metadata);
await new Promise((resolve, reject) => {
  const file = createWriteStream(join(outDir, "soffice.wasm.gz"));
  file.on("finish", resolve);
  file.on("error", reject);
  file.end(gzipSync(wasm, { level: 6 }));
});
await new Promise((resolve, reject) => {
  const file = createWriteStream(join(outDir, "soffice.data.gz"));
  file.on("finish", resolve);
  file.on("error", reject);
  file.end(gzipSync(data, { level: 6 }));
});
await writeFile(join(outDir, "stamp.txt"), stamp);
const wasmGz = await stat(join(outDir, "soffice.wasm.gz"));
const dataGz = await stat(join(outDir, "soffice.data.gz"));
console.log(
  `Prepared engine files: wasm ${wasmGz.size} bytes, data ${dataGz.size} bytes.`,
);
