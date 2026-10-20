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
  if (!sessionHasPermission(session, "users")) redirect("/admin?denied=1");

  let users: Awaited<ReturnType<typeof listAdminUsers>> = [];
  try {
    users = await listAdminUsers();
  } catch {
    users = [];
  }

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
