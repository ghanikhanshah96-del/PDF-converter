import { PDFDocument, rgb } from "pdf-lib";
import { embedTextFont } from "@/lib/pdfFont";
import { decodeDataUri, embedRaster, type RasterImage } from "@/lib/engines/rasterImage";

type ProgressCallback = (pct: number, label?: string) => void;

type Piece =
  | { kind: "text"; text: string }
  | { kind: "image"; image: RasterImage };

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    window.setTimeout(resolve, 0);
  });

const BLOCK_TAGS = new Set([
  "p",
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "li",
  "tr",
  "blockquote",
  "pre",
  "table",
  "ul",
  "ol",
  "section",
  "article",
]);

function htmlToPieces(html: string): Piece[] {
  if (typeof DOMParser === "undefined") return [{ kind: "text", text: html }];

  const doc = new DOMParser().parseFromString(html, "text/html");
  const pieces: Piece[] = [];

  const pushText = (text: string) => {
    if (!text) return;
    const previous = pieces[pieces.length - 1];
    if (previous?.kind === "text") previous.text += text;
    else pieces.push({ kind: "text", text });
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.textContent ?? "");
      return;
    }
    if (!(node instanceof HTMLElement)) {
      node.childNodes.forEach(walk);
      return;
    }

    const tag = node.tagName.toLowerCase();
    if (tag === "img") {
      const decoded = decodeDataUri(node.getAttribute("src") || "");
      if (decoded) pieces.push({ kind: "image", image: decoded });
      return;
    }
    if (tag === "br") {
      pushText("\n");
      return;
    }

    const block = BLOCK_TAGS.has(tag);
    if (block) pushText("\n");
    node.childNodes.forEach(walk);
    if (block) pushText("\n");
  };

  doc.body.childNodes.forEach(walk);

  return pieces
    .map((piece) =>
      piece.kind === "text"
        ? { kind: "text" as const, text: piece.text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n") }
        : piece,
    )
    .filter((piece) => piece.kind === "image" || piece.text.trim().length > 0);
}

export async function wordToPdf(
  file: File,
  onProgress?: ProgressCallback,
): Promise<Uint8Array> {
  onProgress?.(18, "Loading converters…");
  const mammoth = await import("mammoth");
  onProgress?.(28, "Reading Word file…");
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(40, "Reading text and images…");
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const pieces = htmlToPieces(result.value || "");
  await yieldToBrowser();

  const pdf = await PDFDocument.create();
  const { font, sanitize } = await embedTextFont(pdf);
  const fontSize = 11;
  const lineHeight = 16;
  const margin = 50;
  const pageWidth = 612;
  const pageHeight = 792;
  const maxWidth = pageWidth - margin * 2;
  const maxImageHeight = pageHeight - margin * 2;
  const spaceWidth = font.widthOfTextAtSize(" ", fontSize);

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  let drewContent = false;

  const newPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };

  const drawLine = (line: string) => {
    const safe = sanitize(line);
    if (y < margin + lineHeight) newPage();
    if (safe) {
      page.drawText(safe, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.08, 0.1, 0.12),
      });
      drewContent = true;
    }
    y -= lineHeight;
  };

  const drawWrapped = (text: string) => {
    const paragraphs = text.split(/\r?\n/);
    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) {
        y -= lineHeight;
        continue;
      }

      let line = "";
      let lineWidth = 0;
      for (const word of words) {
        const safeWord = sanitize(word);
        if (!safeWord) continue;
        const wordWidth = font.widthOfTextAtSize(safeWord, fontSize);
        const testWidth = line ? lineWidth + spaceWidth + wordWidth : wordWidth;
        if (line && testWidth > maxWidth) {
          drawLine(line);
          line = safeWord;
          lineWidth = wordWidth;
        } else {
          line = line ? `${line} ${safeWord}` : safeWord;
          lineWidth = testWidth;
        }
      }
      if (line) drawLine(line);
    }
  };

  const drawImage = async (image: RasterImage) => {
    const embedded = await embedRaster(pdf, image);
    if (!embedded) return;

    const fit = Math.min(maxWidth / embedded.width, maxImageHeight / embedded.height, 1);
    const width = embedded.width * fit;
    const height = embedded.height * fit;
    if (y < margin + height) newPage();

    page.drawImage(embedded, {
      x: margin,
      y: y - height,
      width,
      height,
    });
    y -= height + 12;
    drewContent = true;
  };

  onProgress?.(58, "Building PDF pages…");
  let index = 0;
  for (const piece of pieces) {
    if (piece.kind === "image") await drawImage(piece.image);
    else drawWrapped(piece.text);

    index += 1;
    if (index % 8 === 0) {
      onProgress?.(
        Math.min(90, 58 + Math.round((index / Math.max(pieces.length, 1)) * 30)),
        "Building PDF pages…",
      );
      await yieldToBrowser();
    }
  }

  if (!drewContent) {
    page.drawText("Empty document", {
      x: margin,
      y: pageHeight - margin,
      size: fontSize,
      font,
      color: rgb(0.08, 0.1, 0.12),
    });
  }

  onProgress?.(94, "Preparing download…");
  await yieldToBrowser();
  return pdf.save();
}
