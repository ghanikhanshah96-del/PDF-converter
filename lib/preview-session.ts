export type PreviewPayload = {
  blob: Blob;
  filename: string;
};

let memoryPreview: PreviewPayload | null = null;

/** Keep the latest PDF in memory for same-tab navigation to the viewer tool. */
export function setPreviewPayload(payload: PreviewPayload) {
  memoryPreview = payload;
}

export function peekPreviewPayload(): PreviewPayload | null {
  return memoryPreview;
}

export function takePreviewPayload(): PreviewPayload | null {
  const next = memoryPreview;
  memoryPreview = null;
  return next;
}

export function isPdfBlob(blob: Blob, filename: string): boolean {
  const type = (blob.type || "").toLowerCase();
  const name = filename.toLowerCase();
  return type.includes("pdf") || name.endsWith(".pdf");
}
