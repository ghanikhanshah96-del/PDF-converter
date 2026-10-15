import { PDFDocument } from "pdf-lib";
import { assertPdfHasVisiblePages } from "@/lib/pdf/visiblePdf";
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
    const task = pdfjs.getDocument({
      data: data.slice(),
      disableWorker: typeof window === "undefined",
    } as never);
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

function passwordError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const name = "name" in error ? String(error.name) : "";
  const code = "code" in error ? Number(error.code) : NaN;
  return name === "PasswordException" || code === 1 || code === 2;
}

async function rebuildVisiblePages(data: Uint8Array, password: string): Promise<Uint8Array> {
  if (typeof document === "undefined") {
    throw new Error(
      "This PDF’s encryption is not supported here. No file was saved.",
    );
  }
  const pdfjs = await getPdfjs();
  const src = await pdfjs.getDocument({ data: data.slice(), password }).promise;
  const out = await PDFDocument.create();
  for (let index = 1; index <= src.numPages; index += 1) {
    const page = await src.getPage(index);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not draw this PDF. No file was saved.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport, canvas }).promise;
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let ink = 0;
    for (let offset = 0; offset < pixels.length; offset += 64) {
      if (pixels[offset] < 250 || pixels[offset + 1] < 250 || pixels[offset + 2] < 250) ink += 1;
    }
    if (ink < 8) throw new Error(`Page ${index} is blank. No file was saved.`);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => (result ? resolve(result) : reject(new Error("Failed to encode page."))),
        "image/jpeg",
        0.92,
      );
    });
    const jpg = await out.embedJpg(await blob.arrayBuffer());
    const pdfPage = out.addPage([base.width, base.height]);
    pdfPage.drawImage(jpg, { x: 0, y: 0, width: base.width, height: base.height });
  }
  const saved = await out.save();
  await assertPdfHasVisiblePages(saved);
  return saved;
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
    const task = pdfjs.getDocument({
      data: data.slice(),
      password: trimmed,
      disableWorker: typeof window === "undefined",
    } as never);
    await task.promise;
  } catch (error) {
    if (passwordError(error)) throw new Error("Incorrect password. Please try again.");
    throw new Error("This PDF is damaged or uses encryption that cannot be read. No file was saved.");
  }

  try {
    const { decryptPDF } = await import("cryptpdf");
    const decrypted = await decryptPDF(data.slice(), trimmed);
    await assertPdfHasVisiblePages(decrypted);
    return decrypted;
  } catch (error) {
    if (error instanceof Error && /no file was saved|blank|could not be opened|damaged/i.test(error.message)) {
      throw error;
    }
    return rebuildVisiblePages(data, trimmed);
  }
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
  const { decryptPDF, encryptPDF } = await import("cryptpdf");
  const encrypted = await encryptPDF(bytes, trimmed, trimmed);
  try {
    const opened = await decryptPDF(encrypted.slice(), trimmed);
    await assertPdfHasVisiblePages(opened);
  } catch {
    throw new Error("The protected PDF could not be opened. No file was saved.");
  }
  return encrypted;
}
