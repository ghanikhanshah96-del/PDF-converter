export type UserReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  tool?: string;
};

const STORAGE_KEY = "bfpc-user-reviews-v1";
const PROMPT_KEY = "bfpc-review-prompt-v1";

/** Seed reviews shown publicly (4–5 stars only). */
export const SEED_REVIEWS: UserReview[] = [
  {
    id: "seed-1",
    name: "Amina K.",
    rating: 5,
    comment:
      "Merged my application PDFs in seconds. Clear steps and no account needed.",
    createdAt: "2026-09-12T10:00:00.000Z",
    tool: "Merge PDF",
  },
  {
    id: "seed-2",
    name: "Daniel R.",
    rating: 5,
    comment:
      "PDF to Word worked well for my report. I like that files stay in the browser.",
    createdAt: "2026-09-28T14:20:00.000Z",
    tool: "PDF to Word",
  },
  {
    id: "seed-3",
    name: "Sofia M.",
    rating: 4,
    comment:
      "Compress tool cut my file size enough to email. Simple and polite UI.",
    createdAt: "2026-10-05T09:15:00.000Z",
    tool: "Compress PDF",
  },
  {
    id: "seed-4",
    name: "James L.",
    rating: 5,
    comment:
      "Unlocked my own PDF and then protected it again. Exactly what I needed.",
    createdAt: "2026-10-14T16:40:00.000Z",
    tool: "Protect PDF",
  },
];

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadLocalReviews(): UserReview[] {
  if (!canUseStorage()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserReview[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalReview(review: UserReview) {
  if (!canUseStorage()) return;
  const next = [review, ...loadLocalReviews()].slice(0, 40);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

/** Public wall: seed + local reviews with rating above 3 (4 or 5). */
export function getPublicReviews(): UserReview[] {
  const local = loadLocalReviews().filter((r) => r.rating >= 4);
  const merged = [...local, ...SEED_REVIEWS];
  const seen = new Set<string>();
  return merged
    .filter((r) => {
      if (r.rating < 4) return false;
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function averagePublicRating(reviews: UserReview[]): number {
  if (!reviews.length) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

type PromptState = {
  dismissedUntil?: number;
  lastSubmittedAt?: number;
};

function loadPromptState(): PromptState {
  if (!canUseStorage()) return {};
  try {
    const raw = localStorage.getItem(PROMPT_KEY);
    return raw ? (JSON.parse(raw) as PromptState) : {};
  } catch {
    return {};
  }
}

function savePromptState(state: PromptState) {
  if (!canUseStorage()) return;
  localStorage.setItem(PROMPT_KEY, JSON.stringify(state));
}

/** True when we may politely ask for a review after a download. */
export function shouldAskForReview(): boolean {
  const state = loadPromptState();
  const now = Date.now();
  if (state.dismissedUntil && state.dismissedUntil > now) return false;
  if (state.lastSubmittedAt && now - state.lastSubmittedAt < 1000 * 60 * 60 * 24 * 30) {
    return false;
  }
  return true;
}

export function dismissReviewPrompt(days = 14) {
  const state = loadPromptState();
  state.dismissedUntil = Date.now() + days * 24 * 60 * 60 * 1000;
  savePromptState(state);
}

export function markReviewSubmitted() {
  const state = loadPromptState();
  state.lastSubmittedAt = Date.now();
  state.dismissedUntil = Date.now() + 90 * 24 * 60 * 60 * 1000;
  savePromptState(state);
}
