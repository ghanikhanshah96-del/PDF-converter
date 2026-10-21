import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { createReview, isFirebaseConfigured, listPublicReviews, REVIEWS_COLLECTION } from "@/lib/reviews-repo";
import { getDb } from "@/lib/firebase-admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
export async function GET() {
  try { return NextResponse.json({ reviews: await listPublicReviews() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ message: "Reviews are temporarily unavailable." }, { status: 503 }); }
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ message: "Invalid origin." }, { status: 403 });
  if (!isFirebaseConfigured()) return NextResponse.json({ message: "Reviews are temporarily unavailable. Please try again later." }, { status: 503 });
  try {
    const raw = await request.text();
    if (raw.length > 4000) return NextResponse.json({ message: "Review is too long." }, { status: 413 });
    let body;
    try { body = JSON.parse(raw); } catch { return NextResponse.json({ message: "Invalid review." }, { status: 400 }); }
    if (!body || typeof body !== "object" || !Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5 || typeof body.comment !== "string" || !body.comment.trim() || body.comment.length > 280 || typeof body.name !== "string" || body.name.length > 40 || (body.tool !== undefined && (typeof body.tool !== "string" || body.tool.length > 80))) {
      return NextResponse.json({ message: "Choose a rating and write a short review (up to 280 characters)." }, { status: 400 });
    }
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = createHash("sha256").update(`${ip}:${new Date().toISOString().slice(0,10)}`).digest("hex");
    const ref = getDb().collection("reviewSubmissionLimits").doc(key);
    const allowed = await getDb().runTransaction(async tx => {
      const doc = await tx.get(ref);
      const count = Number(doc.data()?.count || 0);
      if (count >= 5) return false;
      tx.set(ref, { count: count + 1, expiresAt: new Date(Date.now() + 86400000) });
      return true;
    });
    if (!allowed) return NextResponse.json({ message: "Too many reviews. Please try again tomorrow." }, { status: 429 });
    const { review, published } = await createReview({ name: body.name.trim() || "Anonymous user", rating: body.rating, comment: body.comment.trim(), ...(body.tool ? { tool: body.tool.trim() } : {}) });
    if (!published) {
      try {
        await sendEmail({ to: process.env.REVIEWS_TO_EMAIL || process.env.CONTACT_TO_EMAIL || undefined, subject: `PDF tool feedback: ${review.rating}/5 stars`, html: `<h2>Feedback needs attention</h2><p>${escape(review.name)} rated ${escape(review.tool || "PDF tools")} ${review.rating}/5.</p><p>${escape(review.comment)}</p><p>Saved privately as ${review.id}.</p>` });
        await getDb().collection(REVIEWS_COLLECTION).doc(review.id).update({ notificationStatus: "sent" });
      } catch {
        // The review remains saved; never ask the user to resubmit an accepted review.
        console.error("[reviews] Notification failed for", review.id);
        await getDb().collection(REVIEWS_COLLECTION).doc(review.id).update({ notificationStatus: "failed" }).catch(() => {});
      }
    }
    return NextResponse.json({ review, published }, { status: 201 });
  } catch {
    console.error("[reviews] Review submission failed");
    return NextResponse.json({ message: "We could not save your review. Please try again." }, { status: 503 });
  }
}
