"use client";

import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toolsById } from "@/lib/tools";

const tool = toolsById["pdf-to-excel"];

export function PdfToExcelClient() {
  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop a PDF with tables"
      processLabel="Convert to Excel"
      onProcess={async (files, onProgress) => {
        onProgress(15, "Loading libraries…");
        const { pdfToExcel } = await import("@/lib/engines/pdfToExcel");
        onProgress(45, "Extracting table text…");
        const buffer = await pdfToExcel(files[0]);
        return {
          blob: new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
          filename: `${basename(files[0].name)}.xlsx`,
        };
      }}
    />
  );
}
