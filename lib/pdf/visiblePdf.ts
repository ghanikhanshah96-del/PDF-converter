import { PDFArray, PDFDict, PDFDocument, PDFName, PDFRawStream } from "pdf-lib";
import { getPdfjs } from "@/lib/pdfjs";

const PAINT_OPS = [
  "paintImageXObject",
  "paintImageXObjectRepeat",
  "paintJpegXObject",
  "paintInlineImageXObject",
  "paintInlineImageXObjectGroup",
  "paintFormXObjectBegin",
  "constructPath",
  "fill",
  "eoFill",
  "stroke",
  "fillStroke",
  "eoFillStroke",
  "closeFillStroke",
  "closeEOFillStroke",
  "showText",
  "showSpacedText",
  "nextLineShowText",
  "nextLineSetSpacingShowText",
];

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "";
}

function isPasswordError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  const code = "code" in error ? Number(error.code) : NaN;
  return name === "PasswordException" || code === 1 || code === 2;
}

function assertJpeg(bytes: Uint8Array): void {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error("An embedded image is not a readable JPEG. No file was saved.");
  }
  let offset = 2;
  let sawFrame = false;
  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1];
    if (marker === 0x00 || marker === 0xff) {
      offset += 1;
      continue;
    }
    if (marker === 0xd9) break;
    if (marker === 0xda) {
      if (!sawFrame) throw new Error("An embedded image is not a readable JPEG. No file was saved.");
      return;
    }
    if (marker >= 0xc0 && marker <= 0xc2) sawFrame = true;
    const length = (bytes[offset + 2] << 8) | bytes[offset + 3];
    if (length < 2) break;
    offset += 2 + length;
  }
  throw new Error("An embedded image is not a readable JPEG. No file was saved.");
}

function decodeStream(stream: PDFRawStream): Uint8Array {
  try {
    return stream.getContents();
  } catch (error) {
    const message = errorText(error);
    if (/unknown|unsupported|filter|predictor/i.test(message)) {
      throw new Error("This PDF uses an unsupported compression filter. No file was saved.");
    }
    throw new Error("A page could not be decoded. No file was saved.");
  }
}

/** Decode each page stream with its declared filters and check JPEG images. */
export async function assertStreamsDecode(bytes: Uint8Array): Promise<void> {
  const doc = await openForCheck(bytes);
  for (const page of doc.getPages()) {
    const contents = page.node.Contents();
    const lookedUp =
      contents instanceof PDFArray
        ? contents.asArray().map((item) => doc.context.lookup(item))
        : [doc.context.lookup(contents)];
    const streams = lookedUp.filter((item): item is PDFRawStream => item instanceof PDFRawStream);
    if (streams.length === 0) {
      throw new Error("A page has no content. No file was saved.");
    }
    for (const stream of streams) {
      const decoded = decodeStream(stream);
      if (decoded.length === 0) throw new Error("A page has no content. No file was saved.");
    }
    const resources = page.node.Resources();
    const xobjects = resources?.lookup(PDFName.of("XObject"));
    if (!(xobjects instanceof PDFDict)) continue;
    for (const [, ref] of xobjects.entries()) {
      const image = doc.context.lookup(ref);
      if (!(image instanceof PDFRawStream)) continue;
      if (image.dict.get(PDFName.of("Subtype"))?.toString() !== "/Image") continue;
      const filter = image.dict.get(PDFName.of("Filter"))?.toString() ?? "";
      const decoded = decodeStream(image);
      if (filter.includes("DCTDecode")) assertJpeg(decoded);
    }
  }
}

async function openForCheck(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes);
  } catch (error) {
    if (/encrypt/i.test(errorText(error))) {
      throw new Error("This PDF is password-protected. Enter the password. No file was saved.");
    }
    throw new Error("This PDF is damaged or uses a format that cannot be read. No file was saved.");
  }
}

async function loadParser() {
  if (typeof window === "undefined") {
    return import("pdfjs-dist/legacy/build/pdf.mjs");
  }
  return getPdfjs();
}

/** Reject a PDF whose pages do not paint text, paths, or images. */
export async function assertPdfHasVisiblePages(bytes: Uint8Array): Promise<void> {
  await assertStreamsDecode(bytes);
  const pdfjs = await loadParser();
  const data = bytes.slice();
  let doc;
  try {
    doc = await pdfjs
      .getDocument({ data, disableWorker: typeof window === "undefined" } as never)
      .promise;
  } catch (error) {
    if (isPasswordError(error)) {
      throw new Error("This PDF is password-protected. Enter the password. No file was saved.");
    }
    throw new Error("This PDF could not be opened. No file was saved.");
  }
  if (doc.numPages < 1) throw new Error("The PDF has no pages. No file was saved.");
  const paint = new Set<number>();
  const ops = pdfjs.OPS as Record<string, number> | undefined;
  if (ops) {
    for (const name of PAINT_OPS) {
      if (typeof ops[name] === "number") paint.add(ops[name]);
    }
  }
  for (let index = 1; index <= doc.numPages; index += 1) {
    const page = await doc.getPage(index);
    const text = await page.getTextContent();
    const words = text.items.some((item) => "str" in item && item.str.trim().length > 0);
    const operators = await page.getOperatorList();
    const draws = operators.fnArray.some((fn) => paint.has(fn));
    if (!words && !draws) {
      throw new Error(`Page ${index} is blank. No file was saved.`);
    }
  }
}
