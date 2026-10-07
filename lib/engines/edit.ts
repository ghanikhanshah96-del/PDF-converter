import { PDFDocument, rgb } from "pdf-lib";
import { embedTextFont } from "@/lib/pdfFont";

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

export async function applyPdfOverlays(
  file: File,
  texts: TextOverlay[],
  images: ImageOverlay[] = [],
  shapes: ShapeOverlay[] = [],
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const { font, sanitize } = await embedTextFont(doc);

  for (const overlay of shapes) {
    const page = doc.getPage(overlay.pageIndex);
    const { height } = page.getSize();
    const yBottom = height - overlay.y - overlay.height;
    const stroke = rgb(overlay.stroke.r, overlay.stroke.g, overlay.stroke.b);
    const fill = overlay.fill
      ? rgb(overlay.fill.r, overlay.fill.g, overlay.fill.b)
      : undefined;

    if (overlay.shape === "rect") {
      page.drawRectangle({
        x: overlay.x,
        y: yBottom,
        width: overlay.width,
        height: overlay.height,
        borderWidth: overlay.strokeWidth,
        borderColor: stroke,
        color: fill,
        opacity: fill ? 0.25 : 0,
        borderOpacity: 1,
      });
    } else if (overlay.shape === "ellipse") {
      page.drawEllipse({
        x: overlay.x + overlay.width / 2,
        y: yBottom + overlay.height / 2,
        xScale: overlay.width / 2,
        yScale: overlay.height / 2,
        borderWidth: overlay.strokeWidth,
        borderColor: stroke,
        color: fill,
        opacity: fill ? 0.25 : 0,
        borderOpacity: 1,
      });
    } else {
      page.drawLine({
        start: { x: overlay.x, y: height - overlay.y },
        end: {
          x: overlay.x + overlay.width,
          y: height - overlay.y - overlay.height,
        },
        thickness: overlay.strokeWidth,
        color: stroke,
      });
    }
  }

  for (const overlay of texts) {
    const page = doc.getPage(overlay.pageIndex);
    const { height } = page.getSize();
    const text = sanitize(overlay.text);
    if (!text) continue;
    const size = overlay.size ?? 16;
    const c = overlay.color ?? { r: 0.05, g: 0.1, b: 0.15 };
    page.drawText(text, {
      x: overlay.x,
      y: height - overlay.y - size,
      size,
      font,
      color: rgb(c.r, c.g, c.b),
    });
  }

  for (const overlay of images) {
    const page = doc.getPage(overlay.pageIndex);
    const { height } = page.getSize();
    const mime = overlay.mime.toLowerCase();
    const img = mime.includes("png")
      ? await doc.embedPng(overlay.imageBytes)
      : await doc.embedJpg(overlay.imageBytes);
    page.drawImage(img, {
      x: overlay.x,
      y: height - overlay.y - overlay.height,
      width: overlay.width,
      height: overlay.height,
    });
  }

  return doc.save();
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
