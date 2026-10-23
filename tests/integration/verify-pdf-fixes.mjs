import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PDFDocument, PDFName, StandardFonts, degrees } from "pdf-lib";
import { splitPdfToSingle } from "../../lib/engines/split.ts";
import { mergePdfs } from "../../lib/engines/merge.ts";
import { imagesToPdf } from "../../lib/engines/jpgToPdf.ts";
import { unlockPdfBytes, protectPdfBytes } from "../../lib/pdf-encryption.ts";
import { openUnencryptedPdf } from "../../lib/pdf/openPdf.ts";
import { SITE } from "../../lib/site.ts";

const require = createRequire(new URL("../../package.json", import.meta.url));
const pdfjs = await import(pathToFileURL(require.resolve("pdfjs-dist/legacy/build/pdf.mjs")).href);
const root = fileURLToPath(new URL("../../", import.meta.url));
const outDir = join(tmpdir(), "pdf-converter-tests", "verification");
mkdirSync(outDir, { recursive: true });

let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed += 1;
}

async function textOf(bytes) {
  const doc = await pdfjs.getDocument({ data: bytes.slice(), disableWorker: true }).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const text = await page.getTextContent();
    const view = page.getViewport({ scale: 1 });
    pages.push({
      text: text.items.map((item) => ("str" in item ? item.str : "")).join(""),
      width: Math.round(view.width),
      height: Math.round(view.height),
      rotation: page.rotate,
    });
  }
  return pages;
}

function pngChunk(type, data) {
  const body = Buffer.concat([Buffer.from(type), data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(body.length - 4);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let i = 0; i < 8; i += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function makePng(colorType, pixel) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8;
  ihdr[9] = colorType;
  const raw = Buffer.concat([Buffer.from([0]), Buffer.from(pixel)]);
  return Buffer.concat([
    signature,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

function fileFrom(bytes, name, type) {
  return new File([bytes], name, { type });
}

const padBytes = readFileSync(`${root}tests/fixtures/q & q pad (15).pdf`);
const pad = fileFrom(padBytes, "q & q pad (15).pdf", "application/pdf");

const first = await splitPdfToSingle(pad, "1");
const firstPages = await textOf(first.bytes);
check("split pad page count", firstPages.length === 1, String(firstPages.length));
check("split pad has text", /Office/.test(firstPages[0].text), firstPages[0].text.slice(0, 40));
check("split pad size", firstPages[0].width === 595 && firstPages[0].height === 842, `${firstPages[0].width}x${firstPages[0].height}`);
writeFileSync(`${outDir}/pad-page1.pdf`, first.bytes);

const doc = await PDFDocument.create();
const font = await doc.embedFont(StandardFonts.Helvetica);
const sizes = [
  [420, 500],
  [500, 360],
  [300, 700],
];
for (let i = 0; i < sizes.length; i += 1) {
  const page = doc.addPage(sizes[i]);
  page.drawText(`MARKER-${i + 1}`, { x: 24, y: 24, size: 18, font });
  if (i === 1) page.setRotation(degrees(90));
}
const multiBytes = await doc.save();
const multi = fileFrom(multiBytes, "multi.pdf", "application/pdf");
const onlyLast = await textOf((await splitPdfToSingle(multi, "3")).bytes);
const onlyMiddle = await textOf((await splitPdfToSingle(multi, "2")).bytes);
const range = await textOf((await splitPdfToSingle(multi, "3,1")).bytes);
check("split last page", onlyLast.length === 1 && onlyLast[0].text.includes("MARKER-3"));
check("split middle rotation", onlyMiddle.length === 1 && onlyMiddle[0].rotation === 90, `rot ${onlyMiddle[0].rotation}`);
check(
  "split range order",
  range.length === 2 && range[0].text.includes("MARKER-1") && range[1].text.includes("MARKER-3"),
  range.map((page) => page.text).join(" | "),
);

const merged = await mergePdfs([pad, multi]);
const mergedPages = await textOf(merged);
check("merge page count", mergedPages.length === 4, String(mergedPages.length));
check("merge keeps pad size", mergedPages[0].width === 595 && mergedPages[0].height === 842);
check("merge keeps rotated page", mergedPages[2].rotation === 90, `rot ${mergedPages[2].rotation}`);
check("merge keeps narrow page", mergedPages[3].width === 300 && mergedPages[3].height === 700, `${mergedPages[3].width}x${mergedPages[3].height}`);
writeFileSync(`${outDir}/merged.pdf`, merged);

const { encryptPDF } = await import("cryptpdf");
const lockedBytes = await encryptPDF(multiBytes, "secret", "secret");
const locked = fileFrom(lockedBytes, "locked.pdf", "application/pdf");
let lockedSplit = "";
try {
  await splitPdfToSingle(locked, "1");
  lockedSplit = "saved a file";
} catch (error) {
  lockedSplit = error instanceof Error ? error.message : "error";
}
check("encrypted split refused", /password-protected/i.test(lockedSplit), lockedSplit);

const unlocked = await unlockPdfBytes(locked, "secret");
const unlockedPages = await textOf(unlocked);
check("unlock keeps text", unlockedPages.map((page) => page.text).join(" ").includes("MARKER-2"));
let wrong = "";
try {
  await unlockPdfBytes(locked, "nope");
  wrong = "saved a file";
} catch (error) {
  wrong = error instanceof Error ? error.message : "error";
}
check("wrong password refused", /incorrect password/i.test(wrong), wrong);

const protectedBytes = await protectPdfBytes(multiBytes, "secret");
let openedProtected = false;
try {
  await openUnencryptedPdf(protectedBytes);
} catch (error) {
  openedProtected = error instanceof Error && /password-protected/i.test(error.message);
}
check("protected output stays encrypted", openedProtected);
const protectedOpen = await unlockPdfBytes(fileFrom(protectedBytes, "protected.pdf", "application/pdf"), "secret");
check("protected output unlocks", (await textOf(protectedOpen)).some((page) => page.text.includes("MARKER-1")));

const userMerged = readFileSync(`${root}tests/fixtures/merged (2).pdf`);
let userSplit = "";
try {
  await splitPdfToSingle(fileFrom(userMerged, "merged (2).pdf", "application/pdf"), "");
  userSplit = "saved a file";
} catch (error) {
  userSplit = error instanceof Error ? error.message : "error";
}
check("user encrypted merge is not saved blank", /password-protected/i.test(userSplit) && userSplit !== "saved a file", userSplit);

const png = readFileSync(`${root}tests/fixtures/image.png`);
const imagePdf = await imagesToPdf([fileFrom(png, "image.png", "image/png")]);
const imageDoc = await PDFDocument.load(imagePdf);
const imagePage = imageDoc.getPages()[0].getSize();
check("png page width", Math.round(imagePage.width) === 1167, String(imagePage.width));
check("png page height", Math.round(imagePage.height) === 1650, String(imagePage.height));
writeFileSync(`${outDir}/image.pdf`, imagePdf);

const rgb = await imagesToPdf([fileFrom(makePng(2, [220, 20, 20]), "rgb.png", "image/png")]);
const gray = await imagesToPdf([fileFrom(makePng(0, [40]), "gray.png", "image/png")]);
check("rgb png converts", (await textOf(rgb)).length === 1);
check("gray png converts", (await textOf(gray)).length === 1);

const padDoc = await PDFDocument.load(padBytes);
const imageDict = padDoc.context.lookup(padDoc.getPages()[0].node.Resources()?.get(PDFName.of("XObject")));
let jpeg = null;
for (const [, ref] of imageDict.entries()) {
  const stream = padDoc.context.lookup(ref);
  if (stream?.dict?.get(PDFName.of("Subtype"))?.toString() === "/Image") jpeg = stream.getContents();
}
check("found jpeg fixture", jpeg && jpeg[0] === 0xff);
if (jpeg) {
  const jpegPdf = await imagesToPdf([fileFrom(jpeg, "scan.jpg", "image/jpeg")]);
  const size = (await PDFDocument.load(jpegPdf)).getPages()[0].getSize();
  check("jpeg converts", size.width === 2466 && size.height === 3160, `${size.width}x${size.height}`);
}

check("canonical host", SITE.url === "https://bestfreepdfconverter.com", SITE.url);
const { readFileSync: read } = await import("node:fs");
const config = read(`${root}next.config.ts`, "utf8");
check("no apex-to-www loop", !config.includes("https://www.bestfreepdfconverter.com/:path*"));

console.log(failed === 0 ? "ALL PASS" : `${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
