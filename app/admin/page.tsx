import Link from "next/link";
import AdminShell from "@/components/admin/admin-shell";
import { AdminIcon } from "@/components/admin/AdminDialog";
import { DatabaseSetup } from "@/components/admin/DatabaseSetup";
import { requirePagePermission, sessionHasPermission, sessionIsSuperAdmin } from "@/lib/auth";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { getAllAdminBlogPosts } from "@/lib/blog-service";
import { listAdminReviews } from "@/lib/reviews-repo";
import { listAdminUsers } from "@/lib/admin-users";

export const dynamic = "force-dynamic";
export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const session = await requirePagePermission("/admin");
  if (!isFirebaseAdminConfigured()) return <DatabaseSetup />;
  const denied = (await searchParams).denied;
  const canBlogs = sessionHasPermission(session, "blogs");
  const canReviews = sessionHasPermission(session, "reviews");
  const canUsers = sessionHasPermission(session, "users");
  const [posts, reviews, users] = await Promise.all([
    canBlogs ? getAllAdminBlogPosts() : [], canReviews ? listAdminReviews() : [], canUsers ? listAdminUsers() : [],
  ]);
  const privateReviews = reviews.filter(review => !review.published);
  const stats = [
    ...(canBlogs ? [{ label: "Blog posts", count: posts.length, detail: `${posts.filter(post => post.status === "published").length} published`, href: "/admin/blogs", icon: "blog" as const }] : []),
    ...(canReviews ? [{ label: "Public reviews", count: reviews.filter(review => review.published).length, detail: "Visible on the homepage", href: "/admin/reviews", icon: "star" as const }, { label: "Private feedback", count: privateReviews.length, detail: "Feedback for your team", href: "/admin/reviews", icon: "star" as const }] : []),
    ...(canUsers ? [{ label: "Team members", count: users.length, detail: "Workspace access", href: "/admin/users", icon: "users" as const }] : []),
  ];
  const shortcuts = [
    { label: "Write a post", detail: "Create a new blog article", href: "/admin/blogs/new", permission: "blogs" as const, icon: "edit" as const },
    { label: "Review feedback", detail: "Read and manage customer reviews", href: "/admin/reviews", permission: "reviews" as const, icon: "star" as const },
    { label: "Manage your team", detail: "Invite users and edit access", href: "/admin/users", permission: "users" as const, icon: "users" as const },
    { label: "Browse media", detail: "Find and upload images", href: "/admin/media", permission: "media" as const, icon: "image" as const },
  ].filter(item => sessionHasPermission(session, item.permission));

  return <AdminShell username={session.username} permissions={session.permissions} isSuperAdmin={sessionIsSuperAdmin(session)}>
    <div className="space-y-5">
      {denied && <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">You do not have access to that section. Ask your workspace owner to update your permissions.</p>}
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-950">Welcome back, {session.username || "admin"}</h2><p className="mt-1 text-sm text-slate-500">Your content, customer feedback, and team in one place.</p></div>{canBlogs && <Link href="/admin/blogs/new" className="admin-btn admin-btn-primary shrink-0"><AdminIcon name="plus" /><span className="hidden sm:inline">New post</span></Link>}</div>
      {stats.length > 0 && <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{stats.map(stat => <Link key={stat.label} href={stat.href} className="admin-panel p-4 transition hover:border-slate-300"><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-slate-500">{stat.label}</p><AdminIcon name={stat.icon} className="h-4 w-4 text-slate-400" /></div><p className="mt-2 text-2xl font-semibold text-slate-950">{stat.count}</p><p className="mt-1 text-[11px] text-slate-400">{stat.detail}</p></Link>)}</div>}
      {shortcuts.length > 0 && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{shortcuts.map(item => <Link key={item.href} href={item.href} className="admin-panel flex items-center gap-3 p-3.5 transition hover:border-red-200"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[var(--brand)]"><AdminIcon name={item.icon} /></span><div><p className="text-xs font-semibold text-slate-900">{item.label}</p><p className="mt-0.5 text-[11px] text-slate-400">{item.detail}</p></div></Link>)}</div>}
      <div className="grid items-start gap-4 xl:grid-cols-2">
        {canBlogs && <section className="admin-panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-semibold text-slate-900">Recent posts</h3><Link href="/admin/blogs" className="text-xs font-medium text-[var(--brand)]">View all →</Link></div>{posts.length ? <ul className="divide-y divide-slate-100">{posts.slice(0, 5).map(post => <li key={post.id}><Link href={`/admin/blogs/${post.id}/edit`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{post.title}</p><p className="mt-1 truncate text-xs text-slate-400">/blog/{post.slug}</p></div><span className={`admin-pill ${post.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{post.status === "published" ? "Published" : "Draft"}</span></Link></li>)}</ul> : <div className="px-4 py-7 text-center"><p className="text-sm text-slate-500">Your first article starts here.</p><Link href="/admin/blogs/new" className="admin-btn mt-3">Write a post</Link></div>}</section>}
        {canReviews && <section className="admin-panel overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h3 className="text-sm font-semibold text-slate-900">Latest private feedback</h3><Link href="/admin/reviews" className="text-xs font-medium text-[var(--brand)]">View all →</Link></div>{privateReviews.length ? <ul className="divide-y divide-slate-100">{privateReviews.slice(0, 4).map(review => <li key={review.id}><Link href="/admin/reviews" className="block px-4 py-3 hover:bg-slate-50"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-800">{review.name}</p><span className="text-xs font-semibold text-amber-600">★ {review.rating}/5</span></div><p className="mt-1 line-clamp-1 text-xs text-slate-500">{review.comment}</p></Link></li>)}</ul> : <p className="px-4 py-7 text-center text-sm text-slate-500">No private feedback to review.</p>}</section>}
      </div>
    </div>
  </AdminShell>;
}
