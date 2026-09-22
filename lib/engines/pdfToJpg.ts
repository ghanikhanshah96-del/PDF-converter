import JSZip from "jszip";
import { getPdfjs } from "@/lib/pdfjs";

export async function pdfToJpgBlobs(
  file: File,
  scale = 2,
  quality = 0.92,
): Promise<{ blobs: Blob[]; isZip: boolean }> {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const blobs: Blob[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available.");
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to encode JPG."))),
        "image/jpeg",
        quality,
      );
    });
    blobs.push(blob);
  }

  if (blobs.length === 1) {
    return { blobs, isZip: false };
  }

  const zip = new JSZip();
  blobs.forEach((blob, idx) => zip.file(`page-${idx + 1}.jpg`, blob));
  const zipBlob = await zip.generateAsync({ type: "blob" });
  return { blobs: [zipBlob], isZip: true };
}
