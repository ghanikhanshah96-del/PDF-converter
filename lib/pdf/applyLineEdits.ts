import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  StandardFonts,
  degrees,
  rgb,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import { assertEditorGlyphs, editorFontBytes, embedEditorFont } from "@/lib/pdfFont";
import { assertPdfHasVisiblePages } from "@/lib/pdf/visiblePdf";
import { getPdfjs } from "@/lib/pdfjs";
import { blankLines, blankTextAt, replaceSimpleLiteral } from "@/lib/pdf/textOps";
import type { CardinalAngle, LineEdit } from "@/lib/pdf/textRuns";
import { uprightImage, viewSize, viewportPointToPdf } from "@/lib/pdf/viewBox";

const CANNOT =
  "This font can't take those letters. The line was left unchanged. No file was saved.";
const FIT = "This line does not fit on the page. No file was saved.";

const STANDARD: Record<string, StandardFonts> = {
  Helvetica: StandardFonts.Helvetica,
  "Helvetica-Bold": StandardFonts.HelveticaBold,
  "Helvetica-Oblique": StandardFonts.HelveticaOblique,
  "Helvetica-BoldOblique": StandardFonts.HelveticaBoldOblique,
  "Times-Roman": StandardFonts.TimesRoman,
  "Times-Bold": StandardFonts.TimesRomanBold,
  "Times-Italic": StandardFonts.TimesRomanItalic,
  "Times-BoldItalic": StandardFonts.TimesRomanBoldItalic,
  Courier: StandardFonts.Courier,
  "Courier-Bold": StandardFonts.CourierBold,
  "Courier-Oblique": StandardFonts.CourierOblique,
  "Courier-BoldOblique": StandardFonts.CourierBoldOblique,
};

export type AppliedLine = {
  pageIndex: number;
  original: string;
  drawn: string;
  removed: boolean;
};

export type LineEditResult = {
  notices: string[];
  applied: AppliedLine[];
};

async function inflateZlib(bytes: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(bytes);
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decodeRaw(stream: PDFRawStream): Promise<Uint8Array> {
  const raw = stream.getContents();
  const filter = stream.dict.get(PDFName.of("Filter"))?.toString() ?? "";
  const parms = stream.dict.lookup(PDFName.of("DecodeParms"));
  if (parms instanceof PDFDict) {
    const predictor = parms.get(PDFName.of("Predictor"));
    if (predictor instanceof PDFNumber && predictor.asNumber() > 1) {
      throw new Error("predictor");
    }
  }
  if (!filter || filter === "null") return raw;
  if (filter === "/FlateDecode") return inflateZlib(raw);
  throw new Error("filter");
}

function collectStreams(doc: PDFDocument, node: unknown): PDFRawStream[] {
  const looked = doc.context.lookup(node as never);
  if (looked instanceof PDFArray) {
    return looked.asArray().flatMap((item) => collectStreams(doc, item));
  }
  if (looked instanceof PDFRawStream) return [looked];
  return [];
}

async function readPageSource(page: PDFPage): Promise<string | null> {
  try {
    const contents = page.node.Contents();
    if (!contents) return "";
    const streams = collectStreams(page.doc, contents);
    if (streams.length === 0) return null;
    const parts: string[] = [];
    for (const stream of streams) {
      parts.push(new TextDecoder("iso-8859-1").decode(await decodeRaw(stream)));
    }
    return parts.join("\n");
  } catch {
    return null;
  }
}

function writePageSource(page: PDFPage, text: string) {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i) & 255;
  const stream = page.doc.context.stream(bytes);
  const ref = page.doc.context.register(stream);
  page.node.set(PDFName.of("Contents"), page.doc.context.obj([ref]));
}

function standardFont(page: PDFPage, resource: string): StandardFonts | null {
  const fonts = page.node.normalizedEntries().Font;
  const font = fonts.lookup(PDFName.of(resource));
  if (!(font instanceof PDFDict)) return null;
  const subtype = font.lookup(PDFName.of("Subtype"))?.toString() ?? "";
  if (subtype.includes("Type0")) return null;
  const encoding = font.lookup(PDFName.of("Encoding"))?.toString() ?? "";
  if (encoding.includes("Identity")) return null;
  if (font.lookup(PDFName.of("ToUnicode"))) return null;
  const base = font.lookup(PDFName.of("BaseFont"))?.toString().replace(/^\//, "") ?? "";
  if (!base || base.includes("+")) return null;
  return STANDARD[base] ?? null;
}

function roomFor(
  angle: CardinalAngle,
  originX: number,
  originY: number,
  pageWidth: number,
  pageHeight: number,
): number {
  if (angle === 90) return Math.max(4, originY - 2);
  if (angle === 180) return Math.max(4, originX - 2);
  if (angle === 270) return Math.max(4, pageHeight - originY - 2);
  return Math.max(4, pageWidth - originX - 2);
}

function paintReplacement(page: PDFPage, edit: LineEdit, font: PDFFont) {
  const { width, height } = page.getSize();
  const rotation = page.getRotation().angle;
  const view = viewSize(rotation, width, height);
  const bleed = Math.max(1.5, edit.fontSize * 0.16);
  const vx = edit.x * view.width - bleed;
  const vy = edit.y * view.height - bleed;
  const vw = Math.max(edit.w * view.width, edit.advance) + bleed * 2;
  const vh = edit.h * view.height + bleed * 2;
  const box = uprightImage(rotation, width, height, vx, vy, vw, vh);
  const cover = edit.coverUncertain ? { r: 1, g: 1, b: 1 } : edit.cover;
  page.drawRectangle({
    x: box.x,
    y: box.y,
    width: Math.max(box.width, 1),
    height: Math.max(box.height, 1),
    rotate: degrees(box.rotate),
    color: rgb(cover.r, cover.g, cover.b),
  });
  if (!edit.text) return;
  const baseline = viewportPointToPdf(
    rotation,
    width,
    height,
    edit.originX,
    view.height - edit.originY,
  );
  page.drawText(edit.text, {
    x: baseline.x,
    y: baseline.y,
    size: edit.fontSize,
    font,
    color: rgb(edit.color.r, edit.color.g, edit.color.b),
    rotate: degrees(edit.angle),
  });
}

export async function rewriteLines(
  doc: PDFDocument,
  edits: LineEdit[],
): Promise<LineEditResult> {
  const pending = edits.filter((edit) => edit.text !== edit.original);
  if (pending.length === 0) return { notices: [], applied: [] };

  const applied: AppliedLine[] = [];
  const writes: Array<{ page: PDFPage; source: string }> = [];
  const redraws: Array<{ page: PDFPage; edit: LineEdit }> = [];
  const byPage = new Map<number, LineEdit[]>();
  for (const edit of pending) {
    const list = byPage.get(edit.pageIndex) ?? [];
    list.push(edit);
    byPage.set(edit.pageIndex, list);
  }

  for (const [pageIndex, pageEdits] of byPage) {
    const page = doc.getPage(pageIndex);
    const { width, height } = page.getSize();
    const read = await readPageSource(page);
    if (read === null) throw new Error(CANNOT);
    let source: string = read;
    for (const edit of pageEdits) {
      const single =
        edit.items.length === 1 && edit.items[0] === edit.original
          ? replaceSimpleLiteral(source, edit.original, edit.text)
          : null;
      const standard = single ? standardFont(page, single.fontResource) : null;
      if (single && standard) {
        const probe = await PDFDocument.create();
        const font = await probe.embedFont(standard);
        const textWidth = edit.text ? font.widthOfTextAtSize(edit.text, single.fontSize) : 0;
        const limit = roomFor(edit.angle, edit.originX, edit.originY, width, height);
        if (textWidth > limit + 0.5) throw new Error(FIT);
        source = single.content;
        applied.push({
          pageIndex,
          original: edit.original,
          drawn: edit.text,
          removed: true,
        });
        continue;
      }

      const pieces = edit.items.filter((item) => item.trim().length > 0);
      const sameLine = pieces.join("") === edit.original || pieces.length === 0;
      let blanked = blankLines(source, [pieces.length ? pieces : [edit.original]]);
      if (!blanked.removed[0] && sameLine && pieces.length !== 1) {
        blanked = blankLines(source, [[edit.original]]);
      }
      if (!blanked.removed[0] && sameLine && edit.angle === 0) {
        const positioned = blankTextAt(source, {
          x: edit.originX,
          y: edit.originY,
          advance: edit.advance,
          fontSize: edit.fontSize,
        });
        if (positioned.removed) blanked = { content: positioned.content, removed: [true] };
      }
      if (!blanked.removed[0] && !sameLine) throw new Error(CANNOT);
      if (blanked.removed[0]) source = blanked.content;
      redraws.push({ page, edit });
      applied.push({
        pageIndex,
        original: edit.original,
        drawn: edit.text,
        removed: blanked.removed[0],
      });
    }
    writes.push({ page, source });
  }

  for (const write of writes) writePageSource(write.page, write.source);

  if (redraws.length > 0) {
    const fontBytes = await editorFontBytes();
    const drawn = redraws.map((item) => item.edit.text).join("");
    try {
      if (drawn) assertEditorGlyphs(fontBytes, drawn);
    } catch {
      throw new Error(CANNOT);
    }
    const font = await embedEditorFont(doc);
    for (const item of redraws) paintReplacement(item.page, item.edit, font);
  }

  return { notices: [], applied };
}

export async function assertEditedText(
  bytes: Uint8Array,
  applied: AppliedLine[],
): Promise<void> {
  await assertPdfHasVisiblePages(bytes);
  if (applied.length === 0) return;
  const pdfjs = await getPdfjs();
  const doc = await pdfjs
    .getDocument({ data: bytes.slice(), disableWorker: true } as never)
    .promise;
  for (const edit of applied) {
    const page = await doc.getPage(edit.pageIndex + 1);
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items) {
      if ("str" in item) text += item.str;
    }
    if (edit.drawn && !text.includes(edit.drawn)) {
      throw new Error("The edited text is missing from the saved PDF. No file was saved.");
    }
    const rest = edit.drawn ? text.replace(edit.drawn, "") : text;
    if (edit.removed && edit.original && rest.includes(edit.original)) {
      throw new Error("The original text is still in the saved PDF. No file was saved.");
    }
  }
}
