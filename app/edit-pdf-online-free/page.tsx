import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { EditPdfClient } from "@/components/tools/EditPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["edit-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <EditPdfClient />
    </ToolPageShell>
  );
}
