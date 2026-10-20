"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { PdfViewer } from "@/components/PdfViewer";
import { IconClose, IconEye } from "@/components/icons";
import { setPreviewPayload } from "@/lib/preview-session";
import { toolsById } from "@/lib/tools";

type Props = {
  open: boolean;
  blob: Blob | null;
  filename: string;
  onClose: () => void;
};

const viewerHref = toolsById["view-pdf"]?.href ?? "/pdf-viewer-online-free";

export function PdfViewerOverlay({ open, blob, filename, onClose }: Props) {
  const titleId = useId();
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    if (!open || !blob) {
      setBuffer(null);
      return;
    }
    let cancelled = false;
    blob.arrayBuffer().then((ab) => {
      if (!cancelled) setBuffer(ab);
    });
    return () => {
      cancelled = true;
    };
  }, [open, blob]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !blob) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[var(--bg-a)]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] bg-white px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2
            id={titleId}
            className="truncate font-display text-lg font-semibold text-[var(--ink)]"
          >
            Full view
          </h2>
          <p className="truncate text-xs text-[var(--ink-muted)]">{filename}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={viewerHref}
            className="btn btn-secondary btn-icon !min-h-10 !px-4 !py-2 text-sm"
            onClick={() => setPreviewPayload({ blob, filename })}
          >
            <IconEye />
            PDF Viewer tool
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-icon !min-h-10 !px-4 !py-2 text-sm"
            onClick={onClose}
          >
            <IconClose />
            Close
          </button>
        </div>
      </header>
      <div className="site-container flex min-h-0 flex-1 flex-col py-4">
        {buffer ? (
          <PdfViewer
            data={buffer}
            filename={filename}
            className="min-h-0 flex-1"
            onePageHeight={false}
          />
        ) : (
          <p className="text-sm text-[var(--ink-muted)]">Preparing preview…</p>
        )}
      </div>
    </div>
  );
}
