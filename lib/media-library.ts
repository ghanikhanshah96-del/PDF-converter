import { readdir, stat } from "fs/promises";
import path from "path";
import { listBlogPosts } from "@/lib/blog-repo";
import { listStoredMedia, isBlogMediaConfigured } from "@/lib/blog-media";

export type MediaSource = "site" | "upload" | "cover" | "content";

export interface MediaItem {
  url: string;
  name: string;
  source: MediaSource;
  ext: string;
  size?: number;
  modifiedAt?: string;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|svg|ico)$/i;
const IMG_SRC_RE = /<img[^>]+src=["']([^"']+)["']/gi;

function fileNameFromUrl(url: string) {
  try {
    const pathname = url.startsWith("http")
      ? new URL(url).pathname
      : url.split("?")[0];
    return decodeURIComponent(pathname).split("/").pop() || url;
  } catch {
    return url.split("/").pop() || url;
  }
}

function extFromUrl(url: string) {
  const name = fileNameFromUrl(url);
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

function addImage(
  map: Map<string, MediaItem>,
  url: string,
  source: MediaSource,
  extra?: Pick<MediaItem, "size" | "modifiedAt" | "ext">,
) {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("data:")) return;
  if (!IMAGE_EXT.test(trimmed.split("?")[0])) return;

  const existing = map.get(trimmed);
  const rank: Record<MediaSource, number> = {
    upload: 4,
    cover: 3,
    content: 2,
    site: 1,
  };

  if (existing) {
    if (rank[source] > rank[existing.source]) {
      map.set(trimmed, {
        ...existing,
        source,
        ...extra,
        ext: extra?.ext || existing.ext,
      });
    } else if (extra) {
      map.set(trimmed, {
        ...existing,
        ...extra,
        ext: extra.ext || existing.ext,
      });
    }
    return;
  }

  map.set(trimmed, {
    url: trimmed,
    name: fileNameFromUrl(trimmed),
    source,
    ext: extra?.ext || extFromUrl(trimmed),
    ...extra,
  });
}

async function walkPublicImages(
  dir: string,
  urlPrefix: string,
  map: Map<string, MediaItem>,
  source: MediaSource,
) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const url = `${urlPrefix}/${entry.name}`.replace(/\\/g, "/");
    if (entry.isDirectory()) {
      await walkPublicImages(full, url, map, source);
      continue;
    }
    if (!IMAGE_EXT.test(entry.name)) continue;
    try {
      const info = await stat(full);
      addImage(map, url, source, {
        size: info.size,
        modifiedAt: info.mtime.toISOString(),
        ext: extFromUrl(entry.name),
      });
    } catch {
      addImage(map, url, source);
    }
  }
}

export async function listMediaLibrary(): Promise<MediaItem[]> {
  const map = new Map<string, MediaItem>();
  const publicRoot = path.join(process.cwd(), "public");

  if (isBlogMediaConfigured()) {
    try {
      for (const item of await listStoredMedia()) addImage(map, item.url, "upload", item);
    } catch (error) {
      // Existing site images remain usable while Storage is being configured.
      console.error("Could not list blog images", error instanceof Error ? error.name : "unknown");
    }
  }

  await walkPublicImages(
    path.join(publicRoot, "uploads", "blog"),
    "/uploads/blog",
    map,
    "upload",
  );
  await walkPublicImages(path.join(publicRoot, "blog"), "/blog", map, "site");

  try {
    const posts = await listBlogPosts();
    for (const post of posts) {
      if (post.coverImage) addImage(map, post.coverImage, "cover");
      const html = post.content || "";
      let match: RegExpExecArray | null;
      IMG_SRC_RE.lastIndex = 0;
      while ((match = IMG_SRC_RE.exec(html))) {
        addImage(map, match[1], "content");
      }
    }
  } catch {
    // Firestore may be offline during local setup
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}
