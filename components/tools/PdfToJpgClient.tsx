"use client";

import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toolsById } from "@/lib/tools";

const tool = toolsById["pdf-to-jpg"];

export function PdfToJpgClient() {
  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      processMode="each"
      title="Drop PDFs to convert"
      hint="Select one or more PDF files — or click to browse"
      processLabel="Convert to JPG"
      onProcess={async (files, onProgress) => {
        onProgress(15, "Loading PDF.js…");
        const { pdfToJpgBlobs } = await import("@/lib/engines/pdfToJpg");
        onProgress(40, "Rendering pages…");
        const { blobs, isZip } = await pdfToJpgBlobs(files[0]);
        onProgress(90, "Preparing download…");
        return {
          blob: blobs[0],
          filename: isZip
            ? `${basename(files[0].name)}-pages.zip`
            : `${basename(files[0].name)}.jpg`,
        };
      }}
    />
  );
}
