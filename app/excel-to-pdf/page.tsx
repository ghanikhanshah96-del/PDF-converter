import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { ExcelToPdfClient } from "@/components/tools/ExcelToPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["excel-to-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <ExcelToPdfClient />
    </ToolPageShell>
  );
}
