"use client";

import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toolsById } from "@/lib/tools";

const tool = toolsById["word-to-pdf"];

export function WordToPdfClient() {
  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      processMode="each"
      title="Drop Word (.docx) files"
      hint="Select one or more documents — or click to browse"
      processLabel="Convert to PDF"
      onProcess={async (files, onProgress) => {
        onProgress(20, "Converting the original document…");
        const body = new FormData();
        body.append("file", files[0]);
        const response = await fetch("/api/convert/word-to-pdf", {
          method: "POST",
          body,
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(data?.error || "The document could not be converted.");
        }
        onProgress(92, "Preparing download…");
        return {
          blob: await response.blob(),
          filename: `${basename(files[0].name)}.pdf`,
        };
      }}
    />
  );
}
