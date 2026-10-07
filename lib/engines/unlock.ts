import { unlockPdfBytes } from "@/lib/pdf-encryption";

/**
 * Unlock a PDF when the user supplies the known password.
 * Validates with PDF.js, then re-saves an unencrypted copy via pdf-lib.
 */
export async function unlockPdf(
  file: File,
  password: string,
): Promise<Uint8Array> {
  return unlockPdfBytes(file, password);
}
