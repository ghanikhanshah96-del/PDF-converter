import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { DatabaseSetup } from "@/components/admin/DatabaseSetup";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import BlogEditorForm from "@/components/admin/blog-editor-form";
import { getAdminSession, sessionIsSuperAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  const session = await getAdminSession();
  if (!session.isLoggedIn) redirect("/admin/login");
  if (!isFirebaseAdminConfigured()) return <DatabaseSetup />;

  return (
    <AdminShell
      username={session.username}
      permissions={session.permissions}
      isSuperAdmin={sessionIsSuperAdmin(session)}
    >      <div className="mb-6">
        <p className="text-sm text-slate-500">
          Add title, content, SEO fields, and publish
        </p>
      </div>
      <BlogEditorForm mode="create" />
    </AdminShell>
  );
}
