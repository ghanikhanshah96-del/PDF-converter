"use client";

import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

function UnlockForm({
  title,
  processLabel,
}: {
  title: string;
  processLabel: string;
}) {
  const [password, setPassword] = useState("");
  const tool = toolsById["unlock-pdf"];

  return (
    <ToolWorkspace
      accept={tool.accept}
      title={title}
      processLabel={processLabel}
      options={
        <>
          <label className="block text-sm font-medium" htmlFor="pdf-password">
            PDF password
          </label>
          <input
            id="pdf-password"
            type="password"
            autoComplete="off"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter the known password"
          />
          <p className="text-xs text-[var(--ink-muted)]">
            Only unlock files you own or are authorized to open. We cannot crack
            unknown passwords.
          </p>
        </>
      }
      validate={() => {
        if (!password.trim()) throw new Error("Enter the PDF password.");
      }}
      onProcess={async (files, onProgress) => {
        onProgress(20, "Loading unlocker…");
        const { unlockPdf } = await import("@/lib/engines/unlock");
        onProgress(50, "Removing protection…");
        const bytes = await unlockPdf(files[0], password);
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}-unlocked.pdf`,
        };
      }}
    />
  );
}

export function UnlockPdfClient() {
  return (
    <UnlockForm title="Drop a protected PDF" processLabel="Unlock PDF" />
  );
}

export function PasswordRemoverClient() {
  return (
    <UnlockForm
      title="Drop a password-protected PDF"
      processLabel="Remove password"
    />
  );
}
