import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { PdfToJpgClient } from "@/components/tools/PdfToJpgClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["pdf-to-jpg"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <PdfToJpgClient />
    </ToolPageShell>
  );
}
