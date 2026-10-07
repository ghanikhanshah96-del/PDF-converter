import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { MergePdfClient } from "@/components/tools/MergePdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["merge-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <MergePdfClient />
    </ToolPageShell>
  );
}
