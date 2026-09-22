import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";
import { getPdfjs } from "@/lib/pdfjs";

type ProgressCallback = (pct: number, label?: string) => void;

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    window.setTimeout(resolve, 0);
  });

function getWorkerCount(pageCount: number) {
  const cores =
    typeof navigator === "undefined" ? 2 : navigator.hardwareConcurrency || 2;

  return Math.max(1, Math.min(pageCount, 4, Math.max(2, cores - 1)));
}

function pushCurrentLine(lines: string[], parts: string[]) {
  const line = parts.join(" ").trim();
  if (line) lines.push(line);
  parts.length = 0;
}

async function extractPageLines(
  pdf: Awaited<ReturnType<Awaited<ReturnType<typeof getPdfjs>>["getDocument"]>["promise"]>,
  pageNumber: number,
) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  const lines: string[] = [];
  const currentParts: string[] = [];
  let lastY: number | null = null;

  for (const item of content.items) {
    if (!("str" in item)) continue;

    const text = item.str.trim();
    if (!text) continue;

    const y = item.transform?.[5] ?? 0;
    if (lastY !== null && Math.abs(lastY - y) > 6) {
      pushCurrentLine(lines, currentParts);
    }

    currentParts.push(text);
    lastY = y;
  }

  pushCurrentLine(lines, currentParts);
  page.cleanup();

  return lines;
}

export async function pdfToWord(
  file: File,
  onProgress?: ProgressCallback,
): Promise<Blob> {
  onProgress?.(18, "Loading PDF.js…");
  const pdfjs = await getPdfjs();
  onProgress?.(24, "Reading PDF…");
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pageLines = new Array<string[]>(pdf.numPages);
  const workerCount = getWorkerCount(pdf.numPages);
  let nextPage = 1;
  let completedPages = 0;
  let lastProgress = 0;

  onProgress?.(30, `Extracting 0/${pdf.numPages} pages…`);
  await yieldToBrowser();

  async function runWorker() {
    while (nextPage <= pdf.numPages) {
      const pageNumber = nextPage;
      nextPage += 1;

      pageLines[pageNumber - 1] = await extractPageLines(pdf, pageNumber);
      completedPages += 1;

      const progress = 30 + (completedPages / pdf.numPages) * 45;
      if (progress - lastProgress >= 1 || completedPages === pdf.numPages) {
        lastProgress = progress;
        onProgress?.(
          Math.round(progress),
          `Extracted ${completedPages}/${pdf.numPages} pages…`,
        );
        await yieldToBrowser();
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, runWorker));
  pdf.cleanup();

  onProgress?.(80, "Building Word document…");
  const paragraphs: Paragraph[] = [];

  for (let i = 1; i <= pageLines.length; i++) {
    const lines = pageLines[i - 1] ?? [];
    paragraphs.push(
      new Paragraph({
        text: `Page ${i}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      }),
    );
    if (lines.length === 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "(No extractable text on this page.)",
              italics: true,
            }),
          ],
        }),
      );
    } else {
      for (const line of lines) {
        paragraphs.push(
          new Paragraph({
            children: [new TextRun(line)],
            spacing: { after: 80 },
          }),
        );
      }
    }

    if (i % 10 === 0) {
      onProgress?.(
        80 + Math.round((i / pageLines.length) * 10),
        `Building Word document ${i}/${pageLines.length}…`,
      );
      await yieldToBrowser();
    }
  }

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });
  onProgress?.(94, "Preparing download…");
  return Packer.toBlob(doc);
}
