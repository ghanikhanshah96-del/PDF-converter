"use client";

import { useEffect, useRef, useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";

const tool = toolsById["sign-pdf"];

export function SignPdfClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [page, setPage] = useState(1);
  const [x, setX] = useState(72);
  const [y, setY] = useState(120);
  const [width, setWidth] = useState(180);
  const [upload, setUpload] = useState<File | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#102a2e";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const signaturePng = async (): Promise<ArrayBuffer> => {
    if (upload) {
      // Normalize to PNG via canvas
      const bitmap = await createImageBitmap(upload);
      const c = document.createElement("canvas");
      c.width = bitmap.width;
      c.height = bitmap.height;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("Canvas not available.");
      ctx.drawImage(bitmap, 0, 0);
      bitmap.close();
      const blob = await new Promise<Blob>((resolve, reject) => {
        c.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to encode signature."))),
          "image/png",
        );
      });
      return blob.arrayBuffer();
    }
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Signature pad missing.");
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Draw or upload a signature."))),
        "image/png",
      );
    });
    return blob.arrayBuffer();
  };

  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop a PDF to sign"
      processLabel="Sign PDF"
      options={
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Draw signature</p>
            <canvas
              ref={canvasRef}
              width={480}
              height={160}
              className="mt-2 w-full touch-none rounded-xl border border-[var(--line)] bg-white"
              onPointerDown={(e) => {
                drawing.current = true;
                const ctx = canvasRef.current?.getContext("2d");
                if (!ctx) return;
                const p = getPos(e);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!drawing.current) return;
                const ctx = canvasRef.current?.getContext("2d");
                if (!ctx) return;
                const p = getPos(e);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
              }}
              onPointerUp={() => {
                drawing.current = false;
              }}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" className="btn btn-secondary !py-1.5 text-sm" onClick={clearPad}>
                Clear pad
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium" htmlFor="sig-upload">
              Or upload signature image
            </label>
            <input
              id="sig-upload"
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              className="mt-1 w-full text-sm"
              onChange={(e) => setUpload(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Page
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                value={page}
                onChange={(e) => setPage(Number(e.target.value) || 1)}
              />
            </label>
            <label className="text-sm">
              Width (pts)
              <input
                type="number"
                min={40}
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value) || 180)}
              />
            </label>
            <label className="text-sm">
              X from left
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                value={x}
                onChange={(e) => setX(Number(e.target.value) || 0)}
              />
            </label>
            <label className="text-sm">
              Y from top
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2"
                value={y}
                onChange={(e) => setY(Number(e.target.value) || 0)}
              />
            </label>
          </div>
        </div>
      }
      onProcess={async (files, onProgress) => {
        onProgress(15, "Preparing signature…");
        const png = await signaturePng();
        onProgress(40, "Loading pdf-lib…");
        const { stampSignature } = await import("@/lib/engines/edit");
        onProgress(65, "Placing signature…");
        const height = Math.round(width * 0.4);
        const bytes = await stampSignature(files[0], {
          pageIndex: Math.max(0, page - 1),
          signaturePng: png,
          x,
          y,
          width,
          height,
        });
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}-signed.pdf`,
        };
      }}
    />
  );
}
