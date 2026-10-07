"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  IconAnnotate,
  IconArrowRight,
  IconBold,
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconEditMode,
  IconEllipse,
  IconHand,
  IconImage,
  IconInfo,
  IconItalic,
  IconLine,
  IconPen,
  IconRect,
  IconShapes,
  IconText,
  IconTrash,
  IconUnderline,
  IconUndo,
  IconRedo,
  IconZoomIn,
  IconZoomOut,
} from "@/components/pdf-editor/EditorIcons";
import { PdfPageBoard } from "@/components/pdf-editor/PdfPageBoard";
import {
  fileToPngDataUrl,
  openPdfProgressive,
  type ProgressivePdf,
} from "@/components/pdf-editor/renderPdfPages";
import {
  hexToRgb,
  uid,
  type DrawEditorOverlay,
  type EditorOverlay,
  type ImageEditorOverlay,
  type PagePreview,
  type ShapeEditorOverlay,
  type TextEditorOverlay,
} from "@/components/pdf-editor/types";
import { downloadBlob, basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import {
  formatBytes,
  MAX_FILE_BYTES,
  MAX_FILE_LABEL,
} from "@/lib/limits";
import {
  isPdfEncrypted,
  unlockPdfBytes,
  unlockedPdfFile,
} from "@/lib/pdf-encryption";
import { toolsById } from "@/lib/tools";

const tool = toolsById["edit-pdf"];

type Mode = "annotate" | "edit";
type ToolId =
  | "hand"
  | "text"
  | "image"
  | "draw"
  | "shapes"
  | "rect"
  | "ellipse"
  | "line";

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

export function EditPdfClient() {
  const inputId = useId();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<ProgressivePdf | null>(null);
  const historyRef = useRef<EditorOverlay[][]>([]);
  const futureRef = useRef<EditorOverlay[][]>([]);
  const counters = useRef({ text: 0, image: 0, draw: 0, shape: 0 });

  const [file, setFile] = useState<File | null>(null);
  const [workingFile, setWorkingFile] = useState<File | null>(null);
  const [encrypted, setEncrypted] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageCache, setPageCache] = useState<Record<number, PagePreview>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [overlays, setOverlays] = useState<EditorOverlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("edit");
  const [activeTool, setActiveTool] = useState<ToolId>("text");
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [zoom, setZoom] = useState(0.85);
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#33333b");
  const [drawColor, setDrawColor] = useState("#33333b");
  const [drawWidth, setDrawWidth] = useState(4);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const selected = overlays.find((o) => o.id === selectedId) ?? null;
  const currentPreview = pageCache[currentPage] ?? null;
  const pageOverlays = overlays.filter((o) => o.pageIndex === currentPage);

  const pushHistory = useCallback((next: EditorOverlay[]) => {
    historyRef.current.push(overlays);
    if (historyRef.current.length > 40) historyRef.current.shift();
    futureRef.current = [];
    setOverlays(next);
  }, [overlays]);

  /** Live drag/resize updates — no undo snapshots (keeps editor fast). */
  const setOverlaysLive = useCallback(
    (updater: (prev: EditorOverlay[]) => EditorOverlay[]) => {
      setOverlays(updater);
    },
    [],
  );

  const undo = () => {
    const prev = historyRef.current.pop();
    if (!prev) return;
    futureRef.current.push(overlays);
    setOverlays(prev);
    setSelectedId(null);
  };

  const redo = () => {
    const next = futureRef.current.pop();
    if (!next) return;
    historyRef.current.push(overlays);
    setOverlays(next);
  };

  const resetDoc = () => {
    pdfRef.current?.destroy();
    pdfRef.current = null;
    setFile(null);
    setWorkingFile(null);
    setEncrypted(false);
    setPassword("");
    setPasswordError(null);
    setNumPages(0);
    setPageCache({});
    setCurrentPage(0);
    setOverlays([]);
    setSelectedId(null);
    setZoom(0.85);
    setError(null);
    historyRef.current = [];
    futureRef.current = [];
    counters.current = { text: 0, image: 0, draw: 0, shape: 0 };
  };

  const ensurePage = useCallback(async (index: number) => {
    const pdf = pdfRef.current;
    if (!pdf) return;
    if (pageCache[index]) {
      pdf.prefetch(index);
      return;
    }
    setPageLoading(true);
    try {
      const preview = await pdf.getPage(index);
      setPageCache((prev) => ({ ...prev, [index]: preview }));
      pdf.prefetch(index);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not render page.");
    } finally {
      setPageLoading(false);
    }
  }, [pageCache]);

  useEffect(() => {
    if (workingFile) void ensurePage(currentPage);
  }, [workingFile, currentPage, ensurePage]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (workingFile) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [workingFile]);

  const openUnlocked = async (pdfFile: File) => {
    setLoading(true);
    setError(null);
    try {
      pdfRef.current?.destroy();
      const progressive = await openPdfProgressive(pdfFile);
      pdfRef.current = progressive;
      setNumPages(progressive.numPages);
      setWorkingFile(pdfFile);
      setCurrentPage(0);
      setOverlays([]);
      setSelectedId(null);
      setPageCache({});
      const first = await progressive.getPage(0);
      setPageCache({ 0: first });
      progressive.prefetch(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open this PDF.");
    } finally {
      setLoading(false);
    }
  };

  const ingestFile = async (next: File) => {
    if (next.size > MAX_FILE_BYTES) {
      setError(
        `"${next.name}" is ${formatBytes(next.size)}. Maximum is ${MAX_FILE_LABEL}.`,
      );
      return;
    }
    setFile(next);
    setPassword("");
    setPasswordError(null);
    setError(null);
    setLoading(true);
    try {
      const locked = await isPdfEncrypted(next);
      setEncrypted(locked);
      if (locked) {
        setWorkingFile(null);
        setLoading(false);
        return;
      }
      await openUnlocked(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this PDF.");
      setLoading(false);
    }
  };

  const unlockAndOpen = async () => {
    if (!file) return;
    setPasswordError(null);
    setLoading(true);
    try {
      const bytes = await unlockPdfBytes(file, password);
      await openUnlocked(unlockedPdfFile(file, bytes));
      setEncrypted(false);
    } catch (e) {
      setPasswordError(
        e instanceof Error ? e.message : "Incorrect password.",
      );
      setLoading(false);
    }
  };

  const addTextNow = () => {
    counters.current.text += 1;
    const overlay: TextEditorOverlay = {
      id: uid(),
      kind: "text",
      label: `New Text ${counters.current.text}`,
      pageIndex: currentPage,
      x: 0.18,
      y: 0.18,
      w: 0.42,
      h: 0.07,
      text: "Your text here",
      fontSize,
      color: textColor,
    };
    pushHistory([...overlays, overlay]);
    setSelectedId(overlay.id);
    setActiveTool("text");
    setMode("edit");
  };

  const addShapeNow = (shape: ShapeEditorOverlay["shape"]) => {
    counters.current.shape += 1;
    const overlay: ShapeEditorOverlay = {
      id: uid(),
      kind: "shape",
      label: `New ${shape} ${counters.current.shape}`,
      shape,
      pageIndex: currentPage,
      x: 0.22,
      y: 0.22,
      w: shape === "line" ? 0.35 : 0.3,
      h: shape === "line" ? 0.08 : 0.18,
      stroke: drawColor,
      fill: "transparent",
      strokeWidth: drawWidth,
    };
    pushHistory([...overlays, overlay]);
    setSelectedId(overlay.id);
    setShowShapesMenu(false);
    setActiveTool(shape);
    setMode("annotate");
  };

  const addImageNow = async (f: File) => {
    if (!currentPreview) return;
    counters.current.image += 1;
    const img = await fileToPngDataUrl(f);
    const aspect = img.width / Math.max(img.height, 1);
    const w = 0.3;
    const h = Math.min(
      0.4,
      (w * currentPreview.displayWidth) / aspect / currentPreview.displayHeight,
    );
    const overlay: ImageEditorOverlay = {
      id: uid(),
      kind: "image",
      label: `New Image ${counters.current.image}`,
      pageIndex: currentPage,
      x: 0.15,
      y: 0.15,
      w,
      h,
      src: img.src,
      bytes: img.bytes,
      mime: img.mime,
    };
    pushHistory([...overlays, overlay]);
    setSelectedId(overlay.id);
    setActiveTool("image");
    setMode("edit");
  };

  const onDrawStroke = (src: string, bytes: ArrayBuffer) => {
    counters.current.draw += 1;
    const overlay: DrawEditorOverlay = {
      id: uid(),
      kind: "draw",
      label: `New drawing ${counters.current.draw}`,
      pageIndex: currentPage,
      x: 0,
      y: 0,
      w: 1,
      h: 1,
      src,
      bytes,
    };
    pushHistory([...overlays, overlay]);
    setSelectedId(overlay.id);
  };

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    pushHistory(overlays.filter((o) => o.id !== selectedId));
    setSelectedId(null);
  }, [selectedId, overlays, pushHistory]);

  const removeAllOnPage = () => {
    pushHistory(overlays.filter((o) => o.pageIndex !== currentPage));
    setSelectedId(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT"))
          return;
        deleteSelected();
      }
      if (e.key === "Escape") resetDoc();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteSelected, overlays]);

  const patchSelected = (patch: Partial<EditorOverlay>) => {
    if (!selectedId) return;
    setOverlays((prev) =>
      prev.map((o) =>
        o.id === selectedId ? ({ ...o, ...patch } as EditorOverlay) : o,
      ),
    );
  };

  const applyEdits = async () => {
    if (!workingFile || !currentPreview) return;
    if (!overlays.length) {
      setError("Add text, an image, a shape, or a drawing first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // Ensure all pages that have overlays are rendered for size metrics
      const needed = [...new Set(overlays.map((o) => o.pageIndex))];
      const sizes: Record<number, PagePreview> = { ...pageCache };
      for (const idx of needed) {
        if (!sizes[idx] && pdfRef.current) {
          sizes[idx] = await pdfRef.current.getPage(idx);
        }
      }

      const { applyPdfOverlays } = await import("@/lib/engines/edit");
      const texts = overlays
        .filter((o): o is TextEditorOverlay => o.kind === "text")
        .map((o) => {
          const page = sizes[o.pageIndex]!;
          return {
            pageIndex: o.pageIndex,
            text: o.text,
            x: o.x * page.pdfWidth,
            y: o.y * page.pdfHeight,
            size: o.fontSize,
            color: hexToRgb(o.color),
            bold: o.bold,
          };
        });
      const images = [];
      for (const o of overlays) {
        if (o.kind !== "image" && o.kind !== "draw") continue;
        const page = sizes[o.pageIndex]!;
        images.push({
          pageIndex: o.pageIndex,
          imageBytes: o.bytes!,
          mime: "image/png",
          x: o.x * page.pdfWidth,
          y: o.y * page.pdfHeight,
          width: o.w * page.pdfWidth,
          height: o.h * page.pdfHeight,
        });
      }
      const shapes = overlays
        .filter((o): o is ShapeEditorOverlay => o.kind === "shape")
        .map((o) => {
          const page = sizes[o.pageIndex]!;
          return {
            pageIndex: o.pageIndex,
            shape: o.shape,
            x: o.x * page.pdfWidth,
            y: o.y * page.pdfHeight,
            width: o.w * page.pdfWidth,
            height: o.h * page.pdfHeight,
            stroke: hexToRgb(o.stroke),
            fill: o.fill === "transparent" ? null : hexToRgb(o.fill),
            strokeWidth: o.strokeWidth,
          };
        });
      const out = await applyPdfOverlays(workingFile, texts, images, shapes);
      downloadBlob(toPdfBlob(out), `${basename(workingFile.name)}-edited.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not apply edits.");
    } finally {
      setBusy(false);
    }
  };

  const goPage = (index: number) => {
    if (index < 0 || index >= numPages) return;
    setCurrentPage(index);
    setSelectedId(null);
  };

  return (
    <>
      {!workingFile && (
        <div className="surface p-4 sm:p-6">
          <label
            htmlFor={inputId}
            className="dropzone flex cursor-pointer flex-col items-center justify-center px-4 py-10 text-center sm:py-14"
            data-active={dropActive}
            onDragEnter={(e) => {
              e.preventDefault();
              setDropActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDropActive(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDropActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDropActive(false);
              const f = e.dataTransfer.files?.[0];
              if (f) void ingestFile(f);
            }}
          >
            <span className="font-display text-base font-semibold sm:text-lg">
              Select PDF file
            </span>
            <span className="mt-1 text-sm text-[var(--ink-muted)]">
              or drop a PDF here to open the full editor
            </span>
            <span className="mt-2 text-xs text-[var(--ink-muted)]">
              Max file size: {MAX_FILE_LABEL}
            </span>
            <input
              id={inputId}
              type="file"
              className="sr-only"
              accept={tool.accept}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void ingestFile(f);
                e.target.value = "";
              }}
            />
          </label>

          {file && encrypted && (
            <div className="mt-4 rounded-[var(--radius)] border border-[var(--line)] bg-[var(--brand-soft)] p-4">
              <p className="text-sm font-semibold">Password-protected PDF</p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <label className="min-w-[12rem] flex-1 text-xs font-medium">
                  Password
            <input
                    type="password"
                    autoComplete="off"
                    className="mt-1 w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void unlockAndOpen();
                    }}
            />
          </label>
                <button
                  type="button"
                  className="btn btn-primary !py-2 text-sm"
                  disabled={!password.trim() || loading}
                  onClick={() => void unlockAndOpen()}
                >
                  Unlock &amp; open
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-xs text-[var(--danger)]">{passwordError}</p>
              )}
            </div>
          )}

          {loading && (
            <p className="mt-4 text-sm text-[var(--ink-muted)]">
              Opening editor…
            </p>
          )}
          {error && (
            <p className="mt-4 rounded-[var(--radius)] bg-red-50 px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}
        </div>
      )}

      {workingFile && (
        <div className="fixed inset-0 z-[80] flex flex-col bg-[#f3f3f7]">
          {/* Top toolbars */}
          <div className="shrink-0 border-b border-[var(--line)] bg-white">
            <div className="flex flex-wrap items-center gap-2 px-2 py-2 sm:px-3">
              <div className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--bg-a)] p-0.5">
                <button
                  type="button"
                  className="pdf-mode-pill"
                  data-active={mode === "annotate"}
                  onClick={() => {
                    setMode("annotate");
                    setActiveTool("draw");
                  }}
                >
                  <IconAnnotate /> Annotate
                </button>
                <button
                  type="button"
                  className="pdf-mode-pill"
                  data-active={mode === "edit"}
                  onClick={() => {
                    setMode("edit");
                    setActiveTool("text");
                  }}
                >
                  <IconEditMode /> Edit
                </button>
              </div>

              <span className="mx-1 hidden h-6 w-px bg-[var(--line)] sm:block" />

              <button
                type="button"
                className="pdf-tool-btn"
                data-active={activeTool === "hand"}
                title="Hand / pan"
                onClick={() => setActiveTool("hand")}
              >
                <IconHand />
              </button>
              <button
                type="button"
                className="pdf-tool-btn"
                data-active={activeTool === "text"}
                title="Add text"
                onClick={() => {
                  setMode("edit");
                  addTextNow();
                }}
              >
                <IconText />
              </button>
              <button
                type="button"
                className="pdf-tool-btn"
                data-active={activeTool === "image"}
                title="Add image"
                onClick={() => {
                  setMode("edit");
                  imageInputRef.current?.click();
                }}
              >
                <IconImage />
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f)
                    void addImageNow(f).catch(() =>
                      setError("Could not load image."),
                    );
                }}
              />
              <button
                type="button"
                className="pdf-tool-btn"
                data-active={activeTool === "draw"}
                title="Draw"
                onClick={() => {
                  setMode("annotate");
                  setActiveTool("draw");
                  setSelectedId(null);
                }}
              >
                <IconPen />
              </button>
              <div className="relative">
                <button
                  type="button"
                  className="pdf-tool-btn"
                  data-active={
                    activeTool === "shapes" ||
                    activeTool === "rect" ||
                    activeTool === "ellipse" ||
                    activeTool === "line"
                  }
                  title="Shapes"
                  onClick={() => setShowShapesMenu((v) => !v)}
                >
                  <IconShapes />
                </button>
                {showShapesMenu && (
                  <div className="absolute left-0 top-full z-20 mt-1 flex gap-1 rounded-[var(--radius)] border border-[var(--line)] bg-white p-1 shadow-[var(--shadow)]">
                    <button
                      type="button"
                      className="pdf-tool-btn"
                      title="Rectangle"
                      onClick={() => addShapeNow("rect")}
                    >
                      <IconRect />
                    </button>
                    <button
                      type="button"
                      className="pdf-tool-btn"
                      title="Ellipse"
                      onClick={() => addShapeNow("ellipse")}
                    >
                      <IconEllipse />
                    </button>
                    <button
                      type="button"
                      className="pdf-tool-btn"
                      title="Line"
                      onClick={() => addShapeNow("line")}
                    >
                      <IconLine />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="pdf-tool-btn ml-auto"
                title="Close"
                onClick={resetDoc}
              >
                <IconClose />
              </button>
            </div>

            {/* Contextual format bar */}
            <div className="flex flex-wrap items-center gap-2 border-t border-[var(--line)] px-2 py-1.5 sm:px-3">
              {selected?.kind === "text" || activeTool === "text" ? (
                <>
                  <select
                    className="pdf-editor-select"
                    value={
                      selected?.kind === "text" ? selected.fontSize : fontSize
                    }
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setFontSize(v);
                      if (selected?.kind === "text")
                        patchSelected({ fontSize: v });
                    }}
                    aria-label="Font size"
                  >
                    {FONT_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <label className="inline-flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-[6px] border border-[var(--line)]">
            <input
                      type="color"
                      className="h-8 w-8 cursor-pointer border-0"
                      value={
                        selected?.kind === "text" ? selected.color : textColor
                      }
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        if (selected?.kind === "text")
                          patchSelected({ color: e.target.value });
                      }}
                      aria-label="Text color"
            />
          </label>
                  <button
                    type="button"
                    className="pdf-tool-btn !h-[34px] !w-[34px]"
                    data-active={!!(selected?.kind === "text" && selected.bold)}
                    onClick={() =>
                      selected?.kind === "text" &&
                      patchSelected({ bold: !selected.bold })
                    }
                    title="Bold"
                  >
                    <IconBold className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="pdf-tool-btn !h-[34px] !w-[34px]"
                    data-active={
                      !!(selected?.kind === "text" && selected.italic)
                    }
                    onClick={() =>
                      selected?.kind === "text" &&
                      patchSelected({ italic: !selected.italic })
                    }
                    title="Italic"
                  >
                    <IconItalic className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="pdf-tool-btn !h-[34px] !w-[34px]"
                    data-active={
                      !!(selected?.kind === "text" && selected.underline)
                    }
                    onClick={() =>
                      selected?.kind === "text" &&
                      patchSelected({ underline: !selected.underline })
                    }
                    title="Underline"
                  >
                    <IconUnderline className="h-4 w-4" />
                  </button>
                </>
              ) : activeTool === "draw" || selected?.kind === "shape" ? (
                <>
                  <label className="inline-flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-[6px] border border-[var(--line)]">
            <input
                      type="color"
                      className="h-8 w-8 cursor-pointer border-0"
                      value={drawColor}
                      onChange={(e) => {
                        setDrawColor(e.target.value);
                        if (selected?.kind === "shape")
                          patchSelected({ stroke: e.target.value });
                      }}
                      aria-label="Stroke color"
            />
          </label>
                  <select
                    className="pdf-editor-select"
                    value={drawWidth}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setDrawWidth(v);
                      if (selected?.kind === "shape")
                        patchSelected({ strokeWidth: v });
                    }}
                    aria-label="Stroke width"
                  >
                    {[1, 2, 3, 4, 6, 8, 12].map((w) => (
                      <option key={w} value={w}>
                        {w} pt
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <span className="text-xs text-[var(--ink-muted)]">
                  Select a tool or an item on the page
                </span>
              )}

              <span className="mx-1 hidden h-5 w-px bg-[var(--line)] sm:block" />
              <button
                type="button"
                className="pdf-tool-btn !h-[34px] !w-[34px]"
                onClick={undo}
                title="Undo"
              >
                <IconUndo className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="pdf-tool-btn !h-[34px] !w-[34px]"
                onClick={redo}
                title="Redo"
              >
                <IconRedo className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="pdf-tool-btn !h-[34px] !w-[34px]"
                disabled={!selectedId}
                onClick={deleteSelected}
                title="Delete"
              >
                <IconTrash className="h-4 w-4" />
              </button>
              <select
                className="pdf-editor-select ml-auto"
                value={Math.round(zoom * 100)}
                onChange={(e) => setZoom(Number(e.target.value) / 100)}
                aria-label="Zoom"
              >
                {[50, 75, 85, 100, 125, 150].map((z) => (
                  <option key={z} value={z}>
                    {z}%
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3-column body */}
          <div className="flex min-h-0 flex-1">
            {/* Left thumbnails */}
            <aside className="hidden w-[100px] shrink-0 overflow-y-auto border-r border-[var(--line)] bg-white p-2 sm:block md:w-[120px]">
              {Array.from({ length: numPages }, (_, i) => {
                const thumb = pageCache[i]?.thumbUrl;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`mb-2 block w-full overflow-hidden rounded border-2 bg-[var(--bg-a)] ${
                      currentPage === i
                        ? "border-[#3b82f6]"
                        : "border-transparent hover:border-[var(--line)]"
                    }`}
                    onClick={() => goPage(i)}
                    onMouseEnter={() => void ensurePage(i)}
                  >
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={`Page ${i + 1}`}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex aspect-[3/4] items-center justify-center text-xs text-[var(--ink-muted)]">
                        {i + 1}
                      </div>
                    )}
                    <span className="block py-1 text-center text-[11px] text-[var(--ink-muted)]">
                      {i + 1}
                    </span>
                  </button>
                );
              })}
            </aside>

            {/* Center canvas */}
            <main className="relative min-w-0 flex-1 overflow-auto bg-[#e8e8ee] p-3 sm:p-6">
              {pageLoading && !currentPreview && (
                <p className="text-center text-sm text-[var(--ink-muted)]">
                  Rendering page…
                </p>
              )}
              {currentPreview && (
                <PdfPageBoard
                  page={currentPreview}
                  overlays={overlays}
                  selectedId={selectedId}
                  zoom={zoom}
                  panMode={activeTool === "hand"}
                  drawMode={activeTool === "draw"}
                  drawColor={drawColor}
                  drawWidth={drawWidth}
                  onSelect={setSelectedId}
                  onChangeOverlays={setOverlaysLive}
                  onDrawStroke={onDrawStroke}
                />
              )}

              {selected?.kind === "text" && (
                <div className="mx-auto mt-3 max-w-md">
            <input
                    className="w-full rounded-[var(--radius)] border border-[var(--line)] bg-white px-3 py-2 text-sm shadow-sm"
                    value={selected.text}
                    onChange={(e) => patchSelected({ text: e.target.value })}
                    placeholder="Your text here"
                    autoFocus
                  />
                </div>
              )}

              {/* Floating page nav */}
              <div className="pointer-events-none sticky bottom-4 z-10 flex justify-center">
                <div className="pdf-float-nav pointer-events-auto">
                  <button
                    type="button"
                    disabled={currentPage <= 0}
                    onClick={() => goPage(currentPage - 1)}
                    aria-label="Previous page"
                  >
                    <IconChevronUp className="h-4 w-4" />
                  </button>
                  <span className="min-w-[3.5rem] text-center text-xs font-semibold">
                    {currentPage + 1} / {numPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= numPages - 1}
                    onClick={() => goPage(currentPage + 1)}
                    aria-label="Next page"
                  >
                    <IconChevronDown className="h-4 w-4" />
                  </button>
                  <span className="mx-1 h-4 w-px bg-white/25" />
                  <button
                    type="button"
                    onClick={() =>
                      setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))
                    }
                    aria-label="Zoom out"
                  >
                    <IconZoomOut className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2.5rem] text-center text-xs">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))
                    }
                    aria-label="Zoom in"
                  >
                    <IconZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </main>

            {/* Right sidebar */}
            <aside className="flex w-full max-w-[100%] shrink-0 flex-col border-t border-[var(--line)] bg-white sm:w-[280px] sm:border-l sm:border-t-0 lg:w-[300px]">
              <div className="border-b border-[var(--line)] px-4 py-3">
                <h2 className="font-display text-base font-bold text-[var(--ink)]">
                  Edit PDF
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="mb-3 flex gap-2 rounded-[var(--radius)] border border-[#cfe3ff] bg-[#eef5ff] px-3 py-2 text-xs text-[#2a4a7a]">
                  <IconInfo className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Reorder items to move them to the back or front.</p>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Page {currentPage + 1}</p>
                  {pageOverlays.length > 0 && (
                    <button
                      type="button"
                      className="text-xs font-semibold text-[var(--brand)] hover:underline"
                      onClick={removeAllOnPage}
                    >
                      Remove all
                    </button>
                  )}
                </div>

                <ul className="space-y-1">
                  {pageOverlays.length === 0 && (
                    <li className="text-xs text-[var(--ink-muted)]">
                      No items on this page yet. Use the toolbar icons to add
                      text, images, drawings, or shapes — they appear instantly.
                    </li>
                  )}
                  {[...pageOverlays].reverse().map((o) => (
                    <li
                      key={o.id}
                      className={`flex items-center gap-2 rounded-[var(--radius)] border px-2 py-2 text-sm ${
                        o.id === selectedId
                          ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                          : "border-[var(--line)] bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 truncate text-left font-medium"
                        onClick={() => setSelectedId(o.id)}
                      >
                        {o.label}
                      </button>
                      <button
                        type="button"
                        className="pdf-tool-btn !h-8 !w-8"
                        title="Delete"
                        onClick={() => {
                          pushHistory(overlays.filter((x) => x.id !== o.id));
                          if (selectedId === o.id) setSelectedId(null);
                        }}
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[var(--line)] p-4">
                {error && (
                  <p className="mb-2 text-xs text-[var(--danger)]">{error}</p>
                )}
                <button
                  type="button"
                  className="pdf-save-btn"
                  disabled={busy || !overlays.length}
                  onClick={() => void applyEdits()}
                >
                  {busy ? "Saving…" : "Save changes"}
                  <IconArrowRight className="h-6 w-6 text-[var(--brand)]" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}
