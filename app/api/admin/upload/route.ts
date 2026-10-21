import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { MediaStorageNotConfiguredError, uploadMedia } from "@/lib/blog-media";
import { InvalidMediaError } from "@/lib/optimize-media";
import { MAX_MEDIA_BYTES, MEDIA_SIZE_ERROR } from "@/lib/media-upload-policy";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const media = await requirePermission("media");
  if (!media.ok) {
    const blogs = await requirePermission("blogs");
    if (!blogs.ok) {
      return NextResponse.json(
        { error: media.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: media.status === 401 ? 401 : 403 },
      );
    }
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const isSvg =
      file.type === "image/svg+xml" ||
      file.name.toLowerCase().endsWith(".svg");
    if (!file.type.startsWith("image/") && !isSvg) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_MEDIA_BYTES) {
      return NextResponse.json(
        { error: MEDIA_SIZE_ERROR },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const item = await uploadMedia(buffer, file.name);
    return NextResponse.json({ ...item, item });
  } catch (e) {
    if (e instanceof InvalidMediaError) return NextResponse.json({ error: e.message }, { status: 400 });
    if (e instanceof MediaStorageNotConfiguredError) return NextResponse.json({ error: e.message }, { status: 503 });
    console.error("Blog image upload failed", e instanceof Error ? e.name : "unknown");
    const error = "Blog image upload failed. Check the Vercel Blob connection and free-plan usage limits, then try again.";
    return NextResponse.json({ error }, { status: 503 });
  }
}
