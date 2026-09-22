"use client";

import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["split-pdf"];

export function SplitPdfClient() {
  const [range, setRange] = useState("");
  const [mode, setMode] = useState<"single" | "zip">("single");

  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop a PDF to split"
      processLabel="Split PDF"
      options={
        <>
          <label className="block text-sm font-medium" htmlFor="split-range">
            Pages / ranges (e.g. 1-3, 5, 8-10). Leave blank for all pages.
          </label>
          <input
            id="split-range"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="1-3, 5"
          />
          <fieldset className="flex flex-wrap gap-4 text-sm">
            <legend className="sr-only">Output mode</legend>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="split-mode"
                checked={mode === "single"}
                onChange={() => setMode("single")}
              />
              One PDF with selected pages
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="split-mode"
                checked={mode === "zip"}
                onChange={() => setMode("zip")}
              />
              ZIP of individual pages
            </label>
          </fieldset>
        </>
      }
      onProcess={async (files, onProgress) => {
        const file = files[0];
        onProgress(15, "Loading libraries…");
        const eng = await import("@/lib/engines/split");
        onProgress(40, "Splitting…");
        if (mode === "zip") {
          const blob = await eng.splitPdfToZip(file, range);
          onProgress(90, "Packaging ZIP…");
          return {
            blob,
            filename: `${basename(file.name)}-pages.zip`,
          };
        }
        const { bytes } = await eng.splitPdfToSingle(file, range);
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(file.name)}-split.pdf`,
        };
      }}
    />
  );
}
