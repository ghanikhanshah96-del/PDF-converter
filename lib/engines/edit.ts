import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export interface TextOverlay {
  pageIndex: number;
  text: string;
  x: number;
  y: number;
  size?: number;
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

export async function applyPdfOverlays(
  file: File,
  texts: TextOverlay[],
  images: ImageOverlay[] = [],
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfFont(doc);

  for (const overlay of texts) {
    const page = doc.getPage(overlay.pageIndex);
    const { height } = page.getSize();
    page.drawText(overlay.text, {
      x: overlay.x,
      y: height - overlay.y - (overlay.size ?? 16),
      size: overlay.size ?? 16,
      font,
      color: rgb(0.05, 0.1, 0.15),
    });
  }

  for (const overlay of images) {
    const page = doc.getPage(overlay.pageIndex);
    const { height } = page.getSize();
    const img =
      overlay.mime.includes("png")
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

async function pdfFont(doc: PDFDocument) {
  return doc.embedFont(StandardFonts.Helvetica);
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
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const page = doc.getPage(options.pageIndex);
  const { height } = page.getSize();
  const img = await doc.embedPng(options.signaturePng);
  page.drawImage(img, {
    x: options.x,
    y: height - options.y - options.height,
    width: options.width,
    height: options.height,
  });
  return doc.save();
}

export { degrees, rgb };
