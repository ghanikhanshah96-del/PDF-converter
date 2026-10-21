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
  try { localStorage.setItem(PROMPT_KEY, JSON.stringify(state)); } catch { /* Optional preference storage. */ }
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
