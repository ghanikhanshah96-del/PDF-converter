import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { UnlockPdfClient } from "@/components/tools/UnlockPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["unlock-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell
      tool={tool}
      notice={
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Use only on PDFs you own or are authorized to open. This tool does not
          crack unknown passwords.
        </p>
      }
    >
      <UnlockPdfClient />
    </ToolPageShell>
  );
}
