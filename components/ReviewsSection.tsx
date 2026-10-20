"use client";

import { useEffect, useState } from "react";
import {
  averagePublicRating,
  getPublicReviews,
  type UserReview,
} from "@/lib/reviews";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[var(--brand)]" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? "opacity-100" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<UserReview[]>([]);

  useEffect(() => {
    setReviews(getPublicReviews());
  }, []);

  if (!reviews.length) return null;

  const avg = averagePublicRating(reviews);

  return (
    <section className="bg-white py-12 sm:py-16" aria-labelledby="reviews-heading">
      <div className="site-container">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            id="reviews-heading"
            className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl"
          >
            What people say
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            Recent 4- and 5-star feedback from people who used our free PDF
            tools. We only publish reviews above 3 stars.
          </p>
          <p className="mt-3 text-sm font-semibold text-[var(--ink)]">
            <Stars rating={Math.round(avg)} />{" "}
            <span className="ml-1">
              {avg.toFixed(1)} average · {reviews.length} reviews
            </span>
          </p>
        </div>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-[var(--line)] bg-[var(--bg-a)] p-5"
            >
              <Stars rating={review.rating} />
              <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">
                “{review.comment}”
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
                {review.name}
                {review.tool ? ` · ${review.tool}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
