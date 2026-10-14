import { NextResponse } from "next/server";
import { convertDocxToPdf } from "@/lib/server/libreOffice";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  let file: File;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (!(value instanceof File)) {
      return NextResponse.json({ error: "Choose a DOCX file." }, { status: 400 });
    }
    file = value;
  } catch {
    return NextResponse.json({ error: "The file could not be read." }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith(".docx")) {
    return NextResponse.json({ error: "Only DOCX files can be converted." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "The file must be between 1 byte and 50 MB." },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
    return NextResponse.json({ error: "This file is not a valid DOCX document." }, { status: 400 });
  }

  try {
    const pdf = await convertDocxToPdf(bytes);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The document could not be converted.";
    const status = message.includes("not installed") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
