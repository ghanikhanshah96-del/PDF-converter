import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { JpgToPdfClient } from "@/components/tools/JpgToPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["jpg-to-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <JpgToPdfClient />
    </ToolPageShell>
  );
}
