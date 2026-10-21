import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth";
import { listAdminReviews } from "@/lib/reviews-repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requirePermission("reviews");
  if (!gate.ok) return NextResponse.json({ error: gate.status === 401 ? "Unauthorized" : "Forbidden" }, { status: gate.status });
  try {
    return NextResponse.json({ reviews: await listAdminReviews() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Feedback could not be loaded. Please try again." }, { status: 503 });
  }
}
