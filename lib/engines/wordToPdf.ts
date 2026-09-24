import { PDFDocument, rgb } from "pdf-lib";
import { embedTextFont } from "@/lib/pdfFont";

type ProgressCallback = (pct: number, label?: string) => void;

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    window.setTimeout(resolve, 0);
  });

export async function wordToPdf(
  file: File,
  onProgress?: ProgressCallback,
): Promise<Uint8Array> {
  onProgress?.(20, "Loading converters…");
  const mammoth = await import("mammoth");
  onProgress?.(30, "Reading Word file…");
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(42, "Extracting text…");
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = (result.value || "").trim() || "(Empty document)";
  await yieldToBrowser();

  const pdf = await PDFDocument.create();
  const { font, sanitize } = await embedTextFont(pdf);
  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const spaceWidth = font.widthOfTextAtSize(" ", fontSize);
  const paragraphs = text.split(/\r?\n/);
  const totalChars = Math.max(1, text.length);
  let processedChars = 0;

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  let renderedWords = 0;

  const drawLine = (line: string) => {
    const safe = sanitize(line);
    if (!safe) {
      y -= lineHeight;
      return;
    }

    if (y < margin + lineHeight) {
      page = pdf.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    page.drawText(safe, {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0.08, 0.1, 0.12),
    });
    y -= lineHeight;
  };

  onProgress?.(55, "Building PDF pages…");

  for (const paragraph of paragraphs) {
    const words = paragraph
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => sanitize(word));
    let line = "";
    let lineWidth = 0;

    for (const word of words) {
      if (!word) continue;
      const wordWidth = font.widthOfTextAtSize(word, fontSize);
      const testWidth = line ? lineWidth + spaceWidth + wordWidth : wordWidth;

      if (line && testWidth > maxWidth) {
        drawLine(line);
        line = word;
        lineWidth = wordWidth;
      } else {
        line = line ? `${line} ${word}` : word;
        lineWidth = testWidth;
      }

      renderedWords += 1;
      if (renderedWords % 800 === 0) {
        const progress = 55 + (processedChars / totalChars) * 32;
        onProgress?.(Math.round(progress), "Building PDF pages…");
        await yieldToBrowser();
      }
    }

    if (line) drawLine(line);
    if (!words.length) y -= lineHeight;

    processedChars += paragraph.length + 1;
  }

  onProgress?.(92, "Preparing download…");
  await yieldToBrowser();

  return pdf.save();
}
