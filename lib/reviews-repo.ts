import { randomBytes } from "crypto";
import { getDb } from "@/lib/firebase-admin";
import type { UserReview } from "@/lib/reviews";

export const REVIEWS_COLLECTION = "userReviews";
export function isFirebaseConfigured() {
  return Boolean((process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}
export async function listPublicReviews(): Promise<UserReview[]> {
  if (!isFirebaseConfigured()) return [];
  // A single-field query avoids requiring a composite index at deployment.
  const snap = await getDb().collection(REVIEWS_COLLECTION).where("published", "==", true).get();
  return snap.docs.map(doc => {
    const d = doc.data();
    return { id: doc.id, name: d.name, rating: d.rating, comment: d.comment, createdAt: d.createdAt, ...(d.tool ? { tool: d.tool } : {}) } as UserReview;
  }).filter(r => typeof r.name === "string" && typeof r.comment === "string" && Number.isInteger(r.rating) && r.rating >= 3 && r.rating <= 5)
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,40);
}
export async function createReview(input: Omit<UserReview, "id" | "createdAt">) {
  if (!isFirebaseConfigured()) throw new Error("REVIEWS_NOT_CONFIGURED");
  const review: UserReview = { ...input, id: `rv_${randomBytes(10).toString("hex")}`, createdAt: new Date().toISOString() };
  const published = review.rating >= 3;
  await getDb().collection(REVIEWS_COLLECTION).doc(review.id).set({ ...review, published, moderated: false, notificationStatus: review.rating < 3 ? "pending" : "not-required" });
  return { review, published };
}
