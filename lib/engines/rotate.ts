import { degrees } from "pdf-lib";
import { openUnencryptedPdf } from "@/lib/pdf/openPdf";
import { normalizeRotation, type QuarterTurn } from "@/lib/pdf/viewBox";
import { assertPdfHasVisiblePages } from "@/lib/pdf/visiblePdf";

export type RotateAngle = 90 | 180 | 270;

export type PageTurn = {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
  from: QuarterTurn;
  to: QuarterTurn;
};

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

/** Turn selected pages clockwise by 90 or 270 degrees and return the new file. */
export async function turnPdfPages(
  file: File,
  pageIndexes: number[],
  delta: 90 | 270,
): Promise<{ file: File; changes: PageTurn[] }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await openUnencryptedPdf(bytes);
  const targets = [...new Set(pageIndexes)].filter(
    (index) => index >= 0 && index < doc.getPageCount(),
  );
  if (targets.length === 0) throw new Error("Choose a page to turn.");
  const changes: PageTurn[] = [];
  for (const index of targets) {
    const page = doc.getPage(index);
    const { width, height } = page.getSize();
    const from = normalizeRotation(page.getRotation().angle);
    const to = normalizeRotation(from + delta);
    page.setRotation(degrees(to));
    changes.push({ pageIndex: index, pageWidth: width, pageHeight: height, from, to });
  }
  const saved = await doc.save();
  await assertPdfHasVisiblePages(saved);
  const copy = new Uint8Array(saved.byteLength);
  copy.set(saved);
  return {
    file: new File([copy], file.name, {
      type: "application/pdf",
      lastModified: file.lastModified,
    }),
    changes,
  };
}
