import { PDFDocument } from "pdf-lib";
import { protectPdfBytes } from "@/lib/pdf-encryption";

export type MergeOptions = {
  /** Optional password to protect the merged output (iLovePDF-style Protect). */
  outputPassword?: string;
};

export async function mergePdfs(
  files: File[],
  options: MergeOptions = {},
): Promise<Uint8Array> {
  if (files.length < 2) {
    throw new Error("Add at least two PDF files to merge.");
  }
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const out = await merged.save();
  const password = options.outputPassword?.trim();
  if (password) {
    return protectPdfBytes(out, password);
  }
  return out;
}
