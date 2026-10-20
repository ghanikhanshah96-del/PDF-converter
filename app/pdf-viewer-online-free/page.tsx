import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { ViewPdfClient } from "@/components/tools/ViewPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["view-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <ViewPdfClient />
    </ToolPageShell>
  );
}
