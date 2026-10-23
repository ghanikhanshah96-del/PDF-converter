"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Article = {
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  coverImage: string;
  coverImageAlt?: string;
};

function ArticleImage({ src, alt, priority }: { src: string; alt: string; priority: boolean }) {
  const [failed, setFailed] = useState(false);
  const image = failed ? "/blog/bestfreepdfconverter-docx-to-pdf-process.svg" : src;
  const diagram = /\.svg(?:[?#]|$)/i.test(image);
  return <div className="relative aspect-[16/10] overflow-hidden border-b border-[var(--line)] bg-[var(--brand-soft)]">
    <Image src={image} alt={alt} fill unoptimized priority={priority}
      sizes="(min-width: 1024px) 352px, (min-width: 768px) 50vw, 100vw"
      onError={() => setFailed(true)}
      className={`${diagram ? "object-contain p-4" : "object-cover"} transition-transform duration-300 motion-safe:group-hover:scale-[1.03]`} />
  </div>;
}

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
      {filtered.slice(0, visible).map((post, index) => {
        const date = new Date(post.date);
        return <li key={post.slug}>
          <Link href={post.href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-sm transition duration-200 hover:border-[var(--brand)] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brand)]">
            <ArticleImage src={post.coverImage} alt={post.coverImageAlt || post.title} priority={index === 0} />
            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--ink-muted)]">
                {Number.isFinite(date.getTime()) && <><time dateTime={post.date}>{date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })}</time><span aria-hidden="true">·</span></>}
                <span className="font-semibold text-[var(--brand)]">{post.category}</span>
              </p>
              <h2 className="mt-3 font-display text-xl font-semibold leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--brand)]">{post.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--ink-muted)]">{post.excerpt}</p>
              <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand)] transition-colors group-hover:bg-[var(--brand)] group-hover:text-white">Read more <span aria-hidden="true">→</span></span>
                <span className="text-xs text-[var(--ink-muted)]">{post.readTime}</span>
              </div>
            </div>
          </Link>
        </li>;
      })}
    </ul> : <p className="py-16 text-center text-[var(--ink-muted)]">No articles match your search.</p>}
    {filtered.length > visible && <div className="mt-10 text-center"><button type="button" onClick={() => setVisible(count => count + 12)} className="btn btn-secondary">Load more articles</button></div>}
  </>;
}
