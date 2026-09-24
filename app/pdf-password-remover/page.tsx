import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { PasswordRemoverClient } from "@/components/tools/UnlockPdfClient";
import { toolsById } from "@/lib/tools";

const tool = toolsById["pdf-password-remover"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <PasswordRemoverClient />
    </ToolPageShell>
  );
}
