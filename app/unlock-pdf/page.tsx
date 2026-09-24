import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { UnlockPdfClient } from "@/components/tools/UnlockPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["unlock-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <UnlockPdfClient />
    </ToolPageShell>
  );
}
