import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { WordToPdfClient } from "@/components/tools/WordToPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["word-to-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <WordToPdfClient />
    </ToolPageShell>
  );
}
