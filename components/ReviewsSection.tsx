"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { UserReview } from "@/lib/reviews";

export function ReviewsSection() {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [paused, setPaused] = useState(false);
  const row = useRef<HTMLUListElement>(null);
  const interaction = useRef(false);
  const id = useId();
  useEffect(() => {
    const controller = new AbortController();
    const load = () => fetch("/api/reviews", { cache: "no-store", signal: controller.signal }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(d => setReviews(d.reviews)).catch(() => {});
    load();
    window.addEventListener("reviews-updated", load);
    return () => { controller.abort(); window.removeEventListener("reviews-updated", load); };
  }, []);
  useEffect(() => {
    if (paused || reviews.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      const el = row.current;
      if (!el || interaction.current || document.hidden) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) el.scrollLeft = 0;
      else el.scrollLeft += 1;
    }, 35);
    return () => window.clearInterval(timer);
  }, [paused, reviews.length]);
  const move = (direction: number) => {
    setPaused(true);
    row.current?.scrollBy({ left: direction * 340, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  if (!reviews.length) return null;
  return <section className="bg-white py-12 sm:py-16" aria-labelledby={`${id}-heading`} aria-roledescription="carousel">
    <div className="site-container">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id={`${id}-heading`} className="font-display text-2xl font-semibold text-[var(--ink)] sm:text-3xl">Selected user feedback</h2>
        <p className="mt-3 text-sm text-[var(--ink-muted)]">A selection of submitted reviews rated 3-5 stars. Reviews below 3 stars are saved privately for our team. This selection does not represent all feedback.</p>
      </div>
      <div className="mt-5 flex justify-center gap-2">
        <button className="btn btn-secondary" aria-label="Previous reviews" aria-controls={id} onClick={() => move(-1)}>&larr;</button>
        <button className="btn btn-secondary" aria-controls={id} onClick={() => setPaused(!paused)}>{paused ? "Play" : "Pause"} scrolling</button>
        <button className="btn btn-secondary" aria-label="Next reviews" aria-controls={id} onClick={() => move(1)}>&rarr;</button>
      </div>
      <ul id={id} ref={row} tabIndex={0} aria-label="Selected reviews; scroll to explore" className="mt-6 flex gap-4 overflow-x-auto rounded-xl pb-4 focus-visible:outline-2 focus-visible:outline-[var(--brand)]" onMouseEnter={() => { interaction.current = true; }} onMouseLeave={() => { interaction.current = false; }} onFocus={() => { interaction.current = true; }} onBlur={() => { interaction.current = false; }} onTouchStart={() => setPaused(true)} onKeyDown={e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); move(e.key === "ArrowLeft" ? -1 : 1); } }}>
        {reviews.map(review => <li key={review.id} className="w-[min(82vw,320px)] shrink-0 rounded-xl border border-[var(--line)] bg-[var(--bg-a)] p-5">
          <p aria-label={`${review.rating} out of 5 stars`} className="text-[var(--brand)]">{"\u2605".repeat(review.rating)}<span className="opacity-30" aria-hidden="true">{"\u2605".repeat(5-review.rating)}</span></p>
          <blockquote className="mt-3 break-words text-sm leading-relaxed text-[var(--ink)]">&ldquo;{review.comment}&rdquo;</blockquote>
          <p className="mt-4 break-words text-xs font-semibold text-[var(--ink-muted)]">{review.name}{review.tool ? ` / ${review.tool}` : ""}</p>
        </li>)}
      </ul>
    </div>
  </section>;
}
