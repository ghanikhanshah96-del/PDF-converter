import { PDFDocument } from "pdf-lib";
import { getPdfjs } from "@/lib/pdfjs";

/**
 * Unlock a PDF when the user supplies the known password.
 * Validates with PDF.js, then re-saves an unencrypted copy via pdf-lib.
 */
export async function unlockPdf(
  file: File,
  password: string,
): Promise<Uint8Array> {
  if (!password.trim()) {
    throw new Error("Enter the PDF password.");
  }

  const data = new Uint8Array(await file.arrayBuffer());

  try {
    const pdfjs = await getPdfjs();
    const task = pdfjs.getDocument({ data: data.slice(), password });
    await task.promise;
  } catch {
    throw new Error("Incorrect password or unsupported encryption.");
  }

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(data.slice(), { ignoreEncryption: true });
  } catch {
    throw new Error(
      "Could not unlock this PDF. The file may use unsupported encryption.",
    );
  }

  const unlocked = await PDFDocument.create();
  const pages = await unlocked.copyPages(doc, doc.getPageIndices());
  pages.forEach((p) => unlocked.addPage(p));
  return unlocked.save();
}
