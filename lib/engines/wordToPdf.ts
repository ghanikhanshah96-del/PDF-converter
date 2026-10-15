import { PDFDocument } from "pdf-lib";
import { appendElementPages, separateBordersFromText } from "@/lib/engines/captureLayout";
import { enrichRenderedDocx } from "@/lib/engines/docxExtras";

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

  // Clip the live render so it can be measured without covering the page.
  const clip = document.createElement("div");
  clip.setAttribute("aria-hidden", "true");
  clip.style.position = "fixed";
  clip.style.left = "0";
  clip.style.top = "0";
  clip.style.width = "1400px";
  clip.style.height = "100vh";
  clip.style.overflow = "hidden";
  clip.style.pointerEvents = "none";
  clip.style.clipPath = "inset(100%)";
  clip.style.zIndex = "-1";

  const host = document.createElement("div");
  host.style.background = "#ffffff";
  clip.appendChild(host);
  document.body.appendChild(clip);

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

    onProgress?.(44, "Adding charts, images, and watermarks…");
    await enrichRenderedDocx(buffer, host);
    separateBordersFromText(host);
    await waitForImages(host);
    host.querySelectorAll("section.docx").forEach((node) => {
      const section = node as HTMLElement;
      const picture = [...section.querySelectorAll("img")].some(
        (img) => img.offsetHeight > section.clientHeight * 0.85,
      );
      if (picture || section.scrollHeight > section.clientHeight + 8) {
        section.style.overflow = "visible";
        section.style.height = "auto";
      }
    });
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
    clip.remove();
  }
}
