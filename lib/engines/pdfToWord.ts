import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";
import { getPdfjs } from "@/lib/pdfjs";

type ProgressCallback = (pct: number, label?: string) => void;

type PageContent = {
  lines: string[];
  image: Uint8Array | null;
  width: number;
  height: number;
};

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
  return Math.max(1, Math.min(pageCount, 3, Math.max(2, cores - 1)));
}

function pushCurrentLine(lines: string[], parts: string[]) {
  const line = parts.join(" ").trim();
  if (line) lines.push(line);
  parts.length = 0;
}

async function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Uint8Array | null> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/jpeg", 0.86);
  });
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}

async function extractPage(
  pdf: Awaited<ReturnType<Awaited<ReturnType<typeof getPdfjs>>["getDocument"]>["promise"]>,
  pageNumber: number,
): Promise<PageContent> {
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

  let image: Uint8Array | null = null;
  let width = 0;
  let height = 0;

  if (typeof document !== "undefined") {
    const viewport = page.getViewport({ scale: 1.4 });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      image = await canvasToJpeg(canvas);
      const maxWidth = 624;
      const fit = Math.min(1, maxWidth / canvas.width);
      width = Math.max(1, Math.round(canvas.width * fit));
      height = Math.max(1, Math.round(canvas.height * fit));
    }
  }

  page.cleanup();
  return { lines, image, width, height };
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
  const pages = new Array<PageContent>(pdf.numPages);
  const workerCount = getWorkerCount(pdf.numPages);
  let nextPage = 1;
  let completedPages = 0;
  let lastProgress = 0;

  onProgress?.(30, `Reading 0/${pdf.numPages} pages…`);
  await yieldToBrowser();

  async function runWorker() {
    while (nextPage <= pdf.numPages) {
      const pageNumber = nextPage;
      nextPage += 1;
      pages[pageNumber - 1] = await extractPage(pdf, pageNumber);
      completedPages += 1;

      const progress = 30 + (completedPages / pdf.numPages) * 48;
      if (progress - lastProgress >= 1 || completedPages === pdf.numPages) {
        lastProgress = progress;
        onProgress?.(
          Math.round(progress),
          `Read ${completedPages}/${pdf.numPages} pages…`,
        );
        await yieldToBrowser();
      }
    }
  }

  await Promise.all(Array.from({ length: workerCount }, runWorker));
  pdf.cleanup();

  onProgress?.(82, "Building Word document…");
  const paragraphs: Paragraph[] = [];

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    paragraphs.push(
      new Paragraph({
        text: `Page ${pageNumber}`,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      }),
    );

    if (page?.image) {
      paragraphs.push(
        new Paragraph({
          children: [
            new ImageRun({
              type: "jpg",
              data: page.image,
              transformation: { width: page.width, height: page.height },
              altText: {
                name: `Page ${pageNumber}`,
                description: `Page ${pageNumber}`,
              },
            }),
          ],
          spacing: { after: 160 },
        }),
      );
    }

    const lines = page?.lines ?? [];
    if (lines.length === 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: page?.image
                ? "This page is included as an image. No selectable text was found."
                : "(No extractable text on this page.)",
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
  });

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });
  onProgress?.(94, "Preparing download…");
  return Packer.toBlob(doc);
}
