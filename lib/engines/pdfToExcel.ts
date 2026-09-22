import * as XLSX from "xlsx";
import { getPdfjs } from "@/lib/pdfjs";

export async function pdfToExcel(file: File): Promise<ArrayBuffer> {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const allRows: string[][] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    type Item = { str: string; x: number; y: number };
    const items: Item[] = [];

    for (const raw of content.items) {
      if (!("str" in raw) || !raw.str.trim()) continue;
      items.push({
        str: raw.str,
        x: raw.transform?.[4] ?? 0,
        y: Math.round((raw.transform?.[5] ?? 0) * 10) / 10,
      });
    }

    items.sort((a, b) => b.y - a.y || a.x - b.x);

    const lines: { y: number; parts: Item[] }[] = [];
    for (const item of items) {
      const line = lines.find((l) => Math.abs(l.y - item.y) < 4);
      if (line) line.parts.push(item);
      else lines.push({ y: item.y, parts: [item] });
    }

    allRows.push([`--- Page ${i} ---`]);
    for (const line of lines) {
      line.parts.sort((a, b) => a.x - b.x);
      // Split into columns by large X gaps
      const cols: string[] = [];
      let current = "";
      let lastX: number | null = null;
      for (const part of line.parts) {
        if (lastX !== null && part.x - lastX > 28) {
          cols.push(current.trim());
          current = part.str;
        } else {
          current += (current ? " " : "") + part.str;
        }
        lastX = part.x + part.str.length * 4;
      }
      if (current.trim()) cols.push(current.trim());
      if (cols.length) allRows.push(cols);
    }
    allRows.push([]);
  }

  const sheet = XLSX.utils.aoa_to_sheet(allRows);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Extracted");
  return XLSX.write(book, { bookType: "xlsx", type: "array" });
}
