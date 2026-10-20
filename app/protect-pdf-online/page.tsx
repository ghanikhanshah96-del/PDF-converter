import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { ProtectPdfClient } from "@/components/tools/ProtectPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["protect-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <ProtectPdfClient />
    </ToolPageShell>
  );
}
