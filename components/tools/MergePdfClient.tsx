"use client";

import { ToolWorkspace } from "@/components/ToolWorkspace";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["merge-pdf"];

export function MergePdfClient() {
  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      minFiles={2}
      title="Drop PDF files to merge"
      processLabel="Merge PDFs"
      onProcess={async (files, onProgress) => {
        onProgress(20, "Loading pdf-lib…");
        const { mergePdfs } = await import("@/lib/engines/merge");
        onProgress(45, "Merging…");
        const bytes = await mergePdfs(files);
        onProgress(90, "Preparing download…");
        return {
          blob: toPdfBlob(bytes),
          filename: "merged.pdf",
        };
      }}
    />
  );
}
