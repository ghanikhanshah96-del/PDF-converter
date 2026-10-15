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
      const [a, b] = part.split("-").map((n) => parseInt(n.trim(), 10));
      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        throw new Error(`Invalid range: ${part}`);
      }
      const start = Math.min(a, b);
      const end = Math.max(a, b);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= pageCount) pages.add(i);
      }
    } else {
      const n = parseInt(part, 10);
      if (!Number.isFinite(n) || n < 1 || n > pageCount) {
        throw new Error(`Invalid page number: ${part}`);
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
