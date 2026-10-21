"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  dismissReviewPrompt,
  markReviewSubmitted,
} from "@/lib/reviews";

type Props = {
  open: boolean;
  toolName?: string;
  onClose: () => void;
};

export function ReviewPrompt({ open, toolName, onClose }: Props) {
  const titleId = useId();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [keepOpen, setKeepOpen] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (!open) return;
    const el = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    el?.showModal();
    return () => { el?.close(); previous?.focus(); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setHover(0);
    setName("");
    setComment("");
    setSent(false);
    setKeepOpen(false);
    setError("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismissReviewPrompt(14);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !sent || keepOpen) return;
    const timer = window.setTimeout(onClose, 8000);
    return () => window.clearTimeout(timer);
  }, [open, sent, keepOpen, onClose]);

  if (!open) return null;

  const closeGently = () => {
    dismissReviewPrompt(14);
    onClose();
  };

  const submit = async () => {
    if (rating < 1 || !comment.trim() || busy.current) return;
    busy.current = true;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, rating, comment, tool: toolName }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Please try again.");
      markReviewSubmitted();
      window.dispatchEvent(new Event("reviews-updated"));
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not save your review. Please try again.");
    } finally { busy.current = false; setSaving(false); }
  };

  return (
    <dialog
      ref={dialog}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-transparent p-0 backdrop:bg-black/40"
      onCancel={closeGently}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => { if (e.target === e.currentTarget) closeGently(); }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2
              id={titleId}
              className="font-display text-xl font-semibold text-[var(--ink)]"
            >
              {sent ? "Thank you!" : "How did we do?"}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[var(--ink-muted)]">
              {sent
                ? "Your feedback helps us improve these free tools."
                : "If you have a moment, we would love a quick review. You can close this anytime."}
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-lg leading-none text-[var(--ink-muted)] hover:bg-[var(--bg-c)] hover:text-[var(--ink)]"
            aria-label="Close review dialog"
            onClick={closeGently}
          >
            ×
          </button>
        </div>

        {sent && <div className="mt-6 text-center" role="status" onMouseEnter={() => setKeepOpen(true)} onTouchStart={() => setKeepOpen(true)}>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-soft)] text-3xl text-[var(--brand)]" aria-hidden="true">&#10003;</div>
          <p className="mt-4 font-display text-xl font-semibold text-[var(--ink)]">Your voice makes a difference</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">Your feedback is saved. Thanks for helping us make everyday PDF tasks easier.</p>
          <p className="mt-3 text-xs text-[var(--ink-muted)]">{keepOpen ? "Close whenever you are ready." : "This message closes in a few seconds."}</p>
          <button autoFocus onKeyDown={() => setKeepOpen(true)} type="button" className="btn btn-primary mt-6 w-full" onClick={onClose}>Back to my files</button>
        </div>}
        {!sent && (
          <>
            <div
              className="mt-4 flex items-center justify-center gap-1"
              role="group"
              aria-label="Star rating"
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hover || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    className="rounded-md p-1 text-3xl leading-none transition"
                    style={{ color: active ? "#e5322d" : "#d4d4d8" }}
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                    aria-pressed={rating === star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            <label className="mt-4 block text-xs font-medium text-[var(--ink)]">
              Your name (optional)
              <input
                type="text"
                className="mt-1 w-full rounded-lg border border-[var(--line)] bg-[var(--bg-a)] px-3 py-2 text-sm"
                value={name}
                maxLength={40}
                placeholder="e.g. Alex"
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label className="mt-3 block text-xs font-medium text-[var(--ink)]">
              Your review
              <textarea
                className="mt-1 min-h-[5rem] w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--bg-a)] px-3 py-2 text-sm"
                value={comment}
                maxLength={280}
                placeholder="What worked well, or what could be better?"
                onChange={(e) => setComment(e.target.value)}
              />
            </label>

            {error && <p role="alert" className="mt-3 text-sm text-[var(--brand)]">{error}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary flex-1 !min-h-11"
                disabled={rating < 1 || !comment.trim() || saving}
                onClick={submit}
              >
                {saving ? "Saving your review..." : "Send review"}
              </button>
              <button
                type="button"
                className="btn btn-secondary flex-1 !min-h-11"
                onClick={closeGently}
              >
                Not now
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-[var(--ink-muted)]">
              By submitting, you agree that your name and review may appear publicly. Selected 3-5 star reviews are displayed; lower ratings are saved privately and emailed to our team. Please avoid personal or document details.
            </p>
          </>
        )}
      </div>
    </dialog>
  );
}
