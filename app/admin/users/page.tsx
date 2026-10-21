import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { DatabaseSetup } from "@/components/admin/DatabaseSetup";
import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/admin-shell";
import UsersManager from "@/components/admin/users-manager";
import { getAdminSession, sessionIsSuperAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/lib/admin-users";
import { sessionHasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  if (!session.isLoggedIn) redirect("/admin/login");
  if (!isFirebaseAdminConfigured()) return <DatabaseSetup />;
  if (!sessionHasPermission(session, "users")) redirect("/admin?denied=1");

  const users = await listAdminUsers();

  return (
    <AdminShell
      username={session.username}
      permissions={session.permissions}
      isSuperAdmin={sessionIsSuperAdmin(session)}
    >
      <UsersManager initialUsers={users} />
    </AdminShell>
  );
}
