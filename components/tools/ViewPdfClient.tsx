"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { PdfViewer } from "@/components/PdfViewer";
import { PdfViewerOverlay } from "@/components/PdfViewerOverlay";
import { IconExpand, IconRefresh } from "@/components/icons";
import { takePreviewPayload } from "@/lib/preview-session";
import {
  assertFilesWithinLimit,
  formatBytes,
  MAX_FILE_LABEL,
} from "@/lib/limits";
import { toolsById } from "@/lib/tools";

const tool = toolsById["view-pdf"];

export function ViewPdfClient() {
  const inputId = useId();
  const [filename, setFilename] = useState<string | null>(null);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const loadFile = useCallback(async (file: File) => {
    setError(null);
    try {
      assertFilesWithinLimit([file]);
      if (!/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
        throw new Error("Please select a PDF file.");
      }
      const ab = await file.arrayBuffer();
      setFilename(file.name);
      setBuffer(ab);
      setBlob(file);
      setFullscreen(false);
    } catch (e) {
      setBuffer(null);
      setBlob(null);
      setFilename(null);
      setError(e instanceof Error ? e.message : "Could not open that PDF.");
    }
  }, []);

  useEffect(() => {
    const pending = takePreviewPayload();
    if (!pending) return;
    void (async () => {
      try {
        const ab = await pending.blob.arrayBuffer();
        setFilename(pending.filename);
        setBuffer(ab);
        setBlob(pending.blob);
        setFullscreen(false);
      } catch {
        setError("Could not open the prepared PDF preview.");
      }
    })();
  }, []);

  const onFiles = (list: FileList | null) => {
    const file = list?.[0];
    if (file) void loadFile(file);
  };

  return (
    <div className="surface p-4 sm:p-6">
      {!buffer ? (
        <label
          htmlFor={inputId}
          className="dropzone flex cursor-pointer flex-col items-center justify-center px-4 py-10 text-center sm:py-14"
          data-active={active}
          onDragEnter={(e) => {
            e.preventDefault();
            setActive(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setActive(false);
            onFiles(e.dataTransfer.files);
          }}
        >
          <span className="font-display text-base font-semibold text-[var(--ink)] sm:text-lg">
            Drop a PDF to view
          </span>
          <span className="mt-1 text-sm text-[var(--ink-muted)]">
            {tool.summary}
          </span>
          <span className="mt-2 text-xs text-[var(--ink-muted)]">
            Max {MAX_FILE_LABEL} · Mozilla PDF.js · one-page scroll panel
          </span>
          <input
            id={inputId}
            type="file"
            className="sr-only"
            accept={tool.accept}
            onChange={(e) => {
              onFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      ) : (
        <PdfViewer
          data={buffer}
          filename={
            filename
              ? `${filename}${blob ? ` · ${formatBytes(blob.size)}` : ""}`
              : "document.pdf"
          }
          onePageHeight
          toolbar={
            <>
              <button
                type="button"
                className="btn btn-primary btn-icon !min-h-10 !px-4 !py-2 text-sm"
                onClick={() => setFullscreen(true)}
              >
                <IconExpand />
                Full view
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-icon !min-h-10 !px-4 !py-2 text-sm"
                onClick={() => {
                  setBuffer(null);
                  setBlob(null);
                  setFilename(null);
                  setFullscreen(false);
                }}
              >
                <IconRefresh />
                Another file
              </button>
            </>
          }
        />
      )}

      {error && (
        <p
          className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <PdfViewerOverlay
        open={fullscreen}
        blob={blob}
        filename={filename || "document.pdf"}
        onClose={() => setFullscreen(false)}
      />
    </div>
  );
}
