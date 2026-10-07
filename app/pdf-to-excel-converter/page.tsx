import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { PdfToExcelClient } from "@/components/tools/PdfToExcelClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["pdf-to-excel"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <PdfToExcelClient />
    </ToolPageShell>
  );
}
