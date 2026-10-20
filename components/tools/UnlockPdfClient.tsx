"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

/** Password remover — keep unlock UX for users who already know the password. */
export function PasswordRemoverClient() {
  const [password, setPassword] = useState("");
  const tool = toolsById["pdf-password-remover"];

  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      processMode="each"
      title="Drop a password-protected PDF"
      hint="Select one or more locked PDFs — or click to browse"
      processLabel="Remove password"
      passwordGate={false}
      options={
        <>
          <label className="block text-sm font-medium" htmlFor="pdf-password">
            PDF password
          </label>
          <PasswordInput
            id="pdf-password"
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
        onProgress(20, "Opening the locked PDF…");
        const { unlockPdf } = await import("@/lib/engines/unlock");
        onProgress(55, "Removing the password…");
        const bytes = await unlockPdf(files[0], password);
        onProgress(90, "Saving an unlocked copy…");
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}-unlocked.pdf`,
          notice: "Password removed. Your unlocked PDF is ready to download.",
        };
      }}
    />
  );
}
