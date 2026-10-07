"use client";

import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["merge-pdf"];

type ProtectMode = "none" | "new" | "same";

export function MergePdfClient() {
  const [protectMode, setProtectMode] = useState<ProtectMode>("none");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [samePassword, setSamePassword] = useState("");

  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      minFiles={2}
      title="Drop PDF files to merge"
      hint="You can add the same PDF more than once. Locked files will ask for a password."
      processLabel="Merge PDFs"
      options={
        <div className="rounded-xl border border-[var(--line)] bg-white/70 p-3 sm:p-4">
          <p className="text-sm font-semibold text-[var(--ink)]">
            Protect merged PDF (optional)
          </p>
          <p className="mt-1 text-xs text-[var(--ink-muted)]">
            Like iLovePDF: unlock locked inputs with their passwords, then choose
            whether the new merged file should stay open or get a password.
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="merge-protect"
                className="mt-1"
                checked={protectMode === "none"}
                onChange={() => setProtectMode("none")}
              />
              <span>No password on the merged file</span>
            </label>
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="merge-protect"
                className="mt-1"
                checked={protectMode === "same"}
                onChange={() => setProtectMode("same")}
              />
              <span>Use the same password (from an unlocked file)</span>
            </label>
            {protectMode === "same" && (
              <input
                type="password"
                autoComplete="off"
                className="ml-6 w-full max-w-sm rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
                placeholder="Password to apply to merged PDF"
                value={samePassword}
                onChange={(e) => setSamePassword(e.target.value)}
              />
            )}
            <label className="flex cursor-pointer items-start gap-2">
              <input
                type="radio"
                name="merge-protect"
                className="mt-1"
                checked={protectMode === "new"}
                onChange={() => setProtectMode("new")}
              />
              <span>Set a new password on the merged file</span>
            </label>
            {protectMode === "new" && (
              <div className="ml-6 grid max-w-sm gap-2">
                <input
                  type="password"
                  autoComplete="off"
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  autoComplete="off"
                  className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      }
      validate={() => {
        if (protectMode === "new") {
          if (!newPassword.trim()) {
            throw new Error("Enter a new password for the merged PDF.");
          }
          if (newPassword !== confirmPassword) {
            throw new Error("Passwords do not match.");
          }
        }
        if (protectMode === "same" && !samePassword.trim()) {
          throw new Error(
            "Enter the password you want to apply to the merged PDF.",
          );
        }
      }}
      onProcess={async (files, onProgress) => {
        onProgress(20, "Loading pdf-lib…");
        const { mergePdfs } = await import("@/lib/engines/merge");
        onProgress(45, "Merging…");
        let outputPassword: string | undefined;
        if (protectMode === "new") outputPassword = newPassword.trim();
        if (protectMode === "same") outputPassword = samePassword.trim();
        const bytes = await mergePdfs(files, { outputPassword });
        onProgress(90, "Preparing download…");
        return {
          blob: toPdfBlob(bytes),
          filename: "merged.pdf",
        };
      }}
    />
  );
}
