import { PDFDocument } from "pdf-lib";

async function embedImage(doc: PDFDocument, file: File) {
  const bytes = await file.arrayBuffer();
  const type = file.type.toLowerCase();
  if (type.includes("png") || file.name.toLowerCase().endsWith(".png")) {
    return doc.embedPng(bytes);
  }
  return doc.embedJpg(bytes);
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
  if (files.length === 0) throw new Error("Add at least one image.");
  const doc = await PDFDocument.create();
  for (const file of files) {
    let image;
    try {
      image = await embedImage(doc, file);
    } catch {
      // WEBP or unsupported: draw via canvas to JPEG
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not available.");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to encode image."))),
          "image/jpeg",
          0.92,
        );
      });
      image = await doc.embedJpg(await blob.arrayBuffer());
    }
    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
  }
  return doc.save();
}
