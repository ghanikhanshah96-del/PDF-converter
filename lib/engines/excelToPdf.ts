import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function excelToPdf(file: File): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
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

    page.drawText(sheetName, {
      x: margin,
      y,
      size: 12,
      font,
      color: rgb(0.05, 0.25, 0.28),
    });
    y -= 22;

    for (const row of rows) {
      const cells = row.map((c) => (c == null ? "" : String(c)));
      const line = cells.join("  |  ");
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
        page.drawText(chunk.slice(0, 180), {
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
