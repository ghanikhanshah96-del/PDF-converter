"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  title: string;
  fileName: string;
  onClose: () => void;
  toolbar: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  footerHint?: string;
  busy?: boolean;
};

/**
 * Full-viewport editor chrome using site theme tokens (.btn, --brand, --surface).
 */
export function FullscreenEditorShell({
  title,
  fileName,
  onClose,
  toolbar,
  sidebar,
  children,
  footerHint,
  busy,
}: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[var(--bg-a)]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-3 py-2 sm:px-4">
        <div className="mr-auto min-w-0">
          <p className="font-display text-sm font-semibold text-[var(--ink)]">
            {title}
          </p>
          <p className="truncate text-xs text-[var(--ink-muted)]">{fileName}</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !px-3 !py-2 text-sm"
          onClick={onClose}
          disabled={busy}
        >
          Close
        </button>
      </header>

      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--surface)] px-3 py-2 sm:px-4">
        {toolbar}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {sidebar && (
          <aside className="max-h-[40vh] shrink-0 overflow-auto border-b border-[var(--line)] bg-[var(--surface)] p-3 lg:max-h-none lg:w-72 lg:border-b-0 lg:border-r xl:w-80">
            {sidebar}
          </aside>
        )}
        <main className="min-h-0 flex-1 overflow-auto bg-[var(--bg-c)] p-3 sm:p-5">
          {children}
        </main>
      </div>

      {footerHint && (
        <footer className="shrink-0 border-t border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--ink-muted)] sm:px-4">
          {footerHint}
        </footer>
      )}
    </div>
  );
}
