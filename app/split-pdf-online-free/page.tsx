import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { SplitPdfClient } from "@/components/tools/SplitPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["split-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <SplitPdfClient />
    </ToolPageShell>
  );
}
