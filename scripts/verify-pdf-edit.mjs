import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { primeEditorFont } from "../lib/pdfFont.ts";
import { blankLines, blankUniqueOperands, replaceSimpleLiteral } from "../lib/pdf/textOps.ts";
import { groupTextLines } from "../lib/pdf/textRuns.ts";
import { bitmapSize, MAIN_PAGE_MIME, MAX_BITMAP_PIXELS, THUMB_MIME } from "../components/pdf-editor/renderPdfPages.ts";
import { applyPdfEdits } from "../lib/engines/edit.ts";
import { protectPdfBytes, unlockPdfBytes } from "../lib/pdf-encryption.ts";

const require = createRequire("c:/Users/stellix/Downloads/pdf converter/PDF-converter/package.json");
const pdfjs = await import(pathToFileURL(require.resolve("pdfjs-dist/legacy/build/pdf.mjs")).href);
const root = "c:/Users/stellix/Downloads/pdf converter/PDF-converter/";
const fontFile = readFileSync(`${root}public/fonts/NotoSans-Regular.ttf`);
primeEditorFont(fontFile.buffer.slice(fontFile.byteOffset, fontFile.byteOffset + fontFile.byteLength));

let failed = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed += 1;
}

async function itemOf(bytes, word) {
  const doc = await pdfjs.getDocument({ data: bytes.slice(), disableWorker: true }).promise;
  const page = await doc.getPage(1);
  const content = await page.getTextContent();
  const item = content.items.find((entry) => "str" in entry && entry.str.includes(word));
  if (!item || !("transform" in item)) return null;
  const [a, b, , , x, y] = item.transform;
  return { x, y, size: Math.hypot(a, b) };
}

async function textOf(bytes) {
  const doc = await pdfjs.getDocument({ data: bytes.slice(), disableWorker: true }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if ("str" in item) text += item.str;
    }
  }
  return text;
}

function fileFrom(bytes, name = "edit.pdf") {
  return new File([bytes], name, { type: "application/pdf" });
}

function lineEdit(patch) {
  return {
    id: "line",
    pageIndex: 0,
    original: "OriginalLine",
    text: "Manchester",
    items: ["OriginalLine"],
    x: 0.1,
    y: 0.12,
    w: 0.4,
    h: 0.04,
    originX: 72,
    originY: 660,
    advance: 280,
    fontSize: 18,
    angle: 0,
    cover: { r: 1, g: 1, b: 1 },
    color: { r: 0.05, g: 0.05, b: 0.05 },
    coverUncertain: false,
    ...patch,
  };
}

const viewport = {
  width: 612,
  height: 792,
  convertToViewportPoint(x, y) {
    return [x, 792 - y];
  },
};

const tj = "BT /F1 12 Tf 72 700 Td [(Hello) 120 (World)] TJ (KeepMe) Tj ET";
const blankedTj = blankUniqueOperands(tj, ["Hello", "World"]);
check("tj blanks only the edited operands", blankedTj !== null && !blankedTj.includes("(Hello)") && !blankedTj.includes("(World)") && blankedTj.includes("(KeepMe)"));
check("shared string is not blanked", blankUniqueOperands("(Hello) Tj (Hello) Tj", ["Hello"]) === null);
check("a token that also draws the neighbor is not blanked", blankUniqueOperands("(Hello World) Tj", ["Hello"]) === null);
const both = blankLines("(Alpha) Tj (Beta) Tj", [["Alpha"], ["Beta"]]);
check("two unique lines can both be removed", both.removed[0] && both.removed[1] && !both.content.includes("(Alpha)") && !both.content.includes("(Beta)"));

const columns = groupTextLines(
  [
    { str: "Left", transform: [12, 0, 0, 12, 40, 700], width: 30, height: 12 },
    { str: "Right", transform: [12, 0, 0, 12, 400, 700], width: 40, height: 12 },
  ],
  0,
  viewport,
);
check("columns stay separate lines", columns.length === 2 && columns.every((line) => line.editable), columns.map((line) => line.text).join("|"));

const mixed = groupTextLines(
  [
    { str: "H", transform: [18, 0, 0, 18, 40, 700], width: 14, height: 18 },
    { str: "2", transform: [8, 0, 0, 8, 56, 700], width: 6, height: 8 },
  ],
  0,
  viewport,
);
check("mixed sizes on one line are not editable", mixed.length === 1 && mixed[0].editable === false, `count ${mixed.length}`);

const tilted = groupTextLines(
  [{ str: "Tilt", transform: [8, 8, -8, 8, 80, 400], width: 40, height: 12 }],
  0,
  viewport,
);
check("arbitrary angle is not editable", tilted.length === 1 && tilted[0].editable === false && tilted[0].angle === null);

const capped = bitmapSize(4000, 6000, 3);
check("bitmap stays under the pixel cap", capped.width * capped.height <= MAX_BITMAP_PIXELS, `${capped.width}x${capped.height}`);
check("main page is PNG and thumbnails stay JPEG", MAIN_PAGE_MIME === "image/png" && THUMB_MIME === "image/jpeg");

const styled = "BT /F1 18 Tf 2 Tc 80 Tz 72 660 Td (OriginalLine) Tj ET";
const styledOut = replaceSimpleLiteral(styled, "OriginalLine", "Manchester");
check(
  "spacing operators stay with the original font size",
  Boolean(styledOut) &&
    styledOut.content.includes("2 Tc") &&
    styledOut.content.includes("80 Tz") &&
    styledOut.content.includes("/F1 18 Tf") &&
    styledOut.content.includes("(Manchester)") &&
    !styledOut.content.includes("(OriginalLine)") &&
    styledOut.fontSize === 18,
);
const simpleHex = replaceSimpleLiteral("BT /F1 18 Tf <4F726967696E616C4C696E65> Tj ET", "OriginalLine", "Manchester");
check(
  "single-byte hex keeps the same encoding",
  Boolean(simpleHex) && simpleHex.content.includes("<4d616e63686573746572>") && simpleHex.content.includes("/F1 18 Tf"),
);
check(
  "identity hex is not rewritten",
  replaceSimpleLiteral("BT /F1 18 Tf <004F00720069> Tj ET", "Ori", "Man") === null,
);

const made = await PDFDocument.create();
const page = made.addPage([612, 792]);
const font = await made.embedFont(StandardFonts.Helvetica);
page.drawText("KeepMe", { x: 72, y: 720, size: 18, font, color: rgb(0, 0, 0) });
page.drawText("OriginalLine", { x: 72, y: 660, size: 18, font, color: rgb(0, 0, 0) });
const source = await made.save();

const beforeKeep = await itemOf(source, "KeepMe");
const beforeLine = await itemOf(source, "OriginalLine");
const replaced = await applyPdfEdits(fileFrom(source), [], [], [], [lineEdit({})]);
const replacedText = await textOf(replaced.bytes);
const afterKeep = await itemOf(replaced.bytes, "KeepMe");
const afterLine = await itemOf(replaced.bytes, "Manchester");
check("literal font replacement removes the old words", replacedText.includes("Manchester") && replacedText.includes("KeepMe") && !replacedText.includes("OriginalLine"), replacedText);
check(
  "neighbor text stays put and the new words keep the size",
  Boolean(beforeKeep && afterKeep && beforeLine && afterLine) &&
    Math.abs(beforeKeep.x - afterKeep.x) < 0.6 &&
    Math.abs(beforeKeep.y - afterKeep.y) < 0.6 &&
    Math.abs(beforeLine.size - afterLine.size) < 0.6,
  `size ${beforeLine?.size} -> ${afterLine?.size}`,
);

let refused = false;
let refusedBytes = null;
try {
  refusedBytes = await applyPdfEdits(fileFrom(source), [], [], [], [
    lineEdit({ items: ["NotInStream"], text: "Replacement", original: "OriginalLine" }),
  ]);
} catch (error) {
  refused = error instanceof Error && /can't take those letters/.test(error.message) && /No file was saved/.test(error.message);
}
check("custom encoding is refused and nothing is saved", refused && refusedBytes === null);

let glyphFailed = false;
try {
  await applyPdfEdits(fileFrom(source), [], [], [], [lineEdit({ text: "مرحبا" })]);
} catch (error) {
  glyphFailed = error instanceof Error && /can't take those letters/.test(error.message) && /No file was saved/.test(error.message);
}
check("missing glyphs save nothing", glyphFailed);

const locked = await protectPdfBytes(source, "secret");
let lockedFailed = false;
try {
  await applyPdfEdits(fileFrom(locked), [], [], [], [lineEdit({})]);
} catch (error) {
  lockedFailed = error instanceof Error && /password-protected/.test(error.message) && /No file was saved/.test(error.message);
}
check("encrypted bytes are not edited", lockedFailed);
const unlocked = await unlockPdfBytes(fileFrom(locked), "secret");
const unlockedEdit = await applyPdfEdits(fileFrom(unlocked), [], [], [], [lineEdit({})]);
const unlockedText = await textOf(unlockedEdit.bytes);
check("unlocked file can be edited and is no longer encrypted", unlockedText.includes("Manchester"));

const turned = await PDFDocument.create();
const turnedPage = turned.addPage([612, 792]);
const turnedFont = await turned.embedFont(StandardFonts.Helvetica);
turnedPage.drawText("Upright", { x: 72, y: 500, size: 16, font: turnedFont });
turnedPage.drawText("Sideways", { x: 300, y: 200, size: 16, font: turnedFont, rotate: degrees(90) });
const turnedBytes = await turned.save();
const turnedDoc = await pdfjs.getDocument({ data: turnedBytes.slice(), disableWorker: true }).promise;
const turnedPdfPage = await turnedDoc.getPage(1);
const turnedContent = await turnedPdfPage.getTextContent();
const turnedLines = groupTextLines(
  turnedContent.items.filter((item) => "str" in item).map((item) => ({
    str: item.str,
    transform: item.transform,
    width: item.width,
    height: item.height,
    dir: item.dir,
  })),
  0,
  turnedPdfPage.getViewport({ scale: 1 }),
);
const sideways = turnedLines.find((line) => line.text.includes("Sideways"));
check(
  "rotated text is selectable only at a right angle",
  Boolean(sideways?.editable) && (sideways.angle === 90 || sideways.angle === 270),
  sideways ? `angle ${sideways.angle}` : turnedLines.map((line) => line.text).join("|"),
);

const picture = await PDFDocument.create();
const picturePage = picture.addPage([612, 792]);
picturePage.drawRectangle({ x: 40, y: 40, width: 200, height: 80, color: rgb(0.2, 0.4, 0.8) });
const pictureBytes = await picture.save();
const pictureDoc = await pdfjs.getDocument({ data: pictureBytes.slice(), disableWorker: true }).promise;
const picturePageProxy = await pictureDoc.getPage(1);
const pictureText = await picturePageProxy.getTextContent();
const pictureLines = groupTextLines(
  pictureText.items.filter((item) => "str" in item && item.str).map((item) => ({
    str: item.str,
    transform: item.transform,
    width: item.width,
    height: item.height,
  })),
  0,
  picturePageProxy.getViewport({ scale: 1 }),
);
check("a scanned page has no text lines", pictureLines.length === 0);
const stamped = await applyPdfEdits(
  fileFrom(pictureBytes, "scan.pdf"),
  [{ pageIndex: 0, text: "Added", x: 50, y: 50, size: 18, color: { r: 0, g: 0, b: 0 } }],
  [],
  [],
  [],
);
check("an overlay can still be added to a picture page", (await textOf(stamped.bytes)).includes("Added"));

if (failed) {
  console.log(`${failed} failed`);
  process.exit(1);
}
console.log("all edit checks passed");
