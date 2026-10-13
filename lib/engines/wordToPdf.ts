import { PDFDocument } from "pdf-lib";
import { appendElementPages, separateBordersFromText } from "@/lib/engines/captureLayout";

type ProgressCallback = (pct: number, label?: string) => void;

const yieldToBrowser = () =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0);
  });

async function waitForImages(root: ParentNode) {
  const images = [...root.querySelectorAll("img")];
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        }),
    ),
  );
}

/**
 * Render the DOCX with its headings, tables, images, and page layout,
 * then place each page into the PDF.
 */
export async function wordToPdf(
  file: File,
  onProgress?: ProgressCallback,
): Promise<Uint8Array> {
  if (typeof document === "undefined") {
    throw new Error("Word to PDF runs in the browser.");
  }

  onProgress?.(12, "Loading layout engine…");
  const { renderAsync } = await import("docx-preview");

  onProgress?.(24, "Reading Word file…");
  const buffer = await file.arrayBuffer();

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "0";
  host.style.top = "0";
  host.style.zIndex = "-1";
  host.style.pointerEvents = "none";
  host.style.background = "#ffffff";
  document.body.appendChild(host);

  try {
    onProgress?.(38, "Building headings, tables, and layout…");
    await renderAsync(buffer, host, host, {
      inWrapper: true,
      breakPages: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      renderHeaders: true,
      renderFooters: true,
      renderFootnotes: true,
      renderEndnotes: true,
      useBase64URL: true,
      className: "docx",
    });

    separateBordersFromText(host);
    await waitForImages(host);
    if (document.fonts?.ready) await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const pages = [...host.querySelectorAll("section.docx")] as HTMLElement[];
    if (!pages.length) {
      throw new Error("This Word file did not produce any pages to convert.");
    }

    const pdf = await PDFDocument.create();

    for (let index = 0; index < pages.length; index += 1) {
      onProgress?.(
        48 + Math.round((index / pages.length) * 44),
        `Rendering page ${index + 1} of ${pages.length}…`,
      );
      pages[index].style.margin = "0";
      pages[index].style.boxShadow = "none";
      await appendElementPages(pdf, pages[index]);
      await yieldToBrowser();
    }

    onProgress?.(96, "Preparing download…");
    return pdf.save();
  } finally {
    host.remove();
  }
}
