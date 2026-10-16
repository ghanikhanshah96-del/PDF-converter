import JSZip from "jszip";
import { PDFDocument, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { embedTextFont } from "@/lib/pdfFont";

type Picture = { bytes: Uint8Array; mime: string };

const PAGE_W = 792;
const PAGE_H = 612;
const MARGIN = 36;
const SIZE = 9;
const ROW_H = 18;
const MAX_ROWS = 2000;
const MAX_COLS = 40;

function relationships(xml: string) {
  const found: { id: string; target: string }[] = [];
  for (const tag of xml.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const attrs = tag[1] ?? "";
    const id = /(?:\s|^)Id="([^"]+)"/.exec(attrs)?.[1];
    const target = /Target="([^"]+)"/.exec(attrs)?.[1];
    if (id && target) found.push({ id, target });
  }
  return found;
}

function resolveZipPath(baseFile: string, target: string) {
  const stack = baseFile.split("/").slice(0, -1);
  for (const part of target.split("/")) {
    if (part === "..") stack.pop();
    else if (part && part !== ".") stack.push(part);
  }
  return stack.join("/");
}

async function picturesForWorkbook(data: ArrayBuffer): Promise<Picture[][]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(data);
  } catch {
    return [];
  }
  const workbookXml = await zip.file("xl/workbook.xml")?.async("string");
  const workbookRels = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
  if (!workbookXml || !workbookRels) {
    const loose = await collectLoose(zip, new Set());
    return loose.length ? [loose] : [];
  }
  const rels = relationships(workbookRels);
  const sheets = [...workbookXml.matchAll(/<sheet\b([^>]*)\/?>/g)];
  const perSheet: Picture[][] = [];
  const used = new Set<string>();

  for (const sheet of sheets) {
    const attrs = sheet[1] ?? "";
    const relId = /r:id="([^"]+)"/i.exec(attrs)?.[1];
    const target = rels.find((rel) => rel.id === relId)?.target;
    const pictures: Picture[] = [];
    if (target) {
      const sheetPath = resolveZipPath("xl/workbook.xml", target);
      const sheetRelsPath = sheetPath.replace(/([^/]+)$/, "_rels/$1.rels");
      const sheetRels = await zip.file(sheetRelsPath)?.async("string");
      if (sheetRels) {
        for (const rel of relationships(sheetRels)) {
          if (!/drawings\//i.test(rel.target)) continue;
          const drawingPath = resolveZipPath(sheetPath, rel.target);
          const drawing = await zip.file(drawingPath)?.async("string");
          const drawingRels = await zip
            .file(drawingPath.replace(/([^/]+)$/, "_rels/$1.rels"))
            ?.async("string");
          if (!drawing || !drawingRels) continue;
          const drawingMap = relationships(drawingRels);
          for (const embed of drawing.matchAll(/r:embed="([^"]+)"/g)) {
            const media = drawingMap.find((item) => item.id === embed[1]);
            if (!media) continue;
            const mediaPath = resolveZipPath(drawingPath, media.target);
            if (used.has(mediaPath)) continue;
            const picture = await readMedia(zip, mediaPath);
            if (!picture) continue;
            used.add(mediaPath);
            pictures.push(picture);
          }
        }
      }
    }
    perSheet.push(pictures);
  }

  const leftover = await collectLoose(zip, used);
  if (leftover.length) perSheet.push(leftover);
  return perSheet;
}

async function readMedia(zip: JSZip, path: string): Promise<Picture | null> {
  const entry = zip.file(path);
  if (!entry) return null;
  const lower = path.toLowerCase();
  const mime = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".jpg") || lower.endsWith(".jpeg")
      ? "image/jpeg"
      : lower.endsWith(".gif")
        ? "image/gif"
        : lower.endsWith(".webp")
          ? "image/webp"
          : lower.endsWith(".bmp")
            ? "image/bmp"
            : "";
  if (!mime) return null;
  return { bytes: await entry.async("uint8array"), mime };
}

async function collectLoose(zip: JSZip, skip: Set<string>) {
  const pictures: Picture[] = [];
  for (const name of Object.keys(zip.files)) {
    if (skip.has(name) || !/^xl\/media\//i.test(name) || zip.files[name]?.dir) continue;
    const picture = await readMedia(zip, name);
    if (picture) pictures.push(picture);
  }
  return pictures;
}

async function paintJpeg(bytes: Uint8Array, mime: string): Promise<Uint8Array> {
  const copy = new Uint8Array(bytes);
  const url = URL.createObjectURL(new Blob([copy], { type: mime }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const edge = Math.max(img.naturalWidth, img.naturalHeight, 1);
    const scale = Math.min(1, 1400 / edge);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not draw a spreadsheet picture.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((result) => resolve(result), "image/jpeg", 0.92),
    );
    if (!blob) throw new Error("Could not draw a spreadsheet picture.");
    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function embedPicture(pdf: PDFDocument, picture: Picture): Promise<PDFImage> {
  const mime = picture.mime.toLowerCase();
  try {
    if (mime.includes("png")) return await pdf.embedPng(picture.bytes);
    if (mime.includes("jpeg") || mime.includes("jpg")) return await pdf.embedJpg(picture.bytes);
  } catch {
    // The browser will redraw formats pdf-lib cannot embed directly.
  }
  return pdf.embedJpg(await paintJpeg(picture.bytes, picture.mime));
}

function drawSafe(
  page: PDFPage,
  text: string,
  options: Parameters<PDFPage["drawText"]>[1],
) {
  try {
    page.drawText(text, options);
  } catch {
    // Skip a character this font cannot draw and keep the rest of the sheet.
  }
}

function fitText(font: PDFFont, text: string, width: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  try {
    if (font.widthOfTextAtSize(clean, SIZE) <= width) return clean;
    let kept = clean;
    while (kept.length > 1 && font.widthOfTextAtSize(`${kept}…`, SIZE) > width) {
      kept = kept.slice(0, -1);
    }
    return `${kept}…`;
  } catch {
    return clean.slice(0, 40);
  }
}

function drawTablePages(
  pdf: PDFDocument,
  font: PDFFont,
  title: string,
  rows: string[][],
  note: string,
) {
  const contentW = PAGE_W - MARGIN * 2;
  const widths = Array.from({ length: Math.max(...rows.map((row) => row.length), 0) }, (_, col) => {
    let widest = 48;
    for (let row = 0; row < Math.min(rows.length, 80); row += 1) {
      const text = rows[row]?.[col] ?? "";
      widest = Math.max(widest, Math.min(160, font.widthOfTextAtSize(text, SIZE) + 12));
    }
    return widest;
  });

  let colStart = 0;
  let first = true;
  while (colStart < widths.length || (widths.length === 0 && first)) {
    let used = 0;
    let colEnd = colStart;
    while (colEnd < widths.length && used + widths[colEnd] <= contentW) {
      used += widths[colEnd];
      colEnd += 1;
    }
    if (colEnd === colStart && widths.length) {
      used = Math.min(widths[colStart], contentW);
      colEnd += 1;
    }
    const scale = used > contentW ? contentW / used : 1;
    let rowStart = 0;
    const rowLimit = Math.min(rows.length, MAX_ROWS);
    do {
      const page = pdf.addPage([PAGE_W, PAGE_H]);
      drawSafe(page, title, { x: MARGIN, y: PAGE_H - 28, size: 16, font, color: rgb(0.1, 0.12, 0.16) });
      if (note && first) {
        drawSafe(page, note, { x: MARGIN, y: PAGE_H - 44, size: 9, font, color: rgb(0.35, 0.38, 0.42) });
      }
      let y = PAGE_H - (note && first ? 64 : 48);
      const bottom = MARGIN;
      if (!rows.length) {
        drawSafe(page, "This sheet has no cells.", {
          x: MARGIN,
          y: y - 8,
          size: 12,
          font,
          color: rgb(0.2, 0.22, 0.26),
        });
      }
      while (rowStart < rowLimit && y - ROW_H > bottom) {
        let x = MARGIN;
        const header = rowStart === 0;
        for (let col = colStart; col < colEnd; col += 1) {
          const width = widths[col] * scale;
          page.drawRectangle({
            x,
            y: y - ROW_H,
            width,
            height: ROW_H,
            borderWidth: 0.6,
            borderColor: rgb(0.75, 0.78, 0.82),
            color: header ? rgb(0.94, 0.95, 0.97) : rgb(1, 1, 1),
          });
          const text = fitText(font, rows[rowStart]?.[col] ?? "", width - 8);
          if (text) {
            drawSafe(page, text, {
              x: x + 4,
              y: y - ROW_H + 5,
              size: SIZE,
              font,
              color: rgb(0.12, 0.13, 0.16),
            });
          }
          x += width;
        }
        y -= ROW_H;
        rowStart += 1;
      }
      first = false;
    } while (rowStart < rowLimit && rows.length > 0);
    colStart = Math.max(colEnd, colStart + 1);
    if (!widths.length) break;
  }
}

async function drawPictures(
  pdf: PDFDocument,
  font: PDFFont,
  title: string,
  pictures: Picture[],
) {
  let missed = 0;
  for (const [index, picture] of pictures.entries()) {
    try {
      const image = await embedPicture(pdf, picture);
      const page = pdf.addPage([PAGE_W, PAGE_H]);
      drawSafe(page, `${title} — picture ${index + 1}`, {
        x: MARGIN,
        y: PAGE_H - 32,
        size: 14,
        font,
        color: rgb(0.1, 0.12, 0.16),
      });
      const maxW = PAGE_W - MARGIN * 2;
      const maxH = PAGE_H - 90;
      const scale = Math.min(maxW / image.width, maxH / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      page.drawImage(image, {
        x: MARGIN,
        y: PAGE_H - 56 - height,
        width,
        height,
      });
    } catch {
      missed += 1;
    }
  }
  if (missed) {
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    page.drawText(
      `${missed} picture${missed === 1 ? "" : "s"} could not be drawn. The spreadsheet cells are still included.`,
      { x: MARGIN, y: PAGE_H - 40, size: 12, font, color: rgb(0.35, 0.2, 0.2) },
    );
  }
}

export async function excelToPdf(file: File): Promise<Uint8Array> {
  if (typeof document === "undefined") {
    throw new Error("Excel to PDF runs in the browser.");
  }
  const XLSX = await import("xlsx");
  const data = await file.arrayBuffer();
  const pictures = await picturesForWorkbook(data);
  const workbook = XLSX.read(data, { type: "array", cellDates: true });
  const pdf = await PDFDocument.create();
  const { font, sanitize } = await embedTextFont(pdf);

  for (const [index, sheetName] of workbook.SheetNames.entries()) {
    const sheet = workbook.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json<(string | number | boolean | Date | null)[]>(sheet, {
      header: 1,
      defval: "",
      raw: false,
    });
    const limited = raw.slice(0, MAX_ROWS).map((row) =>
      row.slice(0, MAX_COLS).map((cell) => sanitize(cell == null ? "" : String(cell))),
    );
    const notes: string[] = [];
    if (raw.length > MAX_ROWS) notes.push(`Showing the first ${MAX_ROWS} rows.`);
    if (raw.some((row) => row.length > MAX_COLS)) notes.push(`Showing the first ${MAX_COLS} columns.`);
    const title = sanitize(sheetName) || `Sheet ${index + 1}`;
    drawTablePages(pdf, font, title, limited, notes.join(" "));
    await drawPictures(pdf, font, title, pictures[index] ?? []);
  }

  const trailing = pictures.slice(workbook.SheetNames.length);
  for (const group of trailing) {
    await drawPictures(pdf, font, "Pictures", group);
  }

  if (pdf.getPageCount() === 0) {
    const { font: emptyFont, sanitize } = await embedTextFont(pdf);
    const page = pdf.addPage([PAGE_W, PAGE_H]);
    page.drawText(sanitize("This spreadsheet is empty."), {
      x: MARGIN,
      y: PAGE_H - 48,
      size: 16,
      font: emptyFont,
    });
  }
  return pdf.save();
}
