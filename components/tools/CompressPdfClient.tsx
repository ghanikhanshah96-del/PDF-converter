"use client";

import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { formatBytes } from "@/lib/limits";
import { toolsById } from "@/lib/tools";
import type { CompressQuality } from "@/lib/engines/compress";

const tool = toolsById["compress-pdf"];

function savingsNotice(originalBytes: number, compressedBytes: number): string {
  const before = formatBytes(originalBytes);
  const after = formatBytes(compressedBytes);
  if (compressedBytes < originalBytes) {
    const pct = Math.round((1 - compressedBytes / originalBytes) * 100);
    const saved = formatBytes(originalBytes - compressedBytes);
    return `Compressed from ${before} to ${after} — about ${pct}% smaller (saved ${saved}).`;
  }
  if (compressedBytes === originalBytes) {
    return `File size stayed at ${after}. Try a lower quality setting for a smaller file.`;
  }
  return `Result is ${after} (was ${before}). This PDF was already compact — try a lower quality setting.`;
}

export function CompressPdfClient() {
  const [level, setLevel] = useState<CompressQuality>("medium");

  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      processMode="each"
      title="Drop PDFs to compress"
      hint="Select one or more PDF files — or click to browse"
      processLabel="Compress PDF"
      options={
        <fieldset className="flex flex-wrap gap-4 text-sm">
          <legend className="mb-1 w-full font-medium">Quality</legend>
          {(
            [
              ["high", "High (larger file, sharper pages)"],
              ["medium", "Medium (balanced)"],
              ["low", "Low (smallest file)"],
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
        const file = files[0];
        onProgress(5, "Getting ready to compress…");
        const { compressPdf } = await import("@/lib/engines/compress");
        const bytes = await compressPdf(file, level, onProgress);
        const blob = toPdfBlob(bytes);
        return {
          blob,
          filename: `${basename(file.name)}-compressed.pdf`,
          originalBytes: file.size,
          resultBytes: blob.size,
          notice: savingsNotice(file.size, blob.size),
        };
      }}
    />
  );
}
