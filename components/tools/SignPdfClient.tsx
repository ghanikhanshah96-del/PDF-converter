"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconTrash,
  IconZoomIn,
  IconZoomOut,
  IconArrowRight,
} from "@/components/pdf-editor/EditorIcons";
import { PdfPageBoard } from "@/components/pdf-editor/PdfPageBoard";
import {
  canvasToPngBuffer,
  fileToPngDataUrl,
  openPdfProgressive,
  renderTypedSignaturePng,
  type ProgressivePdf,
} from "@/components/pdf-editor/renderPdfPages";
import {
  uid,
  type EditorOverlay,
  type ImageEditorOverlay,
  type PagePreview,
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

const tool = toolsById["sign-pdf"];
type SigTab = "draw" | "type" | "upload";

export function SignPdfClient() {
  const inputId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const pdfRef = useRef<ProgressivePdf | null>(null);

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
  const [zoom, setZoom] = useState(0.85);
  const [sigTab, setSigTab] = useState<SigTab>("draw");
  const [typedName, setTypedName] = useState("");
  const [readySig, setReadySig] = useState<{
    src: string;
    bytes: ArrayBuffer;
    aspect: number;
  } | null>(null);
  const [sigCount, setSigCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);

  const currentPreview = pageCache[currentPage] ?? null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !workingFile) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#33333b";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [workingFile, sigTab]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    if (workingFile) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [workingFile]);

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
    setReadySig(null);
    setSigCount(0);
    setError(null);
  };

  const ensurePage = useCallback(
    async (index: number) => {
      const pdf = pdfRef.current;
      if (!pdf || pageCache[index]) {
        pdf?.prefetch(index);
        return;
      }
      try {
        const preview = await pdf.getPage(index);
        setPageCache((prev) => ({ ...prev, [index]: preview }));
        pdf.prefetch(index);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not render page.");
      }
    },
    [pageCache],
  );

  useEffect(() => {
    if (workingFile) void ensurePage(currentPage);
  }, [workingFile, currentPage, ensurePage]);

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

  const placeSignatureNow = (sig: {
    src: string;
    bytes: ArrayBuffer;
    aspect: number;
  }) => {
    if (!currentPreview) return;
    const nextCount = sigCount + 1;
    setSigCount(nextCount);
    const w = 0.32;
    const h = Math.min(
      0.18,
      (w * currentPreview.displayWidth) / sig.aspect / currentPreview.displayHeight,
    );
    const overlay: ImageEditorOverlay = {
      id: uid(),
      kind: "image",
      label: `Signature ${nextCount}`,
      pageIndex: currentPage,
      x: 0.55,
      y: 0.72,
      w,
      h,
      src: sig.src,
      bytes: sig.bytes,
      mime: "image/png",
    };
    setOverlays((prev) => [...prev, overlay]);
    setSelectedId(overlay.id);
    setReadySig(sig);
  };

  const applyAndPlace = () => {
    setError(null);
    try {
      if (sigTab === "draw") {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Signature pad missing.");
        const png = canvasToPngBuffer(canvas);
        placeSignatureNow({
          src: png.src,
          bytes: png.bytes,
          aspect: png.width / Math.max(png.height, 1),
        });
      } else if (sigTab === "type") {
        if (!typedName.trim()) {
          throw new Error("Type your name to create a signature.");
        }
        const png = renderTypedSignaturePng(typedName.trim());
        placeSignatureNow({
          src: png.src,
          bytes: png.bytes,
          aspect: png.width / Math.max(png.height, 1),
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create signature.");
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete" && e.key !== "Backspace") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (!selectedId) return;
      setOverlays((prev) => prev.filter((o) => o.id !== selectedId));
      setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const signPdf = async () => {
    if (!workingFile) return;
    if (!overlays.length) {
      setError("Place a signature on the page first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const needed = [...new Set(overlays.map((o) => o.pageIndex))];
      const sizes: Record<number, PagePreview> = { ...pageCache };
      for (const idx of needed) {
        if (!sizes[idx] && pdfRef.current) {
          sizes[idx] = await pdfRef.current.getPage(idx);
        }
      }
      const { stampSignatures } = await import("@/lib/engines/edit");
      const signatures = overlays
        .filter((o): o is ImageEditorOverlay => o.kind === "image")
        .map((o) => {
          const page = sizes[o.pageIndex]!;
          return {
            pageIndex: o.pageIndex,
            signaturePng: o.bytes!,
            x: o.x * page.pdfWidth,
            y: o.y * page.pdfHeight,
            width: o.w * page.pdfWidth,
            height: o.h * page.pdfHeight,
          };
        });
      const out = await stampSignatures(workingFile, signatures);
      downloadBlob(toPdfBlob(out), `${basename(workingFile.name)}-signed.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign this PDF.");
    } finally {
      setBusy(false);
    }
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
              Opens full-screen — draw, type, or upload a signature
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
            <p className="mt-4 text-sm text-[var(--ink-muted)]">Opening…</p>
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
          <div className="flex shrink-0 items-center gap-2 border-b border-[var(--line)] bg-white px-3 py-2">
            <p className="font-display text-sm font-bold">Sign PDF</p>
            <p className="truncate text-xs text-[var(--ink-muted)]">
              {workingFile.name}
            </p>
            <button
              type="button"
              className="pdf-tool-btn ml-auto"
              onClick={resetDoc}
              title="Close"
            >
              <IconClose />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
            <aside className="max-h-[42vh] shrink-0 overflow-y-auto border-b border-[var(--line)] bg-white p-4 lg:max-h-none lg:w-[300px] lg:border-b-0 lg:border-r">
              <p className="text-sm font-semibold">Create signature</p>
              <div className="mt-2 flex gap-1 rounded-full border border-[var(--line)] bg-[var(--bg-a)] p-0.5">
                {(["draw", "type", "upload"] as SigTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className="pdf-mode-pill flex-1 justify-center capitalize"
                    data-active={sigTab === tab}
                    onClick={() => setSigTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {sigTab === "draw" && (
                <div className="mt-3">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={140}
                    className="w-full touch-none rounded-[var(--radius)] border border-[var(--line)] bg-white"
                    onPointerDown={(e) => {
                      drawing.current = true;
                      const ctx = canvasRef.current?.getContext("2d");
                      if (!ctx) return;
                      const p = getPos(e);
                      ctx.beginPath();
                      ctx.moveTo(p.x, p.y);
                      (e.target as HTMLCanvasElement).setPointerCapture(
                        e.pointerId,
                      );
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
                  <button
                    type="button"
                    className="btn btn-secondary mt-2 w-full !min-h-10 !py-2 text-sm"
                    onClick={clearPad}
                  >
                    Clear
                  </button>
                </div>
              )}

              {sigTab === "type" && (
                <label className="mt-3 block text-xs font-medium">
                  Your name
                  <input
                    className="mt-1 w-full rounded-[var(--radius)] border border-[var(--line)] px-3 py-2 text-sm"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="Jane Doe"
                  />
                </label>
              )}

              {sigTab === "upload" && (
                <label className="mt-3 block text-xs font-medium">
                  Signature image
                  <input
                    type="file"
                    accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                    className="mt-1 w-full text-sm"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (!f) return;
                      try {
                        const img = await fileToPngDataUrl(f);
                        placeSignatureNow({
                          src: img.src,
                          bytes: img.bytes,
                          aspect: img.width / Math.max(img.height, 1),
                        });
                      } catch {
                        setError("Could not load signature image.");
                      }
                    }}
                  />
                </label>
              )}

              {sigTab !== "upload" && (
                <button
                  type="button"
                  className="btn btn-primary mt-3 w-full !min-h-10 !py-2 text-sm"
                  onClick={applyAndPlace}
                >
                  Place on page
                </button>
              )}

              {readySig && (
                <button
                  type="button"
                  className="btn btn-secondary mt-2 w-full !min-h-10 !py-2 text-sm"
                  onClick={() => placeSignatureNow(readySig)}
                >
                  Place another
                </button>
              )}

              <ul className="mt-4 space-y-1">
                {overlays.map((o) => (
                  <li
                    key={o.id}
                    className={`flex items-center gap-2 rounded-[var(--radius)] border px-2 py-2 text-sm ${
                      o.id === selectedId
                        ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                        : "border-[var(--line)]"
                    }`}
                  >
                    <button
                      type="button"
                      className="flex-1 truncate text-left"
                      onClick={() => {
                        setSelectedId(o.id);
                        setCurrentPage(o.pageIndex);
                      }}
                    >
                      {o.label}
                    </button>
                    <button
                      type="button"
                      className="pdf-tool-btn !h-8 !w-8"
                      onClick={() => {
                        setOverlays((prev) => prev.filter((x) => x.id !== o.id));
                      }}
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="pdf-save-btn mt-4"
                disabled={busy || !overlays.length}
                onClick={() => void signPdf()}
              >
                {busy ? "Signing…" : "Sign PDF"}
                <IconArrowRight className="h-6 w-6" />
              </button>
              {error && (
                <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>
              )}
            </aside>

            <main className="relative min-w-0 flex-1 overflow-auto bg-[#e8e8ee] p-3 sm:p-6">
              {currentPreview && (
                <PdfPageBoard
                  page={currentPreview}
                  overlays={overlays}
                  selectedId={selectedId}
                  zoom={zoom}
                  onSelect={setSelectedId}
                  onChangeOverlays={(updater) => setOverlays(updater)}
                />
              )}
              <div className="pointer-events-none sticky bottom-4 z-10 flex justify-center">
                <div className="pdf-float-nav pointer-events-auto">
                  <button
                    type="button"
                    disabled={currentPage <= 0}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    <IconChevronUp className="h-4 w-4" />
                  </button>
                  <span className="min-w-[3.5rem] text-center text-xs font-semibold">
                    {currentPage + 1} / {numPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage >= numPages - 1}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    <IconChevronDown className="h-4 w-4" />
                  </button>
                  <span className="mx-1 h-4 w-px bg-white/25" />
                  <button
                    type="button"
                    onClick={() =>
                      setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))
                    }
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
                  >
                    <IconZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </>
  );
}
