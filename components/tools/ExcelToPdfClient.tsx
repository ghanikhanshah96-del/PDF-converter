"use client";

import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["excel-to-pdf"];

export function ExcelToPdfClient() {
  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop an Excel (.xlsx) file"
      processLabel="Convert to PDF"
      onProcess={async (files, onProgress) => {
        onProgress(15, "Loading SheetJS…");
        const { excelToPdf } = await import("@/lib/engines/excelToPdf");
        onProgress(50, "Rendering sheets…");
        const bytes = await excelToPdf(files[0]);
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}.pdf`,
        };
      }}
    />
  );
}
