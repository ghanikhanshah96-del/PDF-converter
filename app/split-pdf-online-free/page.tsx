import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { SplitPdfClient } from "@/components/tools/SplitPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["split-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell
      tool={tool}
      notice={
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          <Link
            href="/blog/how-to-split-pdf-pages"
            className="font-semibold text-[var(--brand-deep)] underline decoration-[rgba(200,36,32,0.35)] underline-offset-2 hover:decoration-[var(--brand-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
          >
            How to split PDF pages
          </Link>
          , including page ranges, one PDF versus a ZIP, and what the new file
          does not keep.
        </p>
      }
    >
      <SplitPdfClient />
    </ToolPageShell>
  );
}
