"use client";

import { useState, type FormEvent } from "react";
import { ADMIN_PERMISSIONS, type AdminPermissionId } from "@/lib/admin-permissions";
import { AdminDialog, AdminIcon, AdminPagination } from "@/components/admin/AdminDialog";

export type AdminUserListItem = {
  id: string; email: string; permissions: AdminPermissionId[]; active: boolean;
  createdAt: string; updatedAt: string; invitedAt?: string;
};
const PAGE_SIZE = 10;
const defaultPermissions: AdminPermissionId[] = ["dashboard", "blogs", "media"];
const presets: Record<string, AdminPermissionId[]> = {
  editor: defaultPermissions, reviewer: ["reviews"], full: ADMIN_PERMISSIONS.map(permission => permission.id),
};
const permissionLabel = (id: AdminPermissionId) => ADMIN_PERMISSIONS.find(item => item.id === id)?.label || id;
const dateLabel = (value: string) => Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Karachi" }) : "—";

type Mode = "create" | "access" | "reset" | "remove" | null;
export default function UsersManager({ initialUsers }: { initialUsers: AdminUserListItem[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [mode, setMode] = useState<Mode>(null);
  const [selected, setSelected] = useState<AdminUserListItem | null>(null);
  const [email, setEmail] = useState("");
  const [permissions, setPermissions] = useState<AdminPermissionId[]>(defaultPermissions);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [notice, setNotice] = useState<{ text: string; password?: string; email?: string; warning?: boolean } | null>(null);
  const filtered = users.filter(user => user.email.toLowerCase().includes(search.trim().toLowerCase()));
  const page = Math.min(pageIndex, Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1));
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const preset = Object.keys(presets).find(key => presets[key].length === permissions.length && presets[key].every(id => permissions.includes(id))) || "custom";
  const openCreate = () => { setMode("create"); setEmail(""); setSelected(null); setPermissions(defaultPermissions); setDialogError(""); };
  const openAction = (action: Mode, user: AdminUserListItem) => { setSelected(user); setPermissions(user.permissions); setMode(action); setDialogError(""); };
  const toggle = (id: AdminPermissionId) => setPermissions(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);

  const refresh = async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (!response.ok) throw new Error("Users could not be refreshed. Please try again.");
      const data = await response.json(); setUsers(data.users);
    } catch (err) { setError(err instanceof Error ? err.message : "Users could not be refreshed."); }
    finally { setLoading(false); }
  };
  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!mode || busy) return;
    if ((mode === "create" || mode === "access") && !permissions.length) { setDialogError("Choose at least one permission."); return; }
    setBusy(true); setDialogError("");
    try {
      const response = await fetch(mode === "create" ? "/api/admin/users" : `/api/admin/users/${selected!.id}`, {
        method: mode === "create" ? "POST" : mode === "remove" ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        ...(mode !== "remove" ? { body: JSON.stringify(mode === "reset" ? { action: "resetPassword" } : mode === "create" ? { email, permissions } : { permissions }) } : {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The action could not be completed.");
      if (mode === "remove") setUsers(previous => previous.filter(user => user.id !== selected!.id));
      else if (mode === "create") { setUsers(previous => [data.user, ...previous]); setSearch(""); setPageIndex(0); }
      else if (data.user) setUsers(previous => previous.map(user => user.id === selected!.id ? data.user : user));
      setNotice(data.warning ? { text: data.warning, password: data.tempPassword, email: mode === "create" ? email : selected?.email, warning: true } : {
        text: mode === "create" ? `Invitation sent to ${email}.` : mode === "access" ? "User access updated." : mode === "reset" ? `New password emailed to ${selected!.email}.` : "User access removed.",
      });
      setMode(null);
    } catch (err) { setDialogError(err instanceof Error ? err.message : "The action could not be completed."); }
    finally { setBusy(false); }
  };
  const badges = (user: AdminUserListItem) => <div className="flex flex-wrap gap-1">{user.permissions.slice(0, 3).map(id => <span key={id} className="admin-pill bg-slate-100 text-slate-600">{permissionLabel(id)}</span>)}{user.permissions.length > 3 && <span title={user.permissions.slice(3).map(permissionLabel).join(", ")} className="admin-pill bg-slate-100 text-slate-500">+{user.permissions.length - 3}</span>}</div>;
  const actions = (user: AdminUserListItem) => <div className="flex items-center justify-end gap-1.5">
    <button className="admin-btn" onClick={() => openAction("access", user)} aria-label={`Edit access for ${user.email}`}><AdminIcon name="edit" /><span className="hidden xl:inline">Edit access</span></button>
    <details className="relative text-left" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.removeAttribute("open"); }}><summary className="admin-btn admin-icon list-none [&::-webkit-details-marker]:hidden" aria-label={`More actions for ${user.email}`}><AdminIcon name="more" /></summary><div className="absolute right-0 top-full z-10 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"><button className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); openAction("reset", user); }}>Reset password</button><button className="w-full rounded-md px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50" onClick={event => { event.currentTarget.closest("details")?.removeAttribute("open"); openAction("remove", user); }}>Remove user</button></div></details>
  </div>;

  return <div className="space-y-4">
    <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-950">Your team <span className="ml-1 text-sm font-normal text-slate-400">{users.length}</span></h2><p className="mt-1 text-sm text-slate-500">Invite teammates and control access to your workspace.</p></div><button type="button" className="admin-btn admin-btn-primary shrink-0" onClick={openCreate}><AdminIcon name="plus" />Add user</button></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    {notice && <div role="status" className={`rounded-lg px-3 py-2 text-sm ${notice.warning ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-800"}`}><div className="flex items-start justify-between gap-2"><p className="min-w-0 break-words py-1">{notice.text}</p><button className="admin-btn admin-icon admin-btn-quiet shrink-0" aria-label="Dismiss notification" onClick={() => setNotice(null)}><AdminIcon name="close" /></button></div>{notice.password && <div className="mt-2 space-y-2 border-t border-amber-200 pt-2"><p className="text-xs">Sign in at <a href="/admin/login" className="font-semibold underline">/admin/login</a> using <strong className="break-all">{notice.email}</strong> as the username. This account is ready; you do not need to create it again.</p><a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold underline">Open Resend domain settings</a><details><summary className="cursor-pointer text-xs font-semibold">Show temporary login password</summary><code className="mt-2 block select-all rounded-md border border-amber-200 bg-white px-3 py-2 font-mono text-sm">{notice.password}</code></details></div>}</div>}
    <div className="admin-panel">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-3"><label className="relative w-full sm:max-w-sm"><span className="sr-only">Search users</span><AdminIcon name="search" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="search" className="admin-input !pl-9" value={search} onChange={event => { setSearch(event.target.value); setPageIndex(0); }} placeholder="Search by email" /></label><button type="button" className="admin-btn admin-icon shrink-0" disabled={loading} onClick={() => void refresh()} aria-label="Refresh users" title="Refresh users"><AdminIcon name="refresh" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button></div>
      {!visible.length ? <div className="px-5 py-10 text-center"><div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50"><AdminIcon name="users" className="h-5 w-5 text-slate-400" /></div><h3 className="text-sm font-semibold text-slate-900">{users.length ? "No matching teammates" : "Build your team"}</h3><p className="mt-1 text-xs text-slate-500">{users.length ? "Try a different email address." : "Add your first teammate and choose what they can manage."}</p>{!users.length && <button className="admin-btn mt-4" onClick={openCreate}><AdminIcon name="plus" />Invite a teammate</button>}</div> : <>
        <div className="hidden md:block"><table className="admin-table table-fixed"><thead><tr><th>Team member</th><th className="w-[30%]">Access</th><th className="w-28">Added</th><th className="w-48 text-right">Actions</th></tr></thead><tbody>{visible.map(user => <tr key={user.id}><td><div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold uppercase text-[var(--brand)]">{user.email.slice(0, 2)}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-900" title={user.email}>{user.email}</p><p className="mt-0.5 text-[11px] text-slate-400">{user.active ? "Active account" : "Access disabled"}</p></div></div></td><td>{badges(user)}</td><td className="text-xs text-slate-500">{dateLabel(user.createdAt)}</td><td>{actions(user)}</td></tr>)}</tbody></table></div>
        <ul className="divide-y divide-slate-100 md:hidden">{visible.map(user => <li key={user.id} className="px-4 py-3"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{user.email}</p><p className="mt-1 text-[11px] text-slate-400">{user.active ? "Active" : "Disabled"} · {dateLabel(user.createdAt)}</p></div>{actions(user)}</div><div className="mt-2">{badges(user)}</div></li>)}</ul>
      </>}
      <AdminPagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPageIndex} />
    </div>
    <AdminDialog open={mode === "create" || mode === "access"} title={mode === "create" ? "Add user" : "Edit user access"} description={mode === "create" ? "They will receive an email with their login details." : selected?.email} busy={busy} onClose={() => setMode(null)}>
      <form onSubmit={submit}><fieldset disabled={busy} className="space-y-4 p-5">
        {mode === "create" && <label className="block"><span className="admin-label">Email address</span><input type="email" required autoComplete="email" maxLength={254} className="admin-input" placeholder="teammate@company.com" value={email} onChange={e => setEmail(e.target.value)} /><span className="mt-1.5 block text-xs text-slate-400">This email will also be their username.</span></label>}
        <label className="block"><span className="admin-label">Access preset</span><select className="admin-input" value={preset} onChange={e => { if (presets[e.target.value]) setPermissions(presets[e.target.value]); }}><option value="editor">Content editor</option><option value="reviewer">Feedback reviewer</option><option value="full">All workspace sections</option><option value="custom">Custom access</option></select></label>
        <fieldset><legend className="sr-only">Workspace permissions</legend><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-slate-700">Workspace permissions</span><button type="button" className="text-xs font-medium text-[var(--brand)]" onClick={() => setPermissions(permissions.length === ADMIN_PERMISSIONS.length ? [] : ADMIN_PERMISSIONS.map(item => item.id))}>{permissions.length === ADMIN_PERMISSIONS.length ? "Clear all" : "Select all"}</button></div><div className="grid grid-cols-2 gap-2">{ADMIN_PERMISSIONS.map(permission => <label key={permission.id} className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-3 text-sm transition ${permissions.includes(permission.id) ? "border-red-200 bg-red-50/50 text-slate-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><input type="checkbox" checked={permissions.includes(permission.id)} onChange={() => toggle(permission.id)} className="h-3.5 w-3.5 accent-[var(--brand)]" /><span>{permission.label}</span></label>)}</div></fieldset>
        <p className="text-xs leading-5 text-slate-400">You can change permissions or remove access at any time.</p>
        {dialogError && <p role="alert" className="text-sm text-red-700">{dialogError}</p>}
      </fieldset><div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3"><button type="button" className="admin-btn" disabled={busy} onClick={() => setMode(null)}>Cancel</button><button type="submit" className="admin-btn admin-btn-primary" disabled={busy || !permissions.length}>{busy ? "Saving…" : mode === "create" ? "Send invitation" : "Save access"}</button></div></form>
    </AdminDialog>
    <AdminDialog open={mode === "remove" || mode === "reset"} title={mode === "remove" ? "Remove this user?" : "Reset their password?"} description={mode === "remove" ? "They will no longer be able to sign in. Other team members will not be affected." : "A new temporary password will be emailed to this teammate. Their current password will stop working."} busy={busy} onClose={() => setMode(null)}>
      <div className="p-5"><p className="break-all text-sm font-semibold text-slate-900">{selected?.email}</p>{dialogError && <p role="alert" className="mt-3 text-sm text-red-700">{dialogError}</p>}</div><div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3"><button className="admin-btn" disabled={busy} onClick={() => setMode(null)}>Cancel</button><button className={`admin-btn ${mode === "remove" ? "admin-btn-danger" : "admin-btn-primary"}`} disabled={busy} onClick={() => void submit()}>{busy ? "Working…" : mode === "remove" ? "Remove user" : "Reset & email password"}</button></div>
    </AdminDialog>
  </div>;
}
