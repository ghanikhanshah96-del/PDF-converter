import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { appendElementPages } from "@/lib/engines/captureLayout";
import type { RasterImage } from "@/lib/engines/rasterImage";

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

function sheetElement(
  name: string,
  rows: (string | number | boolean | null)[][],
) {
  const section = document.createElement("section");
  section.style.background = "#ffffff";
  section.style.padding = "28px 32px 36px";
  section.style.boxSizing = "border-box";
  section.style.width = "fit-content";
  section.style.minWidth = "640px";
  section.style.maxWidth = "1400px";
  section.style.fontFamily = "Segoe UI, Arial, sans-serif";
  section.style.color = "#222226";

  const title = document.createElement("h2");
  title.textContent = name;
  title.style.margin = "0 0 16px";
  title.style.fontSize = "20px";
  title.style.lineHeight = "1.3";
  section.appendChild(title);

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.borderSpacing = "0";
  table.style.width = "100%";

  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  rows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    for (let col = 0; col < columnCount; col += 1) {
      const cell = document.createElement(rowIndex === 0 ? "th" : "td");
      cell.textContent = row[col] == null ? "" : String(row[col]);
      cell.style.border = "1px solid #c5cad3";
      cell.style.padding = "8px 10px";
      cell.style.verticalAlign = "middle";
      cell.style.textAlign = "left";
      cell.style.fontSize = "13px";
      cell.style.lineHeight = "1.35";
      cell.style.fontWeight = rowIndex === 0 ? "700" : "400";
      cell.style.background = rowIndex === 0 ? "#f4f6f8" : "#ffffff";
      cell.style.whiteSpace = "pre-wrap";
      tr.appendChild(cell);
    }
    table.appendChild(tr);
  });

  if (columnCount) section.appendChild(table);
  return section;
}

function imageElement(image: RasterImage) {
  const section = document.createElement("section");
  section.style.background = "#ffffff";
  section.style.padding = "28px 32px";
  section.style.width = "fit-content";
  const title = document.createElement("h2");
  title.textContent = "Images from the spreadsheet";
  title.style.margin = "0 0 16px";
  title.style.fontSize = "20px";
  section.appendChild(title);
  const img = document.createElement("img");
  const copy = new Uint8Array(image.bytes);
  const url = URL.createObjectURL(new Blob([copy.buffer], { type: image.mime }));
  img.src = url;
  img.style.display = "block";
  img.style.maxWidth = "900px";
  img.style.height = "auto";
  section.appendChild(img);
  return { section, url };
}

export async function excelToPdf(file: File): Promise<Uint8Array> {
  if (typeof document === "undefined") {
    throw new Error("Excel to PDF runs in the browser.");
  }

  const XLSX = await import("xlsx");
  const data = await file.arrayBuffer();
  const pictures = await readSpreadsheetImages(data);
  const workbook = XLSX.read(data, { type: "array" });
  const pdf = await PDFDocument.create();

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "0";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.pointerEvents = "none";
  host.style.background = "#ffffff";
  document.body.appendChild(host);

  const urls: string[] = [];

  try {
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
        sheet,
        { header: 1, defval: "", raw: false },
      );
      const section = sheetElement(sheetName, rows);
      host.appendChild(section);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      await appendElementPages(pdf, section, 1000);
      section.remove();
    }

    for (const picture of pictures) {
      const { section, url } = imageElement(picture);
      urls.push(url);
      host.appendChild(section);
      await new Promise<void>((resolve) => {
        const img = section.querySelector("img");
        if (!img || img.complete) {
          resolve();
          return;
        }
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
      await appendElementPages(pdf, section);
      section.remove();
    }

    if (pdf.getPageCount() === 0) {
      const section = document.createElement("section");
      section.textContent = "Empty spreadsheet";
      section.style.padding = "32px";
      section.style.background = "#ffffff";
      section.style.fontSize = "16px";
      host.appendChild(section);
      await appendElementPages(pdf, section);
    }

    return pdf.save();
  } finally {
    urls.forEach((url) => URL.revokeObjectURL(url));
    host.remove();
  }
}
