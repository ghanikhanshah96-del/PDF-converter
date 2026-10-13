import JSZip from "jszip";
import { PDFDocument, rgb } from "pdf-lib";
import { embedTextFont } from "@/lib/pdfFont";
import { embedRaster, type RasterImage } from "@/lib/engines/rasterImage";

function mimeForMedia(name: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".bmp")) return "image/bmp";
  return "";
}

async function readSpreadsheetImages(data: ArrayBuffer): Promise<RasterImage[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    return [];
  }
  const images: RasterImage[] = [];

  for (const name of Object.keys(zip.files)) {
    const entry = zip.files[name];
    if (!entry || entry.dir || !/^xl\/media\//i.test(name)) continue;
    const mime = mimeForMedia(name);
    if (!mime) continue;
    images.push({ bytes: await entry.async("uint8array"), mime });
  }

  return images;
}

export async function excelToPdf(file: File): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const data = await file.arrayBuffer();
  const pictures = await readSpreadsheetImages(data);
  const workbook = XLSX.read(data, { type: "array" });
  const pdf = await PDFDocument.create();
  const { font, sanitize } = await embedTextFont(pdf);
  const fontSize = 9;
  const lineHeight = 12;
  const margin = 40;
  const pageWidth = 792; // landscape letter
  const pageHeight = 612;

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    }) as (string | number | boolean | null)[][];

    let page = pdf.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;

    page.drawText(sanitize(sheetName), {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0.05, 0.25, 0.28),
    });
    y -= 22;

    for (const row of rows) {
      const cells = row.map((c) => (c == null ? "" : String(c)));
      const line = sanitize(cells.join("  |  "));
      const chunks: string[] = [];
      const maxChars = 140;
      for (let i = 0; i < line.length; i += maxChars) {
        chunks.push(line.slice(i, i + maxChars));
      }
      if (chunks.length === 0) chunks.push("");

      for (const chunk of chunks) {
        if (y < margin + lineHeight) {
          page = pdf.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        const text = sanitize(chunk.slice(0, 180));
        if (!text) {
          y -= lineHeight;
          continue;
        }
        page.drawText(text, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.1, 0.12, 0.14),
        });
        y -= lineHeight;
      }
    }
  }

  if (pictures.length) {
    let page = pdf.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    page.drawText(sanitize("Images from the spreadsheet"), {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0.05, 0.25, 0.28),
    });
    y -= 24;

    for (const picture of pictures) {
      const image = await embedRaster(pdf, picture);
      if (!image) continue;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2 - 24;
      const fit = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
      const width = image.width * fit;
      const height = image.height * fit;
      if (y < margin + height) {
        page = pdf.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawImage(image, { x: margin, y: y - height, width, height });
      y -= height + 16;
    }
  }

  if (pdf.getPageCount() === 0) {
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawText("Empty spreadsheet", {
      x: margin,
      y: pageHeight - margin,
      size: 12,
      font,
    });
  }

  return pdf.save();
}
