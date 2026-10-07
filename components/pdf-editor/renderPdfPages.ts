import { getPdfjs } from "@/lib/pdfjs";
import type { PagePreview } from "./types";

type PdfjsDoc = Awaited<
  ReturnType<Awaited<ReturnType<typeof getPdfjs>>["getDocument"]>["promise"]
>;

const MAIN_WIDTH = 900;
const THUMB_WIDTH = 120;

async function canvasToObjectUrl(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode page."))),
      "image/jpeg",
      0.82,
    );
  });
  return URL.createObjectURL(blob);
}

async function renderOnePage(
  doc: PdfjsDoc,
  pageNumber: number,
): Promise<PagePreview> {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });

  const mainScale = MAIN_WIDTH / base.width;
  const mainVp = page.getViewport({ scale: mainScale });
  const mainCanvas = document.createElement("canvas");
  mainCanvas.width = Math.floor(mainVp.width);
  mainCanvas.height = Math.floor(mainVp.height);
  const mainCtx = mainCanvas.getContext("2d", { alpha: false });
  if (!mainCtx) throw new Error("Canvas not available.");
  await page.render({
    canvasContext: mainCtx,
    viewport: mainVp,
    canvas: mainCanvas,
  }).promise;

  const thumbScale = THUMB_WIDTH / base.width;
  const thumbVp = page.getViewport({ scale: thumbScale });
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = Math.floor(thumbVp.width);
  thumbCanvas.height = Math.floor(thumbVp.height);
  const thumbCtx = thumbCanvas.getContext("2d", { alpha: false });
  if (!thumbCtx) throw new Error("Canvas not available.");
  await page.render({
    canvasContext: thumbCtx,
    viewport: thumbVp,
    canvas: thumbCanvas,
  }).promise;

  const [imageUrl, thumbUrl] = await Promise.all([
    canvasToObjectUrl(mainCanvas),
    canvasToObjectUrl(thumbCanvas),
  ]);

  return {
    pageIndex: pageNumber - 1,
    pdfWidth: base.width,
    pdfHeight: base.height,
    displayWidth: mainCanvas.width,
    displayHeight: mainCanvas.height,
    imageUrl,
    thumbUrl,
  };
}

export type ProgressivePdf = {
  numPages: number;
  /** Renders a 1-based page if not already cached; returns preview */
  getPage: (pageIndex0: number) => Promise<PagePreview>;
  /** Prefetch nearby pages in background */
  prefetch: (centerIndex0: number) => void;
  destroy: () => void;
};

export async function openPdfProgressive(
  file: File,
  password?: string,
): Promise<ProgressivePdf> {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({
    data: data.slice(),
    ...(password ? { password } : {}),
  }).promise;

  const cache = new Map<number, PagePreview>();
  const inflight = new Map<number, Promise<PagePreview>>();
  let destroyed = false;

  const getPage = async (pageIndex0: number) => {
    if (destroyed) throw new Error("Document closed.");
    if (cache.has(pageIndex0)) return cache.get(pageIndex0)!;
    if (inflight.has(pageIndex0)) return inflight.get(pageIndex0)!;
    const p = renderOnePage(doc, pageIndex0 + 1).then((preview) => {
      cache.set(pageIndex0, preview);
      inflight.delete(pageIndex0);
      return preview;
    });
    inflight.set(pageIndex0, p);
    return p;
  };

  const prefetch = (centerIndex0: number) => {
    const targets = [centerIndex0 - 1, centerIndex0 + 1, centerIndex0 + 2]
      .filter((i) => i >= 0 && i < doc.numPages)
      .filter((i) => !cache.has(i) && !inflight.has(i));
    for (const i of targets) {
      void getPage(i);
    }
  };

  const destroy = () => {
    destroyed = true;
    for (const p of cache.values()) {
      URL.revokeObjectURL(p.imageUrl);
      URL.revokeObjectURL(p.thumbUrl);
    }
    cache.clear();
    void doc.cleanup();
  };

  return {
    numPages: doc.numPages,
    getPage,
    prefetch,
    destroy,
  };
}

/** @deprecated Prefer openPdfProgressive for speed */
export async function renderPdfPages(
  file: File,
  password?: string,
): Promise<PagePreview[]> {
  const progressive = await openPdfProgressive(file, password);
  const pages: PagePreview[] = [];
  for (let i = 0; i < progressive.numPages; i++) {
    pages.push(await progressive.getPage(i));
  }
  return pages;
}

export function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const [, b64 = ""] = dataUrl.split(",");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function fileToPngDataUrl(file: File): Promise<{
  src: string;
  bytes: ArrayBuffer;
  mime: string;
  width: number;
  height: number;
}> {
  const bitmap = await createImageBitmap(file);
  const c = document.createElement("canvas");
  c.width = bitmap.width;
  c.height = bitmap.height;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas not available.");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const src = c.toDataURL("image/png");
  return {
    src,
    bytes: dataUrlToArrayBuffer(src),
    mime: "image/png",
    width: c.width,
    height: c.height,
  };
}

export function renderTypedSignaturePng(
  text: string,
  options?: { fontSize?: number; color?: string },
): { src: string; bytes: ArrayBuffer; width: number; height: number } {
  const fontSize = options?.fontSize ?? 48;
  const color = options?.color ?? "#33333b";
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas not available.");
  ctx.font = `italic ${fontSize}px "Segoe Script", "Brush Script MT", cursive`;
  const metrics = ctx.measureText(text || "Signature");
  const padX = 16;
  const padY = 20;
  c.width = Math.ceil(metrics.width + padX * 2);
  c.height = Math.ceil(fontSize * 1.6 + padY);
  ctx.font = `italic ${fontSize}px "Segoe Script", "Brush Script MT", cursive`;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.fillStyle = color;
  ctx.fillText(text || "Signature", padX, fontSize + padY * 0.35);
  const src = c.toDataURL("image/png");
  return {
    src,
    bytes: dataUrlToArrayBuffer(src),
    width: c.width,
    height: c.height,
  };
}

export function canvasToPngBuffer(canvas: HTMLCanvasElement): {
  src: string;
  bytes: ArrayBuffer;
  width: number;
  height: number;
} {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available.");
  const { width, height } = canvas;
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let found = false;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a > 20 && (r < 245 || g < 245 || b < 245)) {
        found = true;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) {
    throw new Error("Draw a signature first, or upload / type one.");
  }
  const pad = 8;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  const out = document.createElement("canvas");
  out.width = tw;
  out.height = th;
  const octx = out.getContext("2d");
  if (!octx) throw new Error("Canvas not available.");
  octx.drawImage(canvas, minX, minY, tw, th, 0, 0, tw, th);
  const src = out.toDataURL("image/png");
  return {
    src,
    bytes: dataUrlToArrayBuffer(src),
    width: tw,
    height: th,
  };
}
