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
import { downloadBlob } from "@/lib/download";
import {
  assertFilesWithinLimit,
  formatBytes,
  MAX_FILE_BYTES,
  MAX_FILE_LABEL,
  MAX_FILES,
  MAX_FILES_LABEL,
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
  /** Cap on selected files (default MAX_FILES). */
  maxFiles?: number;
  /**
   * "each" — process every file separately (batch convert).
   * "all" — process the whole list once (merge / images→PDF).
   */
  processMode?: "each" | "all";
  title?: string;
  hint?: string;
  processLabel?: string;
  disabled?: boolean;
  options?: ReactNode;
  validate?: (files: File[]) => void | Promise<void>;
  onProcess: (
    files: File[],
    onProgress: (pct: number, label?: string) => void,
  ) => Promise<ProcessResult>;
  minFiles?: number;
  passwordGate?: boolean;
};

type FileEntry = {
  id: string;
  file: File;
  encrypted: boolean | null;
  password: string;
  unlocked: boolean;
  unlockError: string | null;
};

type ResultEntry = {
  id: string;
  blob: Blob;
  filename: string;
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

function fileMatchesAccept(file: File, accept: string): boolean {
  if (!accept.trim()) return true;
  const tokens = accept.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return tokens.some((token) => {
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token || name.endsWith(`.${token.split("/").pop()}`);
  });
}

function ensureExtension(name: string, fallbackExt: string): string {
  const trimmed = name.trim() || "download";
  if (/\.[a-z0-9]{2,8}$/i.test(trimmed)) return trimmed;
  const ext = fallbackExt.replace(/^\./, "");
  return ext ? `${trimmed}.${ext}` : trimmed;
}

export function ToolWorkspace({
  accept,
  multiple = false,
  maxFiles = MAX_FILES,
  processMode = "all",
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
  const batchEach = processMode === "each";
  const allowMulti = multiple || batchEach;
  const inputId = useId();
  const addMoreId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [active, setActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [results, setResults] = useState<ResultEntry[]>([]);

  const files = useMemo(() => entries.map((e) => e.file), [entries]);
  const slotsLeft = Math.max(0, maxFiles - entries.length);

  const lockedPending = useMemo(
    () => entries.filter((e) => e.encrypted === true && !e.unlocked),
    [entries],
  );
  const stillChecking = entries.some((e) => e.encrypted === null);

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
      const incoming = Array.from(list);
      setResults([]);

      if (!incoming.length) {
        setStatus("No files were selected.");
        return;
      }

      const rejectedType = incoming.filter((f) => !fileMatchesAccept(f, accept));
      const oversized = incoming.filter(
        (f) => fileMatchesAccept(f, accept) && f.size > MAX_FILE_BYTES,
      );
      const allowed = incoming.filter(
        (f) => fileMatchesAccept(f, accept) && f.size <= MAX_FILE_BYTES,
      );

      const messages: string[] = [];
      if (rejectedType.length) {
        messages.push(
          rejectedType.length === 1
            ? `"${rejectedType[0].name}" is not a supported file type for this tool.`
            : `${rejectedType.length} files were skipped (unsupported type).`,
        );
      }
      if (oversized.length) {
        const first = oversized[0];
        messages.push(
          `"${first.name}" is ${formatBytes(first.size)}. Maximum size is ${MAX_FILE_LABEL}.`,
        );
      }

      setEntries((prev) => {
        const room = allowMulti ? Math.max(0, maxFiles - prev.length) : 1;
        if (room <= 0) {
          queueMicrotask(() => {
            setError(
              [...messages, `You already selected the maximum of ${maxFiles} files.`].join(
                " ",
              ),
            );
            setStatus(null);
          });
          return prev;
        }

        const toAdd = allowed.slice(0, room);
        if (allowed.length > room) {
          messages.push(
            `Only ${room} more file${room === 1 ? "" : "s"} can be added (max ${maxFiles}).`,
          );
        }

        if (!toAdd.length) {
          queueMicrotask(() => {
            setError(messages.join(" ") || "No valid files to add.");
            setStatus(null);
          });
          return prev;
        }

        const newEntries: FileEntry[] = toAdd.map((file) => ({
          id: makeId(),
          file,
          encrypted: gateEnabled && isPdfFile(file) ? null : false,
          password: "",
          unlocked: !(gateEnabled && isPdfFile(file)),
          unlockError: null,
        }));

        queueMicrotask(() => {
          setError(messages.length ? messages.join(" ") : null);
          setStatus(
            toAdd.length === 1
              ? `Added “${toAdd[0].name}”.`
              : `Added ${toAdd.length} files.`,
          );
        });

        return allowMulti ? [...prev, ...newEntries] : newEntries.slice(0, 1);
      });
    },
    [accept, allowMulti, gateEnabled, maxFiles],
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
    setEntries((prev) => {
      const removed = prev[index];
      const next = prev.filter((_, i) => i !== index);
      setStatus(removed ? `Removed “${removed.file.name}”.` : null);
      return next;
    });
    setResults([]);
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
      setStatus(`Unlocked “${entry.file.name}”.`);
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
    setResults([]);
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
      setStatus(null);
      await waitForPaint();

      const processFiles = await resolveFilesForProcess((pct, label) => {
        setProgress(Math.max(0, Math.min(100, pct)));
        if (label) setProgressLabel(label);
      });

      if (validate) await validate(processFiles);

      const collected: ResultEntry[] = [];

      if (batchEach) {
        for (let i = 0; i < processFiles.length; i++) {
          const file = processFiles[i];
          const base = 20 + Math.round((i / processFiles.length) * 75);
          setProgress(base);
          setProgressLabel(`Processing ${file.name} (${i + 1}/${processFiles.length})…`);
          await waitForPaint();
          const out = await onProcess([file], (pct, label) => {
            const mapped =
              base + Math.round((pct / 100) * (75 / processFiles.length));
            setProgress(Math.max(0, Math.min(99, mapped)));
            if (label) setProgressLabel(`${file.name}: ${label}`);
          });
          collected.push({
            id: makeId(),
            blob: out.blob,
            filename: out.filename,
          });
        }
      } else {
        setProgress(25);
        setProgressLabel("Loading libraries…");
        await waitForPaint();
        const out = await onProcess(processFiles, (pct, label) => {
          const mapped = 25 + Math.round((pct / 100) * 75);
          setProgress(Math.max(0, Math.min(100, mapped)));
          if (label) setProgressLabel(label);
        });
        collected.push({
          id: makeId(),
          blob: out.blob,
          filename: out.filename,
        });
      }

      setProgress(100);
      setProgressLabel("Done");
      setResults(collected);
      setStatus(
        collected.length === 1
          ? `Ready: ${collected[0].filename}`
          : `${collected.length} files ready to download.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setProgress(0);
      setProgressLabel("");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  };

  const updateResultName = (id: string, filename: string) => {
    setResults((prev) =>
      prev.map((r) => (r.id === id ? { ...r, filename } : r)),
    );
  };

  const removeResult = (id: string) => {
    setResults((prev) => {
      const next = prev.filter((r) => r.id !== id);
      setStatus(
        next.length
          ? `${next.length} download${next.length === 1 ? "" : "s"} remaining.`
          : "All downloads cleared.",
      );
      return next;
    });
  };

  const downloadOne = (result: ResultEntry) => {
    const ext =
      result.filename.match(/(\.[a-z0-9]{2,8})$/i)?.[1] ||
      (result.blob.type.includes("pdf")
        ? ".pdf"
        : result.blob.type.includes("word")
          ? ".docx"
          : "");
    downloadBlob(result.blob, ensureExtension(result.filename, ext));
    setStatus(`Downloaded “${ensureExtension(result.filename, ext)}”.`);
  };

  const downloadAll = () => {
    results.forEach((r, i) => {
      window.setTimeout(() => downloadOne(r), i * 180);
    });
    setStatus(
      results.length === 1
        ? "Download started."
        : `Starting ${results.length} downloads…`,
    );
  };

  const canProcess =
    !busy &&
    !disabled &&
    entries.length >= minFiles &&
    !stillChecking &&
    lockedPending.every((e) => e.password.trim().length > 0);

  const showDropzone = entries.length === 0;

  return (
    <div className="surface p-4 sm:p-6">
      {showDropzone ? (
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
            Max {MAX_FILE_LABEL} per file
            {allowMulti ? ` · up to ${MAX_FILES_LABEL}` : ""}
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            className="sr-only"
            accept={accept}
            multiple={allowMulti}
            disabled={busy || disabled}
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-a)] px-4 py-3">
          <p className="text-sm text-[var(--ink)]">
            <strong>{entries.length}</strong> file
            {entries.length === 1 ? "" : "s"} selected
            {allowMulti && slotsLeft > 0
              ? ` · ${slotsLeft} more can be added`
              : allowMulti
                ? " · limit reached"
                : ""}
          </p>
          {allowMulti && slotsLeft > 0 && (
            <label
              htmlFor={addMoreId}
              className="btn btn-secondary !min-h-10 cursor-pointer !px-4 !py-2 text-sm"
            >
              Add more files
              <input
                id={addMoreId}
                type="file"
                className="sr-only"
                accept={accept}
                multiple
                disabled={busy || disabled}
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
      )}

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
                {allowMulti && (
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
                  Delete
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

      {status && !error && (
        <p
          className="mt-4 rounded-xl bg-[var(--brand-soft)] px-3 py-2 text-sm text-[var(--brand-deep)]"
          role="status"
        >
          {status}
        </p>
      )}

      {error && (
        <p
          className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-[var(--danger)]"
          role="alert"
        >
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-base font-semibold text-[var(--ink)]">
              Downloads
            </h3>
            {results.length > 1 && (
              <button
                type="button"
                className="btn btn-primary !min-h-10 !px-4 !py-2 text-sm"
                onClick={downloadAll}
              >
                Download all ({results.length})
              </button>
            )}
          </div>
          <ul className="space-y-2" aria-label="Ready downloads">
            {results.map((result) => (
              <li
                key={result.id}
                className="flex flex-col gap-2 rounded-xl border border-[var(--line)] bg-white px-3 py-3 sm:flex-row sm:items-center"
              >
                <label className="min-w-0 flex-1 text-xs font-medium text-[var(--ink-muted)]">
                  File name
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--bg-a)] px-3 py-2 text-sm font-medium text-[var(--ink)]"
                    value={result.filename}
                    onChange={(e) =>
                      updateResultName(result.id, e.target.value)
                    }
                    aria-label="Edit download file name"
                  />
                </label>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-primary !min-h-10 !px-4 !py-2 text-sm"
                    onClick={() => downloadOne(result)}
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary !min-h-10 !px-4 !py-2 text-sm text-[var(--danger)]"
                    onClick={() => removeResult(result.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {results.length === 1 && (
            <button
              type="button"
              className="btn btn-primary w-full sm:w-auto"
              onClick={downloadAll}
            >
              Download {results[0].filename}
            </button>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
        {results.length === 0 && (
          <button
            type="button"
            className="btn btn-primary w-full sm:w-auto"
            onClick={run}
            disabled={!canProcess}
          >
            {busy ? "Working…" : processLabel}
          </button>
        )}
        {results.length > 0 && (
          <button
            type="button"
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => {
              setResults([]);
              setProgress(0);
              setProgressLabel("");
              setStatus("Ready to process again.");
            }}
            disabled={busy}
          >
            Process again
          </button>
        )}
        {entries.length > 0 && !busy && (
          <button
            type="button"
            className="btn btn-secondary w-full sm:w-auto"
            onClick={() => {
              setEntries([]);
              setResults([]);
              setError(null);
              setStatus(null);
              setProgress(0);
              setProgressLabel("");
            }}
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
