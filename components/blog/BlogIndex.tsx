"use client";

import Link from "next/link";
import { useState } from "react";

type Article = {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
};

export function BlogIndex({ posts }: { posts: Article[] }) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(12);
  const categories = ["All", ...new Set(posts.map(post => post.category).filter(Boolean))];
  const query = search.trim().toLowerCase();
  const filtered = posts.filter(post => (category === "All" || post.category === category) &&
    `${post.title} ${post.excerpt} ${post.category}`.toLowerCase().includes(query));

  return <>
    <div className="flex flex-wrap gap-2" aria-label="Filter articles by category">
      {categories.map(item => <button key={item} type="button" aria-pressed={category === item}
        onClick={() => { setCategory(item); setVisible(12); }}
        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${category === item ? "border-[var(--brand)] bg-[var(--brand)] text-white" : "border-[var(--line)] bg-white text-[var(--ink-muted)] hover:text-[var(--brand)]"}`}>
        {item}
      </button>)}
    </div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="block sm:w-80">
        <span className="sr-only">Search articles</span>
        <input type="search" value={search} placeholder="Search articles…"
          onChange={event => { setSearch(event.target.value); setVisible(12); }}
          className="w-full rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-[var(--brand)]" />
      </label>
      <p role="status" className="text-sm text-[var(--ink-muted)]">{filtered.length} {filtered.length === 1 ? "article" : "articles"} found</p>
    </div>
    {filtered.length ? <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filtered.slice(0, visible).map(post => {
        const date = new Date(post.date);
        return <li key={post.slug}>
          <Link href={post.href} className="group flex h-full flex-col rounded-xl border border-[var(--line)] bg-white p-6 transition hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-[var(--brand)]">
            <p className="text-xs font-semibold text-[var(--ink-muted)]"><span className="text-[var(--brand)]">{post.category}</span> · {post.readTime}</p>
            <h2 className="mt-4 font-display text-xl font-semibold leading-snug text-[var(--ink)] group-hover:text-[var(--brand)]">{post.title}</h2>
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--ink-muted)]">{post.excerpt}</p>
            <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-xs">
              {Number.isFinite(date.getTime()) && <time dateTime={post.date} className="text-[var(--ink-muted)]">{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</time>}
              <span className="font-semibold text-[var(--brand)]">Read more →</span>
            </div>
          </Link>
        </li>;
      })}
    </ul> : <p className="py-16 text-center text-[var(--ink-muted)]">No articles match your search.</p>}
    {filtered.length > visible && <div className="mt-10 text-center"><button type="button" onClick={() => setVisible(count => count + 12)} className="btn btn-secondary">Load more articles</button></div>}
  </>;
}
