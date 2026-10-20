"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { getPdfjs } from "@/lib/pdfjs";

type Props = {
  data: ArrayBuffer | Uint8Array;
  filename?: string;
  className?: string;
  /**
   * Constrains the scroll area to roughly one page height so the PDF scrolls
   * inside the panel instead of stretching the whole tool page.
   */
  onePageHeight?: boolean;
  /** Extra toolbar actions (e.g. full-view button). */
  toolbar?: ReactNode;
};

function safeDestroy(target: { destroy?: () => unknown } | null) {
  try {
    if (target && typeof target.destroy === "function") {
      void target.destroy();
    }
  } catch {
    /* ignore teardown races (React Strict Mode / remount) */
  }
}

/**
 * Mozilla PDF.js viewer — progressive page paint inside a fixed scroll panel.
 */
export function PdfViewer({
  data,
  filename,
  className = "",
  onePageHeight = false,
  toolbar,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState("Opening…");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: { destroy?: () => unknown } | null = null;
    let doc: { destroy?: () => unknown; numPages: number } | null = null;

    (async () => {
      setError(null);
      setStatus("Opening…");
      setPageCount(0);
      const host = scrollerRef.current;
      if (!host) return;
      host.replaceChildren();

      try {
        const pdfjs = await getPdfjs();
        const bytes =
          data instanceof Uint8Array
            ? data.slice()
            : new Uint8Array(data.slice(0));

        loadingTask = pdfjs.getDocument({ data: bytes }) as never;
        doc = (await (
          loadingTask as unknown as { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<unknown>; destroy?: () => unknown }> }
        ).promise) as never;

        if (cancelled) {
          safeDestroy(doc);
          safeDestroy(loadingTask);
          return;
        }

        const pdf = doc as unknown as {
          numPages: number;
          getPage: (n: number) => Promise<{
            getViewport: (o: { scale: number }) => {
              width: number;
              height: number;
            };
            render: (o: unknown) => { promise: Promise<void> };
          }>;
        };

        setPageCount(pdf.numPages);
        setStatus(`Loading pages…`);

        const maxCssWidth = Math.min(860, Math.max(260, host.clientWidth - 24));

        for (let n = 1; n <= pdf.numPages; n += 1) {
          if (cancelled) break;
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const scale = maxCssWidth / Math.max(base.width, 1);
          const viewport = page.getViewport({ scale });
          const ratio = Math.min(
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
            2,
          );

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.floor(viewport.width * ratio));
          canvas.height = Math.max(1, Math.floor(viewport.height * ratio));
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;
          canvas.className =
            "mx-auto mb-3 block max-w-full rounded-lg border border-[var(--line)] bg-white shadow-sm last:mb-0";
          canvas.setAttribute("aria-label", `Page ${n} of ${pdf.numPages}`);

          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) continue;
          ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
          host.appendChild(canvas);

          await page.render({
            canvasContext: ctx,
            viewport,
            canvas,
          }).promise;

          setStatus(`Page ${n} of ${pdf.numPages}`);
          await new Promise<void>((r) =>
            window.requestAnimationFrame(() => r()),
          );
        }

        if (!cancelled) {
          setStatus(
            `${pdf.numPages} page${pdf.numPages === 1 ? "" : "s"}`,
          );
        }
      } catch (e) {
        if (!cancelled) {
          const message =
            e instanceof Error
              ? e.message
              : "Could not open this PDF for viewing.";
          // Ignore teardown races from React Strict Mode remounts.
          if (!/destroy is not a function/i.test(message)) {
            setError(message);
            setStatus("Could not open");
          }
        }
      }
    })();

    return () => {
      cancelled = true;
      // Prefer loading-task teardown (covers worker + document in PDF.js).
      safeDestroy(loadingTask);
      safeDestroy(doc);
      if (scrollerRef.current) scrollerRef.current.replaceChildren();
    };
  }, [data]);

  const panelClass = onePageHeight
    ? "pdf-scroller h-[min(70vh,36rem)] max-h-[36rem]"
    : "pdf-scroller min-h-[18rem] flex-1";

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--ink)]">
            {filename || "PDF preview"}
          </p>
          <p className="text-xs text-[var(--ink-muted)]" aria-live="polite">
            {error ? "Preview failed" : status}
            {pageCount > 0 && !error ? ` · Mozilla PDF.js` : ""}
          </p>
        </div>
        {toolbar ? <div className="flex flex-wrap gap-2">{toolbar}</div> : null}
      </div>
      {error && (
        <p
          className="mb-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      )}
      <div
        ref={scrollerRef}
        className={`${panelClass} overflow-y-auto overscroll-contain rounded-xl border border-[var(--line)] bg-[var(--bg-c)] p-3 sm:p-4`}
        style={{ WebkitOverflowScrolling: "touch" }}
      />
    </div>
  );
}
