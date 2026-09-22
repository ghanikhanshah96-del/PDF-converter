"use client";

import { useEffect } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["word-to-pdf"];

export function WordToPdfClient() {
  useEffect(() => {
    const id = window.setTimeout(() => {
      void import("@/lib/engines/wordToPdf");
    }, 350);

    return () => window.clearTimeout(id);
  }, []);

  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop a Word (.docx) file"
      processLabel="Convert to PDF"
      onProcess={async (files, onProgress) => {
        onProgress(15, "Loading converters…");
        const { wordToPdf } = await import("@/lib/engines/wordToPdf");
        const bytes = await wordToPdf(files[0], onProgress);
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}.pdf`,
        };
      }}
    />
  );
}
