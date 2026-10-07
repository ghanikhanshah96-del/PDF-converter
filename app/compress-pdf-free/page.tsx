import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { CompressPdfClient } from "@/components/tools/CompressPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["compress-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <CompressPdfClient />
    </ToolPageShell>
  );
}
