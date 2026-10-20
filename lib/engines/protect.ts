import { isPdfEncrypted, protectPdfBytes } from "@/lib/pdf-encryption";

/**
 * Add an open password to a PDF (AES-256 via cryptpdf).
 * Locked inputs must be unlocked first (ToolWorkspace password gate).
 */
export async function protectPdf(
  file: File,
  password: string,
): Promise<Uint8Array> {
  if (await isPdfEncrypted(file)) {
    throw new Error(
      "This PDF is already password-protected. Unlock it first, then set a new password.",
    );
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  return protectPdfBytes(bytes, password);
}
