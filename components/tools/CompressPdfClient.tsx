"use client";

import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";
import type { CompressQuality } from "@/lib/engines/compress";

const tool = toolsById["compress-pdf"];

export function CompressPdfClient() {
  const [level, setLevel] = useState<CompressQuality>("medium");

  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop a PDF to compress"
      processLabel="Compress PDF"
      options={
        <fieldset className="flex flex-wrap gap-4 text-sm">
          <legend className="mb-1 w-full font-medium">Quality</legend>
          {(
            [
              ["high", "High (larger)"],
              ["medium", "Medium"],
              ["low", "Low (smaller)"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="compress-quality"
                checked={level === value}
                onChange={() => setLevel(value)}
              />
              {label}
            </label>
          ))}
        </fieldset>
      }
      onProcess={async (files, onProgress) => {
        onProgress(10, "Loading libraries…");
        const { compressPdf } = await import("@/lib/engines/compress");
        onProgress(35, "Re-encoding pages…");
        const bytes = await compressPdf(files[0], level);
        onProgress(90, "Saving…");
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}-compressed.pdf`,
        };
      }}
    />
  );
}
