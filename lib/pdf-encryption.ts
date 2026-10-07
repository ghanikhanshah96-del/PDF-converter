import { PDFDocument } from "pdf-lib";
import { getPdfjs } from "@/lib/pdfjs";

export function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type === "application/pdf" ||
    name.endsWith(".pdf") ||
    file.type === "application/x-pdf"
  );
}

/** True when the PDF requires a password to open. */
export async function isPdfEncrypted(file: File): Promise<boolean> {
  if (!isPdfFile(file)) return false;
  const data = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await getPdfjs();
  try {
    const task = pdfjs.getDocument({ data: data.slice() });
    await task.promise;
    return false;
  } catch (e) {
    const name = e && typeof e === "object" && "name" in e ? String((e as { name: string }).name) : "";
    const code =
      e && typeof e === "object" && "code" in e
        ? Number((e as { code: number }).code)
        : NaN;
    // PDF.js PasswordException: NEED_PASSWORD = 1, INCORRECT_PASSWORD = 2
    if (name === "PasswordException" || code === 1 || code === 2) return true;
    return false;
  }
}

/** Validate password and return an unencrypted PDF byte array. */
export async function unlockPdfBytes(
  file: File,
  password: string,
): Promise<Uint8Array> {
  const trimmed = password.trim();
  if (!trimmed) {
    throw new Error("Enter the PDF password.");
  }

  const data = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await getPdfjs();

  try {
    const task = pdfjs.getDocument({ data: data.slice(), password: trimmed });
    await task.promise;
  } catch {
    throw new Error("Incorrect password. Please try again.");
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

/** Build a File from unlocked bytes (keeps original name). */
export function unlockedPdfFile(original: File, bytes: Uint8Array): File {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new File([copy], original.name, {
    type: "application/pdf",
    lastModified: original.lastModified,
  });
}

/** Encrypt PDF bytes with a user (open) password — like iLovePDF Protect. */
export async function protectPdfBytes(
  bytes: Uint8Array,
  userPassword: string,
): Promise<Uint8Array> {
  const trimmed = userPassword.trim();
  if (!trimmed) {
    throw new Error("Enter a password to protect the PDF.");
  }
  const { encryptPDF } = await import("cryptpdf");
  return encryptPDF(bytes, trimmed, trimmed);
}
