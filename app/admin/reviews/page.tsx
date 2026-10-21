import { requirePagePermission, sessionIsSuperAdmin } from "@/lib/auth";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { listAdminReviews } from "@/lib/reviews-repo";
import AdminShell from "@/components/admin/admin-shell";
import { DatabaseSetup } from "@/components/admin/DatabaseSetup";
import { ReviewsManager } from "@/components/admin/ReviewsManager";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const session = await requirePagePermission("/admin/reviews");
  if (!isFirebaseAdminConfigured()) return <DatabaseSetup />;
  const reviews = await listAdminReviews();
  return <AdminShell username={session.username} permissions={session.permissions} isSuperAdmin={sessionIsSuperAdmin(session)}>
    <ReviewsManager initialReviews={reviews} />
  </AdminShell>;
}
