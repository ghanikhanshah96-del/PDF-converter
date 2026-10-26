import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, open, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import https from "node:https";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { createGzip } from "node:zlib";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "engine");
const source = "https://cdn.zetaoffice.net/zetaoffice_latest/";
const stamp = "zetaoffice_latest-2025-05-13";
const browserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

async function existingStamp() {
  try {
    return await readFile(join(outDir, "stamp.txt"), "utf8");
  } catch {
    return "";
  }
}

function isWasm(buffer) {
  return (
    buffer.length >= 4 &&
    buffer[0] === 0x00 &&
    buffer[1] === 0x61 &&
    buffer[2] === 0x73 &&
    buffer[3] === 0x6d
  );
}

async function readPrefix(path, length = 80) {
  const fh = await open(path, "r");
  try {
    const buffer = Buffer.alloc(length);
    const { bytesRead } = await fh.read(buffer, 0, length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await fh.close();
  }
}

function preview(buffer, size) {
  const head = buffer.subarray(0, 80).toString("latin1").replace(/\s+/g, " ");
  return `${size} bytes, hex ${buffer.subarray(0, 8).toString("hex")}, text ${JSON.stringify(head)}`;
}

function curlBin() {
  return process.platform === "win32" ? "curl.exe" : "curl";
}

function runCurl(url, dest) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      curlBin(),
      [
        "--fail",
        "--location",
        "--silent",
        "--show-error",
        "--retry",
        "3",
        "--retry-delay",
        "2",
        "--http1.1",
        "--user-agent",
        browserAgent,
        "-H",
        "Accept-Encoding: identity",
        "-H",
        "Referer: https://zetaoffice.net/",
        "--output",
        dest,
        url,
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    const err = [];
    child.stderr.on("data", (chunk) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(Buffer.concat(err).toString("utf8").trim() || `curl exited ${code}`));
    });
  });
}

function downloadWithHttps(url, dest, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "identity",
          "User-Agent": browserAgent,
          Referer: "https://zetaoffice.net/",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const location = res.headers.location;
        if (status >= 300 && status < 400 && location) {
          res.resume();
          if (redirectCount >= 5) {
            reject(new Error(`Too many redirects downloading ${url}`));
            return;
          }
          downloadWithHttps(new URL(location, url).href, dest, redirectCount + 1).then(
            resolve,
            reject,
          );
          return;
        }
        if (status !== 200) {
          res.resume();
          reject(new Error(`Could not download ${url}: ${status}`));
          return;
        }
        const file = createWriteStream(dest);
        pipeline(res, file).then(resolve, reject);
      },
    );
    req.setTimeout(180_000, () => {
      req.destroy(new Error(`Timed out downloading ${url}`));
    });
    req.on("error", reject);
  });
}

async function download(name, dest) {
  const url = source + name;
  try {
    await runCurl(url, dest);
  } catch (curlError) {
    console.warn(`curl failed for ${name}: ${curlError.message}. Trying Node HTTPS…`);
    await downloadWithHttps(url, dest);
  }
  const info = await stat(dest);
  if (info.size < 100) {
    const head = await readPrefix(dest);
    throw new Error(`${name} was too small (${preview(head, info.size)}).`);
  }
  return info.size;
}

async function gzipFile(from, to) {
  await pipeline(
    createReadStream(from),
    createGzip({ level: 6 }),
    createWriteStream(to),
  );
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
const workDir = join(tmpdir(), `zeta-engine-${process.pid}`);
await mkdir(workDir, { recursive: true });
console.log("Downloading the document engine…");

const wasmRaw = join(workDir, "soffice.wasm");
const dataRaw = join(workDir, "soffice.data");
try {
  await download("soffice.js", join(outDir, "soffice.js"));
  await download("soffice.data.js.metadata", join(outDir, "soffice.data.js.metadata"));
  const wasmSize = await download("soffice.wasm", wasmRaw);
  const wasmHead = await readPrefix(wasmRaw, 4);
  if (!isWasm(wasmHead)) {
    throw new Error(
      `The downloaded document engine is not a valid wasm file (${preview(wasmHead, wasmSize)}).`,
    );
  }
  const dataSize = await download("soffice.data", dataRaw);
  if (dataSize < 1000) {
    const head = await readPrefix(dataRaw);
    throw new Error(`The downloaded document data file is empty (${preview(head, dataSize)}).`);
  }
  console.log("Compressing engine files for the site…");
  await gzipFile(wasmRaw, join(outDir, "soffice.wasm.gz"));
  await gzipFile(dataRaw, join(outDir, "soffice.data.gz"));
} finally {
  await unlink(wasmRaw).catch(() => {});
  await unlink(dataRaw).catch(() => {});
}

await writeFile(join(outDir, "stamp.txt"), stamp);
const wasmGz = await stat(join(outDir, "soffice.wasm.gz"));
const dataGz = await stat(join(outDir, "soffice.data.gz"));
console.log(
  `Prepared engine files: wasm ${wasmGz.size} bytes, data ${dataGz.size} bytes.`,
);
