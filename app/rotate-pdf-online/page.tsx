import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { RotatePdfClient } from "@/components/tools/RotatePdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["rotate-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <RotatePdfClient />
    </ToolPageShell>
  );
}
