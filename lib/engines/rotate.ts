import { PDFDocument, degrees } from "pdf-lib";

export type RotateAngle = 90 | 180 | 270;

export async function rotatePdf(
  file: File,
  angle: RotateAngle,
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  }
  return doc.save();
}
