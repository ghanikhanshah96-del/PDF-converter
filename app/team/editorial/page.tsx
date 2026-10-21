import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { getPublishedBlogPosts } from "@/lib/blog-service";
export const dynamic = "force-dynamic";
const name = "BestFreePDFConverter Editorial Team";
const description = "Practical guides to converting, organizing, and working with PDF documents using BestFreePDFConverter.";
export const metadata: Metadata = { title: `${name} | Authors`, description, alternates: { canonical: `${SITE.url}/team/editorial` } };
export default async function EditorialProfile() {
  const posts = await getPublishedBlogPosts();
  const schema = { "@context": "https://schema.org", "@type": "ProfilePage", mainEntity: { "@type": "Organization", "@id": `${SITE.url}/team/editorial#team`, name, description, url: `${SITE.url}/team/editorial` } };
  return <main className="bg-[var(--bg-a)] py-10 sm:py-16"><div className="site-container max-w-5xl">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\u003c") }} />
    <Link href="/blog" className="text-sm font-semibold text-[var(--brand)]">&larr; Back to the blog</Link>
    <header className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-10">
      <div aria-hidden="true" className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-soft)] font-display text-xl font-semibold text-[var(--brand)]">PDF</div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand)]">Meet the authors</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-[var(--ink)] sm:text-4xl">{name}</h1>
      <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--ink-muted)]">PDF tasks should be easier to understand. Our website&apos;s editorial team creates guides that explain file conversion, page organization, and document workflows in everyday language.</p>
      <p className="mt-4 max-w-3xl leading-relaxed text-[var(--ink-muted)]">Our articles focus on choosing a suitable tool, following the steps, and checking the result. Formatting, file size, scanned pages, and password protection can affect what a tool can do. We explain those limits so readers can make an informed choice.</p>
    </header>
    <section className="mt-8 grid gap-6 sm:grid-cols-2">
      <div className="rounded-xl border border-[var(--line)] bg-white p-6"><h2 className="font-display text-xl font-semibold">What we cover</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--ink-muted)]"><li>PDF and Office document conversion</li><li>Merging, splitting, and organizing pages</li><li>Compression and document formatting</li><li>Browser workflows and file handling</li></ul></div>
      <div className="rounded-xl border border-[var(--line)] bg-white p-6"><h2 className="font-display text-xl font-semibold">Questions and corrections</h2><p className="mt-4 leading-relaxed text-[var(--ink-muted)]">Found an unclear step or an unexpected result? Tell us which guide you used and what happened. Please do not send confidential documents or passwords.</p><div className="mt-4 flex flex-wrap gap-4 text-[var(--brand)]"><Link href="/editorial-policy" className="underline">Editorial policy</Link><Link href="/contact-us" className="underline">Contact the team</Link></div></div>
    </section>
    <section className="mt-10"><h2 className="font-display text-2xl font-semibold">Guides from our team</h2><ul className="mt-5 grid gap-4 sm:grid-cols-2">{posts.map(post => <li key={post.slug} className="rounded-xl border border-[var(--line)] bg-white p-5"><Link href={post.href} className="font-display text-lg font-semibold text-[var(--ink)] hover:text-[var(--brand)]">{post.title}</Link><p className="mt-2 text-sm text-[var(--ink-muted)]">{post.excerpt}</p></li>)}</ul></section>
  </div></main>;
}
