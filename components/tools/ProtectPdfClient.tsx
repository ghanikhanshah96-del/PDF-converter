"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/PasswordInput";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["protect-pdf"];

export function ProtectPdfClient() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      processMode="each"
      title="Drop PDFs to protect"
      hint="Select one or more PDF files — or click to browse. Locked files will ask for their current password first."
      processLabel="Protect PDF"
      options={
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium" htmlFor="protect-password">
              New password
            </label>
            <PasswordInput
              id="protect-password"
              autoComplete="new-password"
              wrapperClassName="mt-1"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium"
              htmlFor="protect-password-confirm"
            >
              Confirm password
            </label>
            <PasswordInput
              id="protect-password-confirm"
              autoComplete="new-password"
              wrapperClassName="mt-1"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type the password again"
            />
          </div>
          <p className="text-xs text-[var(--ink-muted)]">
            Anyone who opens the file will need this password. Store it safely —
            we cannot recover it for you. Processing stays in your browser.
          </p>
        </div>
      }
      validate={() => {
        if (!password.trim()) throw new Error("Enter a password to protect the PDF.");
        if (password !== confirm) throw new Error("Passwords do not match.");
        if (password.trim().length < 4) {
          throw new Error("Use at least 4 characters for the password.");
        }
      }}
      onProcess={async (files, onProgress) => {
        onProgress(15, "Preparing protection…");
        const { protectPdf } = await import("@/lib/engines/protect");
        onProgress(45, "Encrypting your PDF…");
        const bytes = await protectPdf(files[0], password);
        onProgress(90, "Checking the protected file…");
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}-protected.pdf`,
          notice: "Your PDF is password-protected and ready to download.",
        };
      }}
    />
  );
}
