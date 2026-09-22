"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { downloadBlob, basename } from "@/lib/download";

export type ProcessResult = {
  blob: Blob;
  filename: string;
};

export type ToolWorkspaceProps = {
  accept: string;
  multiple?: boolean;
  title?: string;
  hint?: string;
  processLabel?: string;
  disabled?: boolean;
  /** Extra controls rendered between file list and action buttons */
  options?: ReactNode;
  /** Validate/prepare before process; throw Error to show message */
  validate?: (files: File[]) => void | Promise<void>;
  /** Heavy work — dynamically import engines inside this callback */
  onProcess: (
    files: File[],
    onProgress: (pct: number, label?: string) => void,
  ) => Promise<ProcessResult>;
  minFiles?: number;
};

function waitForPaint() {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.setTimeout(resolve, 0);
    });
  });
}

export function ToolWorkspace({
  accept,
  multiple = false,
  title = "Drop files here",
  hint = "or click to browse",
  processLabel = "Process",
  disabled = false,
  options,
  validate,
  onProcess,
  minFiles = 1,
}: ToolWorkspaceProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const fileLabel = useMemo(() => {
    if (!files.length) return null;
    if (files.length === 1) return files[0].name;
    return `${files.length} files selected`;
  }, [files]);

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const next = Array.from(list);
      setError(null);
      setResult(null);
      setFiles((prev) => (multiple ? [...prev, ...next] : next.slice(0, 1)));
    },
    [multiple],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setActive(false);
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const run = async () => {
    setError(null);
    setResult(null);
    if (files.length < minFiles) {
      setError(
        minFiles > 1
          ? `Add at least ${minFiles} files.`
          : "Choose a file to continue.",
      );
      return;
    }
    try {
      if (validate) await validate(files);
      setBusy(true);
      setProgress(8);
      setProgressLabel("Loading libraries…");
      await waitForPaint();
      const out = await onProcess(files, (pct, label) => {
        setProgress(Math.max(0, Math.min(100, pct)));
        if (label) setProgressLabel(label);
      });
      setProgress(100);
      setProgressLabel("Done");
      setResult(out);
      downloadBlob(out.blob, out.filename);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setProgress(0);
      setProgressLabel("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="surface p-4 sm:p-6">
      <label
        htmlFor={inputId}
        className="dropzone flex cursor-pointer flex-col items-center justify-center px-4 py-8 text-center sm:py-14"
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
        onDrop={onDrop}
      >
          <span className="font-display text-base font-semibold text-[var(--ink)] sm:text-lg">
            {title}
          </span>
        <span className="mt-1 text-sm text-[var(--ink-muted)]">{hint}</span>
        {fileLabel && (
          <span className="mt-3 max-w-full truncate rounded-full bg-[var(--brand-soft)] px-3 py-1 text-sm font-medium text-[var(--brand-deep)]">
            {fileLabel}
          </span>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={busy || disabled}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2" aria-label="Selected files">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm sm:flex-nowrap"
            >
              <span className="min-w-0 flex-[1_1_12rem] truncate font-medium">
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-[var(--ink-muted)]">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              {multiple && (
                <>
                  <button
                    type="button"
                    className="min-h-9 rounded-md px-3 py-1 hover:bg-[var(--brand-soft)]"
                    aria-label={`Move ${file.name} up`}
                    onClick={() => moveFile(index, -1)}
                    disabled={busy || index === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="min-h-9 rounded-md px-3 py-1 hover:bg-[var(--brand-soft)]"
                    aria-label={`Move ${file.name} down`}
                    onClick={() => moveFile(index, 1)}
                    disabled={busy || index === files.length - 1}
                  >
                    ↓
                  </button>
                </>
              )}
              <button
                type="button"
                className="min-h-9 rounded-md px-3 py-1 text-[var(--danger)] hover:bg-red-50"
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
                disabled={busy}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {options && <div className="mt-4 space-y-3">{options}</div>}

      {(busy || progress > 0) && (
        <div className="mt-4" aria-live="polite">
          <div className="mb-1 flex justify-between text-xs text-[var(--ink-muted)]">
            <span className="min-w-0 truncate pr-3">
              {progressLabel || (busy ? "Working…" : "Ready")}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar" data-busy={busy}>
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
        <button
          type="button"
          className="btn btn-primary w-full sm:w-auto"
          onClick={run}
          disabled={busy || disabled || files.length < minFiles}
        >
          {busy ? "Working…" : processLabel}
        </button>
        {result && (
          <button
            type="button"
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => downloadBlob(result.blob, result.filename)}
          >
            Download again
          </button>
        )}
        {files.length > 0 && !busy && (
          <button
            type="button"
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => {
              setFiles([]);
              setResult(null);
              setError(null);
              setProgress(0);
              setProgressLabel("");
            }}
          >
            Clear
          </button>
        )}
      </div>

      {result && (
        <p className="mt-3 text-sm text-[var(--brand-deep)]">
          Ready: <strong>{result.filename}</strong>
          {files[0] ? ` (from ${basename(files[0].name)})` : ""}
        </p>
      )}
    </div>
  );
}
