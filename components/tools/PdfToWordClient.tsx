"use client";

import { useEffect } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toolsById } from "@/lib/tools";

const tool = toolsById["pdf-to-word"];

export function PdfToWordClient() {
  useEffect(() => {
    const id = window.setTimeout(() => {
      void import("@/lib/engines/pdfToWord");
    }, 350);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop a PDF to convert"
      processLabel="Convert to Word"
      onProcess={async (files, onProgress) => {
        onProgress(15, "Loading PDF.js…");
        const { pdfToWord } = await import("@/lib/engines/pdfToWord");
        const blob = await pdfToWord(files[0], onProgress);
        return {
          blob,
          filename: `${basename(files[0].name)}.docx`,
        };
      }}
    />
  );
}
