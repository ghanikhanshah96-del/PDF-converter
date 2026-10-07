"use client";

import { ToolWorkspace } from "@/components/ToolWorkspace";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["jpg-to-pdf"];

export function JpgToPdfClient() {
  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      processMode="all"
      maxFiles={40}
      title="Drop images to convert"
      hint="JPG, PNG, or WEBP — add multiple images into one PDF"
      processLabel="Create PDF"
      onProcess={async (files, onProgress) => {
        onProgress(20, "Loading pdf-lib…");
        const { imagesToPdf } = await import("@/lib/engines/jpgToPdf");
        onProgress(50, "Building PDF…");
        const bytes = await imagesToPdf(files);
        return {
          blob: toPdfBlob(bytes),
          filename: "images.pdf",
        };
      }}
    />
  );
}
