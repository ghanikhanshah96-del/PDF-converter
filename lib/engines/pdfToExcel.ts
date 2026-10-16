import * as XLSX from "xlsx";
import { getPdfjs } from "@/lib/pdfjs";
import { addSheetPictures, type SheetPicture } from "@/lib/engines/xlsxImages";

type Placed = { str: string; x: number; y: number };

function rowsFromItems(items: Placed[]): string[][] {
  if (!items.length) return [];
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const columns: number[] = [];
  for (const item of [...sorted].sort((a, b) => a.x - b.x)) {
    if (!columns.length || item.x - columns[columns.length - 1] > 16) columns.push(item.x);
  }
  const lines: { y: number; parts: Placed[] }[] = [];
  for (const item of sorted) {
    const line = lines.find((entry) => Math.abs(entry.y - item.y) < 3.5);
    if (line) line.parts.push(item);
    else lines.push({ y: item.y, parts: [item] });
  }
  return lines.map((line) => {
    const cells = Array.from({ length: columns.length }, () => "");
    for (const part of [...line.parts].sort((a, b) => a.x - b.x)) {
      let column = 0;
      let nearest = Number.POSITIVE_INFINITY;
      columns.forEach((x, index) => {
        const gap = Math.abs(part.x - x);
        if (gap < nearest) {
          nearest = gap;
          column = index;
        }
      });
      cells[column] = cells[column] ? `${cells[column]} ${part.str}` : part.str;
    }
    return cells;
  });
}

async function canvasJpeg(
  canvas: HTMLCanvasElement,
): Promise<SheetPicture | null> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/jpeg", 0.9);
  });
  if (!blob) return null;
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    width: canvas.width,
    height: canvas.height,
  };
}

function scaledCanvas(width: number, height: number) {
  const edge = Math.max(width, height, 1);
  const scale = Math.min(1, 1100 / edge);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  return canvas;
}

async function pictureFromPdfImage(image: {
  width?: number;
  height?: number;
  data?: Uint8ClampedArray | Uint8Array;
  bitmap?: ImageBitmap;
}): Promise<SheetPicture | null> {
  const width = image.width ?? image.bitmap?.width ?? 0;
  const height = image.height ?? image.bitmap?.height ?? 0;
  if (width < 24 || height < 24) return null;
  const canvas = scaledCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (image.bitmap) {
    ctx.drawImage(image.bitmap, 0, 0, canvas.width, canvas.height);
    return canvasJpeg(canvas);
  }
  if (!image.data) return null;
  const pixels = image.data;
  const rgba = new Uint8ClampedArray(width * height * 4);
  if (pixels.length === width * height * 4) {
    rgba.set(pixels);
  } else if (pixels.length === width * height * 3) {
    for (let i = 0, j = 0; i < pixels.length; i += 3, j += 4) {
      rgba[j] = pixels[i];
      rgba[j + 1] = pixels[i + 1];
      rgba[j + 2] = pixels[i + 2];
      rgba[j + 3] = 255;
    }
  } else if (pixels.length === width * height) {
    for (let i = 0; i < pixels.length; i += 1) {
      const value = pixels[i];
      rgba[i * 4] = value;
      rgba[i * 4 + 1] = value;
      rgba[i * 4 + 2] = value;
      rgba[i * 4 + 3] = 255;
    }
  } else {
    return null;
  }
  const full = document.createElement("canvas");
  full.width = width;
  full.height = height;
  const fullCtx = full.getContext("2d");
  if (!fullCtx) return null;
  fullCtx.putImageData(new ImageData(rgba, width, height), 0, 0);
  ctx.drawImage(full, 0, 0, canvas.width, canvas.height);
  return canvasJpeg(canvas);
}

type PdfjsModule = Awaited<ReturnType<typeof getPdfjs>>;
type PdfDoc = Awaited<Awaited<ReturnType<PdfjsModule["getDocument"]>>["promise"]>;
type PdfPage = Awaited<ReturnType<PdfDoc["getPage"]>>;

async function pagePictures(pdfjs: PdfjsModule, page: PdfPage): Promise<SheetPicture[]> {
  if (typeof document === "undefined") return [];
  const found: SheetPicture[] = [];
  const seen = new Set<string>();
  try {
    const ops = await page.getOperatorList();
    const paint = new Set<number>([pdfjs.OPS.paintImageXObject]);
    if ("paintImageXObjectRepeat" in pdfjs.OPS) {
      paint.add(pdfjs.OPS.paintImageXObjectRepeat as number);
    }
    for (let i = 0; i < ops.fnArray.length && found.length < 12; i += 1) {
      if (!paint.has(ops.fnArray[i])) continue;
      const name = ops.argsArray[i]?.[0];
      if (typeof name !== "string" || seen.has(name)) continue;
      seen.add(name);
      let image: {
        width?: number;
        height?: number;
        data?: Uint8ClampedArray;
        bitmap?: ImageBitmap;
      } | null = null;
      try {
        image = (await page.objs.get(name)) as {
          width?: number;
          height?: number;
          data?: Uint8ClampedArray;
          bitmap?: ImageBitmap;
        };
      } catch {
        try {
          image = (await page.commonObjs.get(name)) as {
            width?: number;
            height?: number;
            data?: Uint8ClampedArray;
            bitmap?: ImageBitmap;
          };
        } catch {
          image = null;
        }
      }
      if (!image) continue;
      try {
        const picture = await pictureFromPdfImage(image);
        if (picture) found.push(picture);
      } catch {
        // Skip a picture the browser cannot decode and keep the rest.
      }
    }
  } catch {
    // Fall through to a single page picture when the operator list is unavailable.
  }
  if (found.length) return found;

  const viewport = page.getViewport({ scale: 1.25 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  const picture = await canvasJpeg(canvas);
  return picture ? [picture] : [];
}

export async function pdfToExcel(file: File): Promise<ArrayBuffer> {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data: data.slice() }).promise;
  const book = XLSX.utils.book_new();
  const groups: { sheetNumber: number; startRow: number; images: SheetPicture[] }[] = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const items: Placed[] = [];
    for (const raw of content.items) {
      if (!("str" in raw) || !raw.str.trim()) continue;
      items.push({
        str: raw.str.trim(),
        x: raw.transform?.[4] ?? 0,
        y: raw.transform?.[5] ?? 0,
      });
    }
    const rows = rowsFromItems(items);
    const pictures = await pagePictures(pdfjs, page);
    const sheetRows = rows.length ? rows : [["This page has no text."]];
    if (pictures.length) sheetRows.push([], ["Pictures from this page"]);
    const sheet = XLSX.utils.aoa_to_sheet(sheetRows);
    const name = `Page ${i}`.slice(0, 31);
    XLSX.utils.book_append_sheet(book, sheet, name);
    groups.push({ sheetNumber: i, startRow: sheetRows.length + 1, images: pictures });
    page.cleanup();
  }

  const raw = XLSX.write(book, { bookType: "xlsx", type: "array" }) as ArrayBuffer | Uint8Array;
  return addSheetPictures(raw, groups);
}
