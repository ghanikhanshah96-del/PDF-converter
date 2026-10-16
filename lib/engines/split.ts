import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { openUnencryptedPdf } from "@/lib/pdf/openPdf";
import { assertPdfHasVisiblePages } from "@/lib/pdf/visiblePdf";

export function parsePageRanges(
  input: string,
  pageCount: number,
): number[] {
  const pages = new Set<number>();
  const parts = input.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) {
    for (let i = 1; i <= pageCount; i++) pages.add(i);
    return [...pages];
  }
  for (const part of parts) {
    if (part.includes("-")) {
      const ends = part.split("-");
      if (ends.length !== 2) {
        throw new Error(`"${part}" is not a page range. Use numbers like 1-3.`);
      }
      const a = parseInt(ends[0].trim(), 10);
      const b = parseInt(ends[1].trim(), 10);
      if (!Number.isFinite(a) || !Number.isFinite(b) || a < 1 || b < 1 || !/^\d+$/.test(ends[0].trim()) || !/^\d+$/.test(ends[1].trim())) {
        throw new Error(`"${part}" is not a page range. Use numbers like 1-3.`);
      }
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      if (start > pageCount || end > pageCount) {
        throw new Error(
          `This PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}. The range ${part} goes past page ${pageCount}.`,
        );
      }
      for (let i = start; i <= end; i++) pages.add(i);
    } else {
      const n = parseInt(part, 10);
      if (!/^\d+$/.test(part) || !Number.isFinite(n)) {
        throw new Error(`"${part}" is not a page number.`);
      }
      if (n < 1 || n > pageCount) {
        throw new Error(
          `This PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}. Page ${part} is outside 1 to ${pageCount}.`,
        );
      }
      pages.add(n);
    }
  }
  return [...pages].sort((x, y) => x - y);
}

export async function splitPdfToSingle(
  file: File,
  rangeInput: string,
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await openUnencryptedPdf(bytes);
  const pageCount = src.getPageCount();
  const pages = parsePageRanges(rangeInput, pageCount);
  if (pages.length === 0) throw new Error("No valid pages selected.");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(
    src,
    pages.map((p) => p - 1),
  );
  copied.forEach((p) => out.addPage(p));
  const saved = await out.save();
  await assertPdfHasVisiblePages(saved);
  return { bytes: saved, pageCount };
}

export async function splitPdfToZip(
  file: File,
  rangeInput: string,
): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await openUnencryptedPdf(bytes);
  const pageCount = src.getPageCount();
  const pages = parsePageRanges(rangeInput, pageCount);
  if (pages.length === 0) throw new Error("No valid pages selected.");
  const zip = new JSZip();
  for (const pageNum of pages) {
    const out = await PDFDocument.create();
    const [copied] = await out.copyPages(src, [pageNum - 1]);
    out.addPage(copied);
    const saved = await out.save();
    await assertPdfHasVisiblePages(saved);
    zip.file(`page-${pageNum}.pdf`, saved);
  }
  return zip.generateAsync({ type: "blob" });
}

export async function getPdfPageCount(file: File): Promise<number> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await openUnencryptedPdf(bytes);
  return src.getPageCount();
}
