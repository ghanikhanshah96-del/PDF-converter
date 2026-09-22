"use client";

import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["edit-pdf"];

export function EditPdfClient() {
  const [text, setText] = useState("Sample text");
  const [page, setPage] = useState(1);
  const [x, setX] = useState(72);
  const [y, setY] = useState(72);
  const [size, setSize] = useState(16);
  const [imageFile, setImageFile] = useState<File | null>(null);

  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop a PDF to edit"
      processLabel="Apply overlays"
      options={
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium" htmlFor="edit-text">
              Text overlay
            </label>
            <input
              id="edit-text"
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <label className="text-sm">
            Page (1-based)
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
              value={page}
              onChange={(e) => setPage(Number(e.target.value) || 1)}
            />
          </label>
          <label className="text-sm">
            Font size
            <input
              type="number"
              min={8}
              max={72}
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
              value={size}
              onChange={(e) => setSize(Number(e.target.value) || 16)}
            />
          </label>
          <label className="text-sm">
            X position (pts from left)
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
              value={x}
              onChange={(e) => setX(Number(e.target.value) || 0)}
            />
          </label>
          <label className="text-sm">
            Y position (pts from top)
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
              value={y}
              onChange={(e) => setY(Number(e.target.value) || 0)}
            />
          </label>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium" htmlFor="edit-image">
              Optional image overlay (PNG/JPG)
            </label>
            <input
              id="edit-image"
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              className="mt-1 w-full text-sm"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <p className="sm:col-span-2 text-xs text-[var(--ink-muted)]">
            This stamps text/images onto pages. It is not a full word processor.
          </p>
        </div>
      }
      onProcess={async (files, onProgress) => {
        onProgress(20, "Loading pdf-lib…");
        const { applyPdfOverlays } = await import("@/lib/engines/edit");
        onProgress(50, "Applying overlays…");
        const images = [];
        if (imageFile) {
          images.push({
            pageIndex: Math.max(0, page - 1),
            imageBytes: await imageFile.arrayBuffer(),
            mime: imageFile.type || "image/jpeg",
            x,
            y: y + 40,
            width: 160,
            height: 80,
          });
        }
        const bytes = await applyPdfOverlays(
          files[0],
          text.trim()
            ? [
                {
                  pageIndex: Math.max(0, page - 1),
                  text: text.trim(),
                  x,
                  y,
                  size,
                },
              ]
            : [],
          images,
        );
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}-edited.pdf`,
        };
      }}
    />
  );
}
