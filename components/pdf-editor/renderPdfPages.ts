import { getPdfjs } from "@/lib/pdfjs";
import { groupTextLines, type RawTextItem, type TextLine } from "@/lib/pdf/textRuns";
import type { PagePreview } from "./types";

type PdfjsDoc = Awaited<
  ReturnType<Awaited<ReturnType<typeof getPdfjs>>["getDocument"]>["promise"]
>;

const MAIN_WIDTH = 900;
const THUMB_WIDTH = 120;
export const MAX_BITMAP_EDGE = 1600;
export const MAX_BITMAP_PIXELS = 1_600_000;

export function guessEditorWidth(): number {
  if (typeof window === "undefined") return 720;
  const width = window.innerWidth;
  if (width < 1024) return Math.max(280, width - 16);
  return Math.max(320, Math.min(900, width - 420));
}

/** CSS page size times a capped pixel ratio, limited so a phone cannot allocate an unbounded bitmap. */
export function bitmapSize(cssWidth: number, cssHeight: number, pixelRatio: number) {
  const ratio = Math.min(Math.max(pixelRatio || 1, 1), 2);
  let width = Math.max(1, Math.floor(cssWidth * ratio));
  let height = Math.max(1, Math.floor(cssHeight * ratio));
  if (width > MAX_BITMAP_EDGE) {
    height = Math.max(1, Math.floor((height * MAX_BITMAP_EDGE) / width));
    width = MAX_BITMAP_EDGE;
  }
  if (height > MAX_BITMAP_EDGE) {
    width = Math.max(1, Math.floor((width * MAX_BITMAP_EDGE) / height));
    height = MAX_BITMAP_EDGE;
  }
  if (width * height > MAX_BITMAP_PIXELS) {
    const scale = Math.sqrt(MAX_BITMAP_PIXELS / (width * height));
    width = Math.max(1, Math.floor(width * scale));
    height = Math.max(1, Math.floor(height * scale));
  }
  if (width < 1 || height < 1) {
    throw new Error("This page is too large to edit here.");
  }
  return { width, height };
}

export const MAIN_PAGE_MIME = "image/png";
export const THUMB_MIME = "image/jpeg";

function canvasToObjectUrl(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg",
): Promise<string> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("Failed to encode page."))),
      type,
      type === "image/jpeg" ? 0.72 : undefined,
    );
  });
}

async function renderOnePage(
  doc: PdfjsDoc,
  pageNumber: number,
  cssWidth?: number,
  pixelRatio = 1,
): Promise<PagePreview> {
  const page = await doc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const layoutWidth = cssWidth ?? MAIN_WIDTH;
  const layoutHeight = layoutWidth * (base.height / Math.max(base.width, 1));
  const pixels = cssWidth
    ? bitmapSize(layoutWidth, layoutHeight, pixelRatio)
    : {
        width: Math.max(1, Math.floor(layoutWidth)),
        height: Math.max(1, Math.floor(layoutHeight)),
      };

  const mainScale = pixels.width / base.width;
  const mainVp = page.getViewport({ scale: mainScale });
  const mainCanvas = document.createElement("canvas");
  mainCanvas.width = pixels.width;
  mainCanvas.height = pixels.height;
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
    canvasToObjectUrl(mainCanvas, MAIN_PAGE_MIME),
    canvasToObjectUrl(thumbCanvas, THUMB_MIME),
  ]);

  return {
    pageIndex: pageNumber - 1,
    pdfWidth: base.width,
    pdfHeight: base.height,
    displayWidth: cssWidth ? layoutWidth : mainCanvas.width,
    displayHeight: cssWidth ? layoutHeight : mainCanvas.height,
    imageUrl,
    thumbUrl,
  };
}

export type ProgressivePdf = {
  numPages: number;
  /** Renders a 1-based page if not already cached; returns preview */
  getPage: (pageIndex0: number) => Promise<PagePreview>;
  getLines: (pageIndex0: number) => Promise<TextLine[]>;
  /** Prefetch nearby pages in background */
  prefetch: (centerIndex0: number) => void;
  destroy: () => void;
};

export async function openPdfProgressive(
  file: File,
  password?: string,
  options?: { cssWidth?: () => number; pixelRatio?: number },
): Promise<ProgressivePdf> {
  const pdfjs = await getPdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({
    data: data.slice(),
    ...(password ? { password } : {}),
  }).promise;

  const cache = new Map<string, PagePreview>();
  const inflight = new Map<string, Promise<PagePreview>>();
  const lineCache = new Map<number, TextLine[]>();
  let destroyed = false;
  const pixelRatio =
    options?.pixelRatio ??
    (typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2));

  const pageKey = (pageIndex0: number) => {
    const width = options?.cssWidth ? Math.round(options.cssWidth()) : 0;
    return `${pageIndex0}:${width}`;
  };

  const getPage = async (pageIndex0: number) => {
    if (destroyed) throw new Error("Document closed.");
    const key = pageKey(pageIndex0);
    if (cache.has(key)) return cache.get(key)!;
    if (inflight.has(key)) return inflight.get(key)!;
    const cssWidth = options?.cssWidth?.();
    const p = renderOnePage(doc, pageIndex0 + 1, cssWidth, pixelRatio)
      .then((preview) => {
        for (const [cachedKey, previous] of cache) {
          if (!cachedKey.startsWith(`${pageIndex0}:`) || cachedKey === key) continue;
          URL.revokeObjectURL(previous.imageUrl);
          URL.revokeObjectURL(previous.thumbUrl);
          cache.delete(cachedKey);
        }
        cache.set(key, preview);
        inflight.delete(key);
        return preview;
      })
      .catch((error: unknown) => {
        inflight.delete(key);
        if (error instanceof Error && /memory|allocation|too large/i.test(error.message)) {
          throw new Error("This page is too large to edit here.");
        }
        throw error;
      });
    inflight.set(key, p);
    return p;
  };

  const getLines = async (pageIndex0: number) => {
    if (destroyed) throw new Error("Document closed.");
    const cached = lineCache.get(pageIndex0);
    if (cached) return cached;
    const page = await doc.getPage(pageIndex0 + 1);
    const viewport = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();
    const raw: RawTextItem[] = [];
    for (const item of content.items) {
      if (!("str" in item) || !item.str) continue;
      raw.push({
        str: item.str,
        transform: item.transform,
        width: item.width,
        height: item.height,
        dir: item.dir,
      });
    }
    const lines = groupTextLines(raw, pageIndex0, viewport);
    lineCache.set(pageIndex0, lines);
    return lines;
  };

  const prefetch = (centerIndex0: number) => {
    const targets = [centerIndex0 - 1, centerIndex0 + 1, centerIndex0 + 2]
      .filter((i) => i >= 0 && i < doc.numPages)
      .filter((i) => !cache.has(pageKey(i)) && !inflight.has(pageKey(i)));
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
    lineCache.clear();
    void doc.cleanup();
  };

  return {
    numPages: doc.numPages,
    getPage,
    getLines,
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
