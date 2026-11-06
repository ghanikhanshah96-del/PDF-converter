import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { PdfToJpgClient } from "@/components/tools/PdfToJpgClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["pdf-to-jpg"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell
      tool={tool}
      notice={
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          Need a walkthrough? See{" "}
          <Link
            href="/blog/how-do-i-save-a-pdf-as-a-jpeg"
            className="font-semibold text-[var(--brand-deep)] underline decoration-[rgba(200,36,32,0.35)] underline-offset-2 hover:decoration-[var(--brand-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
          >
            how to save a PDF as a JPEG
          </Link>
          , including Preview on Mac and multi-page files.
        </p>
      }
    >
      <PdfToJpgClient />
    </ToolPageShell>
  );
}
