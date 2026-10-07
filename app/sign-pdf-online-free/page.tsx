import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { SignPdfClient } from "@/components/tools/SignPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["sign-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <SignPdfClient />
    </ToolPageShell>
  );
}
