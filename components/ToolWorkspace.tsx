"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { downloadBlob, basename } from "@/lib/download";
import {
  assertFilesWithinLimit,
  formatBytes,
  MAX_FILE_BYTES,
  MAX_FILE_LABEL,
} from "@/lib/limits";
import {
  isPdfEncrypted,
  isPdfFile,
  unlockPdfBytes,
  unlockedPdfFile,
} from "@/lib/pdf-encryption";

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
  /**
   * When true (default for PDF accept), detect locked PDFs and ask for
   * passwords before processing — same behavior as iLovePDF.
   */
  passwordGate?: boolean;
};

type FileEntry = {
  id: string;
  file: File;
  /** null while checking */
  encrypted: boolean | null;
  password: string;
  unlocked: boolean;
  unlockError: string | null;
};

function waitForPaint() {
  if (typeof window === "undefined") return Promise.resolve();

  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.setTimeout(resolve, 0);
    });
  });
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function acceptLooksLikePdf(accept: string): boolean {
  const a = accept.toLowerCase();
  return a.includes("pdf") || a.includes(".pdf");
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
  passwordGate,
}: ToolWorkspaceProps) {
  const gateEnabled = passwordGate ?? acceptLooksLikePdf(accept);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessResult | null>(null);

  const files = useMemo(() => entries.map((e) => e.file), [entries]);

  const fileLabel = useMemo(() => {
    if (!entries.length) return null;
    if (entries.length === 1) return entries[0].file.name;
    return `${entries.length} files selected`;
  }, [entries]);

  const lockedPending = useMemo(
    () =>
      entries.filter(
        (e) => e.encrypted === true && !e.unlocked,
      ),
    [entries],
  );

  const stillChecking = entries.some((e) => e.encrypted === null);

  // Detect encryption for newly added PDFs
  useEffect(() => {
    if (!gateEnabled) return;
    let cancelled = false;

    (async () => {
      const pending = entries.filter(
        (e) => e.encrypted === null && isPdfFile(e.file),
      );
      if (!pending.length) return;

      for (const entry of pending) {
        try {
          const encrypted = await isPdfEncrypted(entry.file);
          if (cancelled) return;
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id
                ? {
                    ...e,
                    encrypted,
                    unlocked: encrypted ? false : true,
                    unlockError: null,
                  }
                : e,
            ),
          );
        } catch {
          if (cancelled) return;
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entry.id
                ? { ...e, encrypted: false, unlocked: true, unlockError: null }
                : e,
            ),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entries, gateEnabled]);

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const next = Array.from(list);
      setResult(null);

      const oversized = next.filter((f) => f.size > MAX_FILE_BYTES);
      if (oversized.length) {
        const first = oversized[0];
        setError(
          `"${first.name}" is ${formatBytes(first.size)}. Maximum file size is ${MAX_FILE_LABEL}. Please choose a smaller file or compress it first.`,
        );
      } else {
        setError(null);
      }

      const allowed = next.filter((f) => f.size <= MAX_FILE_BYTES);
      if (!allowed.length) return;

      const newEntries: FileEntry[] = allowed.map((file) => ({
        id: makeId(),
        file,
        encrypted: gateEnabled && isPdfFile(file) ? null : false,
        password: "",
        unlocked: !(gateEnabled && isPdfFile(file)),
        unlockError: null,
      }));

      setEntries((prev) =>
        multiple ? [...prev, ...newEntries] : newEntries.slice(0, 1),
      );
    },
    [multiple, gateEnabled],
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
    setEntries((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeFile = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const setPassword = (id: string, password: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, password, unlocked: false, unlockError: null }
          : e,
      ),
    );
  };

  const tryUnlock = async (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;
    try {
      await unlockPdfBytes(entry.file, entry.password);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, unlocked: true, unlockError: null } : e,
        ),
      );
    } catch (err) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? {
                ...e,
                unlocked: false,
                unlockError:
                  err instanceof Error ? err.message : "Incorrect password.",
              }
            : e,
        ),
      );
    }
  };

  const resolveFilesForProcess = async (
    onProgress: (pct: number, label?: string) => void,
  ): Promise<File[]> => {
    if (!gateEnabled) return files;

    const out: File[] = [];
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry.encrypted) {
        out.push(entry.file);
        continue;
      }
      if (!entry.password.trim()) {
        throw new Error(
          `"${entry.file.name}" is password-protected. Enter the password to continue.`,
        );
      }
      onProgress(
        10 + Math.round((i / Math.max(entries.length, 1)) * 20),
        `Unlocking ${entry.file.name}…`,
      );
      const bytes = await unlockPdfBytes(entry.file, entry.password);
      out.push(unlockedPdfFile(entry.file, bytes));
    }
    return out;
  };

  const run = async () => {
    setError(null);
    setResult(null);
    if (entries.length < minFiles) {
      setError(
        minFiles > 1
          ? `Add at least ${minFiles} files.`
          : "Choose a file to continue.",
      );
      return;
    }
    if (stillChecking) {
      setError("Still checking file security. Please wait a moment.");
      return;
    }
    if (lockedPending.some((e) => !e.password.trim())) {
      setError(
        "One or more PDFs are password-protected. Enter each password to continue.",
      );
      return;
    }
    try {
      assertFilesWithinLimit(files);
      setBusy(true);
      setProgress(5);
      setProgressLabel("Preparing…");
      await waitForPaint();

      const processFiles = await resolveFilesForProcess((pct, label) => {
        setProgress(Math.max(0, Math.min(100, pct)));
        if (label) setProgressLabel(label);
      });

      if (validate) await validate(processFiles);
      setProgress(25);
      setProgressLabel("Loading libraries…");
      await waitForPaint();
      const out = await onProcess(processFiles, (pct, label) => {
        // Map tool progress into 25–100 range
        const mapped = 25 + Math.round((pct / 100) * 75);
        setProgress(Math.max(0, Math.min(100, mapped)));
        if (label) setProgressLabel(label);
      });
      setProgress(100);
      setProgressLabel("Done");
      setResult(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setProgress(0);
      setProgressLabel("");
    } finally {
      setBusy(false);
    }
  };

  const canProcess =
    !busy &&
    !disabled &&
    entries.length >= minFiles &&
    !stillChecking &&
    lockedPending.every((e) => e.password.trim().length > 0);

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
        <span className="mt-2 text-xs text-[var(--ink-muted)]">
          Max file size: {MAX_FILE_LABEL} per file
        </span>
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

      {entries.length > 0 && (
        <ul className="mt-4 space-y-2" aria-label="Selected files">
          {entries.map((entry, index) => (
            <li
              key={entry.id}
              className="rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <span className="min-w-0 flex-[1_1_12rem] truncate font-medium">
                  {entry.file.name}
                </span>
                {entry.encrypted === null && (
                  <span className="shrink-0 text-xs text-[var(--ink-muted)]">
                    Checking…
                  </span>
                )}
                {entry.encrypted === true && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      entry.unlocked
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {entry.unlocked ? "Unlocked" : "Locked"}
                  </span>
                )}
                <span className="shrink-0 text-xs text-[var(--ink-muted)]">
                  {formatBytes(entry.file.size)}
                </span>
                {multiple && (
                  <>
                    <button
                      type="button"
                      className="min-h-9 rounded-md px-3 py-1 hover:bg-[var(--brand-soft)]"
                      aria-label={`Move ${entry.file.name} up`}
                      onClick={() => moveFile(index, -1)}
                      disabled={busy || index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="min-h-9 rounded-md px-3 py-1 hover:bg-[var(--brand-soft)]"
                      aria-label={`Move ${entry.file.name} down`}
                      onClick={() => moveFile(index, 1)}
                      disabled={busy || index === entries.length - 1}
                    >
                      ↓
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="min-h-9 rounded-md px-3 py-1 text-[var(--danger)] hover:bg-red-50"
                  aria-label={`Remove ${entry.file.name}`}
                  onClick={() => removeFile(index)}
                  disabled={busy}
                >
                  ✕
                </button>
              </div>

              {entry.encrypted === true && !entry.unlocked && (
                <div className="mt-2 flex flex-wrap items-end gap-2 border-t border-[var(--line)] pt-2">
                  <label className="min-w-[12rem] flex-1 text-xs font-medium text-[var(--ink)]">
                    Password required to open this PDF
                    <input
                      type="password"
                      autoComplete="off"
                      className="mt-1 w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-sm"
                      placeholder="Enter PDF password"
                      value={entry.password}
                      disabled={busy}
                      onChange={(e) => setPassword(entry.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void tryUnlock(entry.id);
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-secondary !py-2 text-sm"
                    disabled={busy || !entry.password.trim()}
                    onClick={() => void tryUnlock(entry.id)}
                  >
                    Unlock
                  </button>
                  {entry.unlockError && (
                    <p className="w-full text-xs text-[var(--danger)]" role="alert">
                      {entry.unlockError}
                    </p>
                  )}
                </div>
              )}
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
        <p
          className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
        {!result && (
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            onClick={run}
            disabled={!canProcess}
          >
            {busy ? "Working…" : processLabel}
          </button>
        )}
        {result && (
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            onClick={() => downloadBlob(result.blob, result.filename)}
          >
            Download {result.filename}
          </button>
        )}
        {entries.length > 0 && !busy && (
          <button
            type="button"
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => {
              setEntries([]);
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
          {files[0] ? ` (from ${basename(files[0].name)})` : ""}. Click Download
          to save the file.
        </p>
      )}
    </div>
  );
}
