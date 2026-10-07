"use client";

import { useRef } from "react";
import type { EditorOverlay, PagePreview } from "./types";

type Props = {
  page: PagePreview;
  overlays: EditorOverlay[];
  selectedId: string | null;
  zoom: number;
  panMode?: boolean;
  drawMode?: boolean;
  drawColor?: string;
  drawWidth?: number;
  onSelect: (id: string | null) => void;
  onChangeOverlays: (
    updater: (prev: EditorOverlay[]) => EditorOverlay[],
  ) => void;
  onDrawStroke?: (dataUrl: string, bytes: ArrayBuffer) => void;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function PdfPageBoard({
  page,
  overlays,
  selectedId,
  zoom,
  panMode = false,
  drawMode = false,
  drawColor = "#33333b",
  drawWidth = 3,
  onSelect,
  onChangeOverlays,
  onDrawStroke,
}: Props) {
  const dragRef = useRef<{
    id: string;
    kind: "move" | "resize";
    startX: number;
    startY: number;
    orig: EditorOverlay;
    pageW: number;
    pageH: number;
  } | null>(null);

  const drawRef = useRef<{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    drawing: boolean;
  } | null>(null);

  const pageOverlays = overlays.filter((o) => o.pageIndex === page.pageIndex);
  const width = page.displayWidth * zoom;

  const updateOverlay = (id: string, patch: Partial<EditorOverlay>) => {
    onChangeOverlays((prev) =>
      prev.map((o) => (o.id === id ? ({ ...o, ...patch } as EditorOverlay) : o)),
    );
  };

  return (
    <div
      className="relative mx-auto"
      style={{ width: "100%", maxWidth: `${Math.round(width)}px` }}
      onPointerMove={(e) => {
        const drag = dragRef.current;
        if (!drag) return;
        const dx = (e.clientX - drag.startX) / drag.pageW;
        const dy = (e.clientY - drag.startY) / drag.pageH;
        if (drag.kind === "move") {
          updateOverlay(drag.id, {
            x: clamp(drag.orig.x + dx, 0, 1 - drag.orig.w),
            y: clamp(drag.orig.y + dy, 0, 1 - drag.orig.h),
          });
        } else {
          updateOverlay(drag.id, {
            w: clamp(drag.orig.w + dx, 0.04, 1 - drag.orig.x),
            h: clamp(drag.orig.h + dy, 0.03, 1 - drag.orig.y),
          });
        }
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onPointerCancel={() => {
        dragRef.current = null;
      }}
    >
      <div
        className="relative overflow-hidden bg-white shadow-[var(--shadow)]"
        style={{
          aspectRatio: `${page.displayWidth} / ${page.displayHeight}`,
        }}
        onClick={(e) => {
          if (drawMode || panMode) return;
          if (e.target === e.currentTarget) onSelect(null);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={page.imageUrl}
          alt={`Page ${page.pageIndex + 1}`}
          className="pointer-events-none block h-auto w-full select-none"
          draggable={false}
        />

        {drawMode && (
          <canvas
            className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
            width={Math.floor(page.displayWidth)}
            height={Math.floor(page.displayHeight)}
            onPointerDown={(e) => {
              const canvas = e.currentTarget;
              const ctx = canvas.getContext("2d");
              if (!ctx) return;
              const rect = canvas.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
              const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
              ctx.strokeStyle = drawColor;
              ctx.lineWidth = drawWidth;
              ctx.lineCap = "round";
              ctx.lineJoin = "round";
              ctx.beginPath();
              ctx.moveTo(x, y);
              drawRef.current = { canvas, ctx, drawing: true };
              canvas.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = drawRef.current;
              if (!d?.drawing) return;
              const rect = d.canvas.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * d.canvas.width;
              const y = ((e.clientY - rect.top) / rect.height) * d.canvas.height;
              d.ctx.lineTo(x, y);
              d.ctx.stroke();
            }}
            onPointerUp={() => {
              const d = drawRef.current;
              if (!d) return;
              d.drawing = false;
              const ctx = d.ctx;
              const { width: cw, height: ch } = d.canvas;
              const img = ctx.getImageData(0, 0, cw, ch);
              let hasInk = false;
              for (let i = 3; i < img.data.length; i += 4) {
                if (img.data[i] > 10) {
                  hasInk = true;
                  break;
                }
              }
              if (hasInk && onDrawStroke) {
                const src = d.canvas.toDataURL("image/png");
                const [, b64 = ""] = src.split(",");
                const binary = atob(b64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                  bytes[i] = binary.charCodeAt(i);
                }
                onDrawStroke(src, bytes.buffer);
                ctx.clearRect(0, 0, cw, ch);
              }
              drawRef.current = null;
            }}
          />
        )}

        {pageOverlays.map((overlay) => {
          const selected = overlay.id === selectedId;
          return (
            <div
              key={overlay.id}
              className={`absolute ${
                drawMode || panMode
                  ? "pointer-events-none"
                  : "cursor-move"
              } ${
                selected
                  ? "outline outline-2 outline-[#3b82f6]"
                  : "hover:outline hover:outline-1 hover:outline-[#3b82f6]/50"
              }`}
              style={{
                left: `${overlay.x * 100}%`,
                top: `${overlay.y * 100}%`,
                width: `${overlay.w * 100}%`,
                height: `${overlay.h * 100}%`,
              }}
              onClick={(e) => {
                if (drawMode || panMode) return;
                e.stopPropagation();
                onSelect(overlay.id);
              }}
              onPointerDown={(e) => {
                if (drawMode || panMode) return;
                e.stopPropagation();
                onSelect(overlay.id);
                const host = e.currentTarget.parentElement;
                if (!host) return;
                const rect = host.getBoundingClientRect();
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                dragRef.current = {
                  id: overlay.id,
                  kind: "move",
                  startX: e.clientX,
                  startY: e.clientY,
                  orig: { ...overlay },
                  pageW: rect.width,
                  pageH: rect.height,
                };
              }}
            >
              {overlay.kind === "text" && (
                <div
                  className="h-full w-full overflow-hidden px-1 leading-tight"
                  style={{
                    fontSize: `${Math.max(10, overlay.fontSize * zoom * (page.displayWidth / page.pdfWidth))}px`,
                    color: overlay.color,
                    fontWeight: overlay.bold ? 700 : 400,
                    fontStyle: overlay.italic ? "italic" : "normal",
                    textDecoration: overlay.underline ? "underline" : "none",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {overlay.text || "Your text here"}
                </div>
              )}

              {(overlay.kind === "image" || overlay.kind === "draw") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={overlay.src}
                  alt=""
                  className="h-full w-full object-contain"
                  draggable={false}
                />
              )}

              {overlay.kind === "shape" && (
                <svg
                  className="h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {overlay.shape === "rect" && (
                    <rect
                      x="2"
                      y="2"
                      width="96"
                      height="96"
                      fill={
                        overlay.fill === "transparent" ? "none" : overlay.fill
                      }
                      fillOpacity={
                        overlay.fill === "transparent" ? 0 : 0.25
                      }
                      stroke={overlay.stroke}
                      strokeWidth={overlay.strokeWidth}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {overlay.shape === "ellipse" && (
                    <ellipse
                      cx="50"
                      cy="50"
                      rx="46"
                      ry="46"
                      fill={
                        overlay.fill === "transparent" ? "none" : overlay.fill
                      }
                      fillOpacity={
                        overlay.fill === "transparent" ? 0 : 0.25
                      }
                      stroke={overlay.stroke}
                      strokeWidth={overlay.strokeWidth}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                  {overlay.shape === "line" && (
                    <line
                      x1="4"
                      y1="4"
                      x2="96"
                      y2="96"
                      stroke={overlay.stroke}
                      strokeWidth={overlay.strokeWidth}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </svg>
              )}

              {selected && !drawMode && !panMode && (
                <>
                  {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                    <span
                      key={corner}
                      className={`absolute h-2.5 w-2.5 rounded-full border-2 border-white bg-[#3b82f6] ${
                        corner === "nw"
                          ? "-left-1 -top-1 cursor-nw-resize"
                          : corner === "ne"
                            ? "-right-1 -top-1 cursor-ne-resize"
                            : corner === "sw"
                              ? "-bottom-1 -left-1 cursor-sw-resize"
                              : "-bottom-1 -right-1 cursor-se-resize"
                      }`}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const host = e.currentTarget.parentElement
                          ?.parentElement as HTMLElement | null;
                        if (!host) return;
                        const rect = host.getBoundingClientRect();
                        (e.currentTarget as HTMLElement).setPointerCapture(
                          e.pointerId,
                        );
                        dragRef.current = {
                          id: overlay.id,
                          kind: "resize",
                          startX: e.clientX,
                          startY: e.clientY,
                          orig: { ...overlay },
                          pageW: rect.width,
                          pageH: rect.height,
                        };
                      }}
                    />
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
