import AdminShell from "@/components/admin/admin-shell";
import { getAdminSession, sessionIsSuperAdmin } from "@/lib/auth";

export async function DatabaseSetup() {
  const session = await getAdminSession();
  return <AdminShell username={session.username} permissions={session.permissions} isSuperAdmin={sessionIsSuperAdmin(session)}>
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-900">
      <h1 className="text-xl font-semibold">Connect the admin database</h1>
      <p className="mt-3">Firebase web configuration is installed. Server database credentials are still required for blog management, admin users, and saving reviews.</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5">
        <li>Open Firebase Console → Project settings → Service accounts for <strong>bestfreepdfconverter-3c4b7</strong>.</li>
        <li>Generate and download a private key.</li>
        <li>Set <code>GOOGLE_APPLICATION_CREDENTIALS</code> in <code>.env.local</code> to the JSON file&apos;s absolute path using forward slashes. Alternatively, set <code>FIREBASE_CLIENT_EMAIL</code> and <code>FIREBASE_PRIVATE_KEY</code> from that file.</li>
        <li>Enable Cloud Firestore in the Firebase project if it has not been created.</li>
        <li>Restart the development server. In production, configure the server credentials in your hosting environment and redeploy.</li>
      </ol>
      <p className="mt-4 text-sm">Keep the JSON file outside the public folder and source control. Never use NEXT_PUBLIC variables for private credentials.</p>
    </section>
  </AdminShell>;
}
