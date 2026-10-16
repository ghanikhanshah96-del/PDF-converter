import { degrees, rgb, type PDFDocument } from "pdf-lib";
import { embedTextFont } from "@/lib/pdfFont";
import { assertEditedText, rewriteLines } from "@/lib/pdf/applyLineEdits";
import { openUnencryptedPdf } from "@/lib/pdf/openPdf";
import type { LineEdit } from "@/lib/pdf/textRuns";
import {
  uprightEllipse,
  uprightImage,
  uprightText,
  viewportPointToPdf,
} from "@/lib/pdf/viewBox";

export interface TextOverlay {
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: { r: number; g: number; b: number };
  bold?: boolean;
}

export interface ImageOverlay {
  pageIndex: number;
  imageBytes: ArrayBuffer;
  mime: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ShapeOverlay {
  pageIndex: number;
  shape: "rect" | "ellipse" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  stroke: { r: number; g: number; b: number };
  fill: { r: number; g: number; b: number } | null;
  strokeWidth: number;
}

async function drawOverlays(
  doc: PDFDocument,
  texts: TextOverlay[],
  images: ImageOverlay[],
  shapes: ShapeOverlay[],
) {
  const { font, sanitize } = await embedTextFont(doc);

  for (const overlay of shapes) {
    const page = doc.getPage(overlay.pageIndex);
    const { width, height } = page.getSize();
    const rotation = page.getRotation().angle;
    const stroke = rgb(overlay.stroke.r, overlay.stroke.g, overlay.stroke.b);
    const fill = overlay.fill
      ? rgb(overlay.fill.r, overlay.fill.g, overlay.fill.b)
      : undefined;

    if (overlay.shape === "rect") {
      const box = uprightImage(
        rotation,
        width,
        height,
        overlay.x,
        overlay.y,
        overlay.width,
        overlay.height,
      );
      page.drawRectangle({
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        rotate: degrees(box.rotate),
        borderWidth: overlay.strokeWidth,
        borderColor: stroke,
        color: fill,
        opacity: fill ? 0.25 : 0,
        borderOpacity: 1,
      });
    } else if (overlay.shape === "ellipse") {
      const box = uprightEllipse(
        rotation,
        width,
        height,
        overlay.x,
        overlay.y,
        overlay.width,
        overlay.height,
      );
      page.drawEllipse({
        x: box.x,
        y: box.y,
        xScale: box.xScale,
        yScale: box.yScale,
        borderWidth: overlay.strokeWidth,
        borderColor: stroke,
        color: fill,
        opacity: fill ? 0.25 : 0,
        borderOpacity: 1,
      });
    } else {
      const start = viewportPointToPdf(rotation, width, height, overlay.x, overlay.y);
      const end = viewportPointToPdf(
        rotation,
        width,
        height,
        overlay.x + overlay.width,
        overlay.y + overlay.height,
      );
      page.drawLine({
        start,
        end,
        thickness: overlay.strokeWidth,
        color: stroke,
      });
    }
  }

  for (const overlay of texts) {
    const page = doc.getPage(overlay.pageIndex);
    const { width, height } = page.getSize();
    const text = sanitize(overlay.text);
    if (!text) continue;
    const size = overlay.size ?? 16;
    const c = overlay.color ?? { r: 0.05, g: 0.1, b: 0.15 };
    const placed = uprightText(page.getRotation().angle, width, height, overlay.x, overlay.y, size);
    page.drawText(text, {
      x: placed.x,
      y: placed.y,
      size,
      font,
      rotate: degrees(placed.rotate),
      color: rgb(c.r, c.g, c.b),
    });
  }

  for (const overlay of images) {
    const page = doc.getPage(overlay.pageIndex);
    const { width, height } = page.getSize();
    const mime = overlay.mime.toLowerCase();
    const img = mime.includes("png")
      ? await doc.embedPng(overlay.imageBytes)
      : await doc.embedJpg(overlay.imageBytes);
    const placed = uprightImage(
      page.getRotation().angle,
      width,
      height,
      overlay.x,
      overlay.y,
      overlay.width,
      overlay.height,
    );
    page.drawImage(img, {
      x: placed.x,
      y: placed.y,
      width: placed.width,
      height: placed.height,
      rotate: degrees(placed.rotate),
    });
  }
}

export async function applyPdfOverlays(
  file: File,
  texts: TextOverlay[],
  images: ImageOverlay[] = [],
  shapes: ShapeOverlay[] = [],
): Promise<Uint8Array> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await openUnencryptedPdf(bytes);
  await drawOverlays(doc, texts, images, shapes);
  return doc.save();
}

export async function applyPdfEdits(
  file: File,
  texts: TextOverlay[],
  images: ImageOverlay[] = [],
  shapes: ShapeOverlay[] = [],
  lineEdits: LineEdit[] = [],
): Promise<{ bytes: Uint8Array; notices: string[] }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await openUnencryptedPdf(bytes);
  const rewritten = await rewriteLines(doc, lineEdits);
  await drawOverlays(doc, texts, images, shapes);
  const saved = await doc.save();
  await assertEditedText(saved, rewritten.applied);
  return { bytes: saved, notices: rewritten.notices };
}

export async function stampSignatures(
  file: File,
  signatures: Array<{
    pageIndex: number;
    signaturePng: ArrayBuffer;
    x: number;
    y: number;
    width: number;
    height: number;
  }>,
): Promise<Uint8Array> {
  return applyPdfOverlays(
    file,
    [],
    signatures.map((s) => ({
      pageIndex: s.pageIndex,
      imageBytes: s.signaturePng,
      mime: "image/png",
      x: s.x,
      y: s.y,
      width: s.width,
      height: s.height,
    })),
  );
}

export async function stampSignature(
  file: File,
  options: {
    pageIndex: number;
    signaturePng: ArrayBuffer;
    x: number;
    y: number;
    width: number;
    height: number;
  },
): Promise<Uint8Array> {
  return stampSignatures(file, [options]);
}

export { rgb };
