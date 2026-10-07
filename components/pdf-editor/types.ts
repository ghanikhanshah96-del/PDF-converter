export type EditorOverlayBase = {
  id: string;
  pageIndex: number;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type TextEditorOverlay = EditorOverlayBase & {
  kind: "text";
  text: string;
  fontSize: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

export type ImageEditorOverlay = EditorOverlayBase & {
  kind: "image";
  src: string;
  bytes?: ArrayBuffer;
  mime: string;
};

export type ShapeEditorOverlay = EditorOverlayBase & {
  kind: "shape";
  shape: "rect" | "ellipse" | "line";
  stroke: string;
  fill: string;
  strokeWidth: number;
};

export type DrawEditorOverlay = EditorOverlayBase & {
  kind: "draw";
  src: string;
  bytes: ArrayBuffer;
};

export type EditorOverlay =
  | TextEditorOverlay
  | ImageEditorOverlay
  | ShapeEditorOverlay
  | DrawEditorOverlay;

export type PagePreview = {
  pageIndex: number;
  pdfWidth: number;
  pdfHeight: number;
  displayWidth: number;
  displayHeight: number;
  /** Object URL for main preview (revoke on cleanup) */
  imageUrl: string;
  /** Smaller object URL for thumbnail strip */
  thumbUrl: string;
};

export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return { r: 0.05, g: 0.1, b: 0.15 };
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

export function revokePageUrls(pages: PagePreview[]) {
  for (const p of pages) {
    URL.revokeObjectURL(p.imageUrl);
    URL.revokeObjectURL(p.thumbUrl);
  }
}
