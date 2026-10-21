"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { hasPermission, type AdminPermissionId } from "@/lib/admin-permissions";
import { AdminIcon } from "@/components/admin/AdminDialog";

const navigation = [
  { href: "/admin", label: "Overview", permission: "dashboard", icon: "grid" },
  { href: "/admin/blogs", label: "Blogs", permission: "blogs", icon: "blog" },
  { href: "/admin/reviews", label: "User reviews", permission: "reviews", icon: "star" },
  { href: "/admin/media", label: "Media library", permission: "media", icon: "image" },
  { href: "/admin/users", label: "Users & access", permission: "users", icon: "users" },
] as const;

function pageTitle(path: string) {
  if (path === "/admin") return "Overview";
  if (path.startsWith("/admin/blogs/new")) return "New post";
  if (path.includes("/edit")) return "Edit post";
  return navigation.find(item => item.href !== "/admin" && path.startsWith(item.href))?.label || "Workspace";
}

export default function AdminShell({ children, username, permissions, isSuperAdmin }: {
  children: React.ReactNode; username?: string; permissions?: AdminPermissionId[]; isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const drawer = useRef<HTMLElement>(null);
  const items = navigation.filter(item => hasPermission(permissions, item.permission, Boolean(isSuperAdmin)));
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const controls = () => Array.from(drawer.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') || []);
    controls()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key === "Tab") {
        const elements = controls();
        const first = elements[0], last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; window.removeEventListener("keydown", onKey); previousFocus?.focus(); };
  }, [mobileOpen]);
  const logout = async () => {
    setSigningOut(true); setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      router.push("/admin/login"); router.refresh();
    } catch { setError("Could not sign out. Please try again."); setSigningOut(false); }
  };
  const sidebar = <div className="flex h-full flex-col">
    <Link href="/admin" className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/[0.07] px-4" onClick={() => setMobileOpen(false)}>
      <Image src="/logo.png" alt="BestFreePDFConverter" width={36} height={36} priority className="h-9 w-9 shrink-0 rounded-lg object-contain" />
      <div><p className="text-xs font-semibold tracking-tight text-white">BestFreePDFConverter</p><p className="mt-0.5 text-[10px] text-slate-500">ADMIN WORKSPACE</p></div>
    </Link>
    <nav aria-label="Admin navigation" className="space-y-1 px-3 py-5">
      {items.map(item => {
        const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setMobileOpen(false)} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${active ? "bg-[var(--brand)] text-white shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><AdminIcon name={item.icon} className="h-[18px] w-[18px] shrink-0" />{item.label}{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/80" />}</Link>;
      })}
    </nav>
    <div className="mt-auto border-t border-white/[0.07] p-3">
      <Link href="/" target="_blank" rel="noopener noreferrer" className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"><AdminIcon name="external" />Visit website</Link>
      <div className="flex items-center gap-2.5 rounded-lg bg-white/5 p-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase text-white">{(username || "A").slice(0, 1)}</span>
        <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-200" title={username}>{username || "Admin"}</p><p className="mt-0.5 text-[10px] text-slate-500">{isSuperAdmin ? "Workspace owner" : "Team member"}</p></div>
        <button type="button" aria-label="Log out" title="Log out" disabled={signingOut} onClick={() => void logout()} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-40"><AdminIcon name="logout" /></button>
      </div>{error && <p role="alert" className="px-2 pt-2 text-xs text-red-300">{error}</p>}
    </div>
  </div>;

  return <div className="admin-portal min-h-screen bg-[#f6f7f9] text-slate-700">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 bg-[#202127] lg:block">{sidebar}</aside>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button type="button" className="absolute inset-0 bg-slate-950/50" aria-label="Close menu" tabIndex={-1} onClick={() => setMobileOpen(false)} /><aside ref={drawer} role="dialog" aria-modal="true" aria-label="Admin navigation menu" className="absolute inset-y-0 left-0 w-64 max-w-[85vw] bg-[#202127] shadow-2xl">{sidebar}<button type="button" aria-label="Close navigation" className="absolute -right-11 top-4 rounded-lg bg-white p-2 text-slate-600" onClick={() => setMobileOpen(false)}><AdminIcon name="close" /></button></aside></div>}
    <div className="lg:pl-60">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3"><button type="button" aria-label="Open menu" className="admin-btn admin-icon lg:hidden" onClick={() => setMobileOpen(true)}><AdminIcon name="menu" /></button><span className="hidden text-xs text-slate-400 sm:inline">Workspace</span><span className="hidden text-slate-300 sm:inline" aria-hidden="true">/</span><h1 className="truncate text-sm font-semibold text-slate-900">{pageTitle(pathname)}</h1></div>
        <div className="flex items-center gap-3"><Link href="/" target="_blank" rel="noopener noreferrer" className="admin-btn !text-xs"><span className="hidden sm:inline">View website</span><AdminIcon name="external" /></Link><span className="hidden h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold uppercase text-slate-600 sm:flex" title={username}>{(username || "A").slice(0, 1)}</span></div>
      </div></header>
      <main className="mx-auto w-full max-w-[1360px] px-4 py-5 sm:px-6 sm:py-6">{children}</main>
    </div>
  </div>;
}
