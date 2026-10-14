import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { pathToFileURL } from "url";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const CANDIDATES = [
  process.env.LIBREOFFICE_PATH,
  "C:\\Program Files\\LibreOffice\\program\\soffice.com",
  "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
  "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.com",
  "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
  "/usr/bin/soffice",
  "/usr/bin/libreoffice",
].filter((value): value is string => Boolean(value));

async function findSoffice() {
  for (const candidate of CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next install location.
    }
  }
  return null;
}

/**
 * Print a DOCX with LibreOffice, the same kind of document engine online
 * converters use, so charts, colors, and pages come from the file.
 */
export async function convertDocxToPdf(input: Buffer) {
  const soffice = await findSoffice();
  if (!soffice) {
    throw new Error(
      "Exact conversion is unavailable because the document engine is not installed on the server.",
    );
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "docx-pdf-"));
  const profile = path.join(dir, "profile");
  const inputPath = path.join(dir, `${randomUUID()}.docx`);
  await fs.mkdir(profile);
  await fs.writeFile(inputPath, input);

  try {
    await execFileAsync(
      soffice,
      [
        `-env:UserInstallation=${pathToFileURL(profile).href}`,
        "--headless",
        "--norestore",
        "--nolockcheck",
        "--nologo",
        "--nofirststartwizard",
        "--convert-to",
        "pdf:writer_pdf_Export",
        "--outdir",
        dir,
        inputPath,
      ],
      { timeout: 120000, windowsHide: true },
    );

    const pdfName = `${path.basename(inputPath, ".docx")}.pdf`;
    const pdf = await fs.readFile(path.join(dir, pdfName));
    if (pdf.length < 5 || pdf.subarray(0, 4).toString() !== "%PDF") {
      throw new Error("The document engine did not produce a PDF.");
    }
    return pdf;
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}
