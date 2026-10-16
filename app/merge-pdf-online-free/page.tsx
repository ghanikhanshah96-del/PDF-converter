import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { MergePdfClient } from "@/components/tools/MergePdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["merge-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell
      tool={tool}
      notice={
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          <Link
            href="/blog/how-to-merge-pdf-files"
            className="font-semibold text-[var(--brand-deep)] underline decoration-[rgba(200,36,32,0.35)] underline-offset-2 hover:decoration-[var(--brand-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
          >
            How to merge PDF files
          </Link>
          , including file order, locked PDFs, and the optional password on
          the download.
        </p>
      }
    >
      <MergePdfClient />
    </ToolPageShell>
  );
}
