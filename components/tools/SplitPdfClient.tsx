"use client";

import { useMemo, useRef, useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { parsePageRanges } from "@/lib/engines/split";
import { toolsById } from "@/lib/tools";

const tool = toolsById["split-pdf"];

export function SplitPdfClient() {
  const [range, setRange] = useState("");
  const [mode, setMode] = useState<"single" | "zip">("single");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [counting, setCounting] = useState(false);
  const request = useRef(0);

  const rangeError = useMemo(() => {
    if (pageCount == null) return null;
    try {
      parsePageRanges(range, pageCount);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : "Those pages are not in this PDF.";
    }
  }, [range, pageCount]);

  return (
    <ToolWorkspace
      accept={tool.accept}
      multiple
      processMode="each"
      title="Drop PDFs to split"
      hint="Select one or more PDF files — or click to browse"
      processLabel="Split PDF"
      onFilesChange={(files) => {
        const file = files[0];
        const id = ++request.current;
        if (!file) {
          setPageCount(null);
          setCounting(false);
          return;
        }
        setCounting(true);
        void import("@/lib/engines/split").then(async (engine) => {
          try {
            const count = await engine.getPdfPageCount(file);
            if (request.current === id) setPageCount(count);
          } catch {
            if (request.current === id) setPageCount(null);
          } finally {
            if (request.current === id) setCounting(false);
          }
        });
      }}
      validate={async () => {
        if (counting || pageCount == null) {
          throw new Error("Wait until the page count is ready, then try again.");
        }
        parsePageRanges(range, pageCount);
      }}
      options={
        <>
          <p className="text-sm font-medium">
            {counting
              ? "Counting pages…"
              : pageCount == null
                ? "Add a PDF to see how many pages it has."
                : `This PDF has ${pageCount} page${pageCount === 1 ? "" : "s"}. You can use pages 1 to ${pageCount}.`}
          </p>
          <label className="block text-sm font-medium" htmlFor="split-range">
            Which pages do you want?
          </label>
          <input
            id="split-range"
            className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder={pageCount ? `Example: 1-${Math.min(3, pageCount)}` : "Example: 1-3, 5"}
            aria-invalid={rangeError ? true : undefined}
            aria-describedby="split-range-help"
          />
          <p id="split-range-help" className="text-xs text-[var(--ink-muted)]">
            Leave this empty to use every page. Separate pages with commas, such as 1-3, 5.
          </p>
          {rangeError && (
            <p className="text-sm text-[var(--danger)]" role="alert">
              {rangeError}
            </p>
          )}
          <fieldset className="grid gap-2 sm:grid-cols-2">
            <legend className="mb-1 text-sm font-medium">How should the pages be saved?</legend>
            <button
              type="button"
              className={`rounded-xl border px-3 py-3 text-left ${
                mode === "single"
                  ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                  : "border-[var(--line)] bg-white"
              }`}
              aria-pressed={mode === "single"}
              onClick={() => setMode("single")}
            >
              <span className="block text-sm font-semibold">One PDF</span>
              <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                The pages you pick stay together in a single file.
              </span>
            </button>
            <button
              type="button"
              className={`rounded-xl border px-3 py-3 text-left ${
                mode === "zip"
                  ? "border-[var(--brand)] bg-[var(--brand-soft)]"
                  : "border-[var(--line)] bg-white"
              }`}
              aria-pressed={mode === "zip"}
              onClick={() => setMode("zip")}
            >
              <span className="block text-sm font-semibold">A separate PDF for each page</span>
              <span className="mt-1 block text-xs text-[var(--ink-muted)]">
                Each page becomes its own PDF. They download together in one ZIP.
              </span>
            </button>
          </fieldset>
        </>
      }
      onProcess={async (files, onProgress) => {
        const file = files[0];
        onProgress(15, "Loading libraries…");
        const eng = await import("@/lib/engines/split");
        const count = await eng.getPdfPageCount(file);
        parsePageRanges(range, count);
        onProgress(40, "Splitting…");
        if (mode === "zip") {
          const blob = await eng.splitPdfToZip(file, range);
          onProgress(90, "Packaging ZIP…");
          return {
            blob,
            filename: `${basename(file.name)}-pages.zip`,
          };
        }
        const { bytes } = await eng.splitPdfToSingle(file, range);
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(file.name)}-split.pdf`,
        };
      }}
    />
  );
}
