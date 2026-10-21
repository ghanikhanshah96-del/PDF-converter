import sharp from "sharp";
import { MAX_MEDIA_BYTES, MEDIA_SIZE_ERROR } from "@/lib/media-upload-policy";

export class InvalidMediaError extends Error {}

export async function optimizeMedia(input: Buffer) {
  if (!input.length || input.length > MAX_MEDIA_BYTES) throw new InvalidMediaError(MEDIA_SIZE_ERROR);
  try {
    // Bound decoded memory, even for highly compressed, oversized source images.
    const image = sharp(input, { limitInputPixels: 24_000_000 });
    const meta = await image.metadata();
    const types: Record<string, { ext: string; contentType: string }> = {
      jpeg: { ext: "jpg", contentType: "image/jpeg" },
      png: { ext: "png", contentType: "image/png" },
      webp: { ext: "webp", contentType: "image/webp" },
      gif: { ext: "gif", contentType: "image/gif" },
      heif: { ext: "avif", contentType: "image/avif" },
      svg: { ext: "svg", contentType: "image/svg+xml" },
    };
    const type = meta.format ? types[meta.format] : undefined;
    if (!type || (meta.format === "heif" && meta.compression !== "av1")) {
      throw new InvalidMediaError("Use a PNG, JPEG, WebP, GIF, AVIF, or SVG image.");
    }
    const original = { buffer: input, ...type, width: meta.width, height: meta.height };
    // Keep vectors, animation, high bit depth and HDR originals intact.
    if (meta.format === "svg" || (meta.pages || 1) > 1 || meta.depth !== "uchar" || meta.space !== "srgb") return original;
    // No resizing or lossy encoding. Preserve colour profile and orientation.
    const optimized = await image.keepIccProfile().keepExif().webp({ lossless: true, effort: 4 }).toBuffer();
    return optimized.length < input.length
      ? { ...original, buffer: optimized, ext: "webp", contentType: "image/webp" }
      : original;
  } catch (error) {
    if (error instanceof InvalidMediaError) throw error;
    throw new InvalidMediaError("Image could not be read. Use a valid image with no more than 24 million pixels.");
  }
}
