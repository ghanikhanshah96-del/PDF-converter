import { PDFDocument } from "pdf-lib";

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "";
}

/** Load a PDF for editing. Encrypted bytes are rejected instead of being copied as ciphertext. */
export async function openUnencryptedPdf(bytes: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes);
  } catch (error) {
    if (/encrypt/i.test(errorText(error))) {
      throw new Error(
        "This PDF is password-protected. Enter the password before continuing. No file was saved.",
      );
    }
    throw new Error("This PDF is damaged or uses a format that cannot be read. No file was saved.");
  }
}
