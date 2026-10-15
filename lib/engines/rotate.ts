import { degrees } from "pdf-lib";
import { openUnencryptedPdf } from "@/lib/pdf/openPdf";
import { assertPdfHasVisiblePages } from "@/lib/pdf/visiblePdf";

export type RotateAngle = 90 | 180 | 270;

export async function rotatePdf(
  file: File,
  angle: RotateAngle,
): Promise<Uint8Array> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await openUnencryptedPdf(bytes);
  for (const page of doc.getPages()) {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  }
  const saved = await doc.save();
  await assertPdfHasVisiblePages(saved);
  return saved;
}
