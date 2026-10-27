import type { Metadata } from "next";
import Link from "next/link";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { CompressPdfClient } from "@/components/tools/CompressPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["compress-pdf"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell
      tool={tool}
      notice={
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          <Link
            href="/blog/what-does-compressing-a-pdf-do"
            className="font-semibold text-[var(--brand-deep)] underline decoration-[rgba(200,36,32,0.35)] underline-offset-2 hover:decoration-[var(--brand-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
          >
            What compressing a PDF does
          </Link>
          , including quality settings. Need a size limit? See{" "}
          <Link
            href="/blog/how-to-make-a-file-less-than-10-mb"
            className="font-semibold text-[var(--brand-deep)] underline decoration-[rgba(200,36,32,0.35)] underline-offset-2 hover:decoration-[var(--brand-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
          >
            how to make a file less than 10 MB
          </Link>
          .
        </p>
      }
    >
      <CompressPdfClient />
    </ToolPageShell>
  );
}
