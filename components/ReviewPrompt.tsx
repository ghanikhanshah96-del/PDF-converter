"use client";

import { useEffect, useId, useState } from "react";
import {
  dismissReviewPrompt,
  markReviewSubmitted,
  saveLocalReview,
  type UserReview,
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

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setHover(0);
    setName("");
    setComment("");
    setSent(false);
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

  if (!open) return null;

  const closeGently = () => {
    dismissReviewPrompt(14);
    onClose();
  };

  const submit = () => {
    if (rating < 1) return;
    const review: UserReview = {
      id: `local-${Date.now()}`,
      name: name.trim() || "Happy user",
      rating,
      comment: comment.trim() || "Thanks for the free tools.",
      createdAt: new Date().toISOString(),
      tool: toolName,
    };
    saveLocalReview(review);
    markReviewSubmitted();
    setSent(true);
    window.setTimeout(() => onClose(), 1400);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={closeGently}
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
              A short note (optional)
              <textarea
                className="mt-1 min-h-[5rem] w-full resize-y rounded-lg border border-[var(--line)] bg-[var(--bg-a)] px-3 py-2 text-sm"
                value={comment}
                maxLength={280}
                placeholder="What worked well for you?"
                onChange={(e) => setComment(e.target.value)}
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-primary flex-1 !min-h-11"
                disabled={rating < 1}
                onClick={submit}
              >
                Send review
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
              Reviews with 4 or 5 stars may appear on our homepage. Thank you.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
