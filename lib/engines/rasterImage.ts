import { PDFDocument, type PDFImage } from "pdf-lib";

export type RasterImage = {
  bytes: Uint8Array;
  mime: string;
};

export function decodeDataUri(src: string): RasterImage | null {
  const match = /^data:([^;,]+);base64,([\s\S]+)$/i.exec(src.trim());
  if (!match) return null;

  try {
    const binary = atob(match[2].replace(/\s/g, ""));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return { bytes, mime: match[1].toLowerCase() };
  } catch {
    return null;
  }
}

async function canvasToJpeg(bytes: Uint8Array, mime: string): Promise<Uint8Array | null> {
  if (typeof createImageBitmap !== "function" || typeof document === "undefined") {
    return null;
  }

  try {
    const copy = new Uint8Array(bytes);
    const bitmap = await createImageBitmap(
      new Blob([copy.buffer], { type: mime || "image/png" }),
    );
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return null;
    }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.92);
    });
    if (!blob) return null;
    return new Uint8Array(await blob.arrayBuffer());
  } catch {
    return null;
  }
}

/** Embed a PNG, JPEG, or other browser-decodable image into a PDF. */
export async function embedRaster(
  pdf: PDFDocument,
  image: RasterImage,
): Promise<PDFImage | null> {
  const mime = image.mime.toLowerCase();

  try {
    if (mime.includes("png")) return await pdf.embedPng(image.bytes);
    if (mime.includes("jpeg") || mime.includes("jpg")) return await pdf.embedJpg(image.bytes);
  } catch {
    // Fall through and re-encode through the browser.
  }

  const jpeg = await canvasToJpeg(image.bytes, mime);
  if (!jpeg) return null;

  try {
    return await pdf.embedJpg(jpeg);
  } catch {
    return null;
  }
}
