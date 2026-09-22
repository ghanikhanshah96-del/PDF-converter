import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { PdfToWordClient } from "@/components/tools/PdfToWordClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["pdf-to-word"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <PdfToWordClient />
    </ToolPageShell>
  );
}
