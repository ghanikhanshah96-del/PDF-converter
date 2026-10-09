import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { WordToPdfClient } from "@/components/tools/WordToPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["word-to-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell
      tool={tool}
      notice={
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          <Link
            href="/blog/how-to-download-word-document-as-pdf"
            className="font-semibold text-[var(--brand-deep)] underline decoration-[rgba(200,36,32,0.35)] underline-offset-2 hover:decoration-[var(--brand-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
          >
            How to download a Word document as a PDF
          </Link>
          , including what this DOCX tool keeps and what it leaves out.
        </p>
      }
    >
      <WordToPdfClient />
    </ToolPageShell>
  );
}
