import { randomUUID } from "node:crypto";
import { list, put } from "@vercel/blob";
import { optimizeMedia } from "@/lib/optimize-media";
import type { MediaItem } from "@/lib/media-library";

const PREFIX = "blog-images/";

export class MediaStorageNotConfiguredError extends Error {
  constructor() {
    super("Connect a public Vercel Blob store to this project, then redeploy. Blog uploads need BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID.");
  }
}

export function isBlogMediaConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function requireStorage() {
  if (!isBlogMediaConfigured()) throw new MediaStorageNotConfiguredError();
}

export async function uploadMedia(input: Buffer, originalName: string) {
  const optimized = await optimizeMedia(input);
  requireStorage();
  const stem = originalName.replace(/\.[^.]*$/, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 60) || "image";
  const object = `${PREFIX}${stem}-${randomUUID()}.${optimized.ext}`;
  const blob = await put(object, optimized.buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType: optimized.contentType,
    cacheControlMaxAge: 31536000,
  });
  return {
    url: blob.url,
    name: object.slice(PREFIX.length),
    source: "upload" as const,
    ext: optimized.ext,
    size: optimized.buffer.length,
    originalSize: input.length,
    modifiedAt: new Date().toISOString(),
  };
}

export async function listStoredMedia(): Promise<MediaItem[]> {
  if (!isBlogMediaConfigured()) return [];
  const items: MediaItem[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    for (const blob of page.blobs) {
      const name = blob.pathname.slice(PREFIX.length);
      items.push({ url: blob.url, name, source: "upload", ext: name.split(".").pop() || "",
        size: blob.size, modifiedAt: blob.uploadedAt.toISOString() });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return items;
}
