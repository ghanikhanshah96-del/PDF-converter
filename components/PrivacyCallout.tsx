export function PrivacyCallout({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start mt-7 gap-3 rounded-2xl border border-[rgba(215,25,32,0.2)] bg-[rgba(255,232,234,0.7)] px-4 py-3 text-sm text-[var(--ink)] ${className}`}
      role="note"
    >
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-white"
      >
        ✓
      </span>
      <p>
        <strong className="font-semibold">Files never leave your device.</strong>{" "}
        All processing runs in your browser. We do not upload, store, or scan
        your documents on a server.
      </p>
    </div>
  );
}
