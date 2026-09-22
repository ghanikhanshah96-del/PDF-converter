import { PDFDocument } from "pdf-lib";
import { getPdfjs } from "@/lib/pdfjs";

export type CompressQuality = "high" | "medium" | "low";

const QUALITY_MAP: Record<CompressQuality, { scale: number; quality: number }> =
  {
    high: { scale: 1.5, quality: 0.82 },
    medium: { scale: 1.15, quality: 0.68 },
    low: { scale: 0.9, quality: 0.5 },
  };

export async function compressPdf(
  file: File,
  level: CompressQuality = "medium",
): Promise<Uint8Array> {
  const { scale, quality } = QUALITY_MAP[level];
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const src = await pdfjs.getDocument({ data }).promise;
  const out = await PDFDocument.create();

  for (let i = 1; i <= src.numPages; i++) {
    const page = await src.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to encode page."))),
        "image/jpeg",
        quality,
      );
    });
    const jpg = await out.embedJpg(await blob.arrayBuffer());
    const pdfPage = out.addPage([jpg.width, jpg.height]);
    pdfPage.drawImage(jpg, {
      x: 0,
      y: 0,
      width: jpg.width,
      height: jpg.height,
    });
  }

  return out.save({ useObjectStreams: true });
}
