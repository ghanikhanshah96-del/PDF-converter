import { PDFDocument } from "pdf-lib";

const PX_TO_PT = 72 / 96;

function dataUrlToBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Keep heading rules and table grid lines outside the glyphs. */
export function separateBordersFromText(root: ParentNode) {
  root.querySelectorAll("p, h1, h2, h3, h4, h5, h6").forEach((node) => {
    const el = node as HTMLElement;
    const style = getComputedStyle(el);
    if (style.borderBottomStyle !== "none" && parseFloat(style.borderBottomWidth) > 0) {
      if ((parseFloat(style.paddingBottom) || 0) < 6) el.style.paddingBottom = "8px";
    }
  });

  root.querySelectorAll("td, th").forEach((node) => {
    const el = node as HTMLElement;
    const style = getComputedStyle(el);
    const pad = (side: "Top" | "Right" | "Bottom" | "Left", min: number) => {
      const key = `padding${side}` as const;
      if ((parseFloat(style[key]) || 0) < min) el.style[key] = `${min}px`;
    };
    pad("Top", 6);
    pad("Bottom", 6);
    pad("Left", 8);
    pad("Right", 8);
    el.style.verticalAlign = "middle";
    el.style.backgroundClip = "padding-box";
  });
}

async function paintElement(element: HTMLElement) {
  const { toCanvas } = await import("html-to-image");
  const widthPx = Math.max(1, Math.ceil(element.offsetWidth));
  const heightPx = Math.max(1, Math.ceil(element.offsetHeight));
  const canvas = await toCanvas(element, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    cacheBust: true,
    skipFonts: true,
    width: widthPx,
    height: heightPx,
    canvasWidth: widthPx * 2,
    canvasHeight: heightPx * 2,
    style: {
      transform: "none",
      margin: "0",
    },
  });
  return { canvas, widthPx, heightPx };
}

/** Paint an element and add PDF pages without stretching the picture. */
export async function appendElementPages(
  pdf: PDFDocument,
  element: HTMLElement,
  pageHeightPx?: number,
) {
  const { canvas, widthPx, heightPx } = await paintElement(element);
  const pageWidth = widthPx * PX_TO_PT;
  const sliceCss = pageHeightPx && pageHeightPx < heightPx ? pageHeightPx : heightPx;
  const slicePx = Math.max(1, Math.round((sliceCss / heightPx) * canvas.height));

  for (let y = 0; y < canvas.height; y += slicePx) {
    const sliceHeight = Math.min(slicePx, canvas.height - y);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = sliceHeight;
    const ctx = slice.getContext("2d");
    if (!ctx) throw new Error("Could not draw the PDF page.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      canvas,
      0,
      y,
      canvas.width,
      sliceHeight,
      0,
      0,
      canvas.width,
      sliceHeight,
    );

    const bytes = dataUrlToBytes(slice.toDataURL("image/jpeg", 0.95));
    const image = await pdf.embedJpg(bytes);
    const drawHeight = (sliceHeight / canvas.height) * heightPx * PX_TO_PT;
    const page = pdf.addPage([pageWidth, drawHeight]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: pageWidth,
      height: drawHeight,
    });
  }
}
