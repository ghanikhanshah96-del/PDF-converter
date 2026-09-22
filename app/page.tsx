import Link from "next/link";
import Image from "next/image";
import { HomeToolsFilter } from "@/components/HomeToolsFilter";

const workflowCards = [
  {
    title: "Private by design",
    text: "Use everyday PDF tools in your browser without sending core files to an upload server.",
    image: "/assets/free/local-workflow.svg",
  },
  {
    title: "Made for every screen",
    text: "Convert, compress, sign, and organize files from phones, tablets, laptops, and desktops.",
    image: "/assets/free/mobile-tools.svg",
  },
  {
    title: "Clear document workflows",
    text: "Each tool has one focused job, clear steps, and honest notes about best-use cases.",
    image: "/assets/free/team-documents.svg",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="bg-[var(--bg-a)] py-10 sm:py-14">
        <div className="site-container text-center">
          <h1 className="font-display text-[clamp(2rem,7vw,3.25rem)] font-semibold leading-tight text-[var(--ink)]">
            Fast, private PDF tools for everyday document work
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            Convert, compress, merge, split, sign, unlock, and edit PDFs with
            focused browser-based tools. No account required for core tasks.
          </p>

          <Link href="#tools" className="btn btn-primary mt-6">
            Start with a tool
          </Link>
        </div>
      </section>

      <HomeToolsFilter />

      <section className="bg-white py-16 sm:py-20">
        <div className="site-container">
          <h2 className="text-center font-display text-3xl font-semibold text-[var(--ink)]">
            Work your way
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {workflowCards.map((card) => (
              <article
                key={card.title}
                className="overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_5px_30px_rgba(22,22,22,0.08)]"
              >
                <div className="relative h-44 bg-[var(--brand-soft)] sm:h-48">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                    {card.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="site-container">
          <div className="grid overflow-hidden rounded-lg bg-[#fff2f2] md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-12">
              <h2 className="font-display text-3xl font-semibold text-[var(--ink)]">
                Finish PDF tasks with less friction
              </h2>
              <ul className="mt-6 space-y-3 text-sm text-[var(--ink-muted)]">
                <li>Focused tools for conversion, organization, signing, and security</li>
                <li>Helpful guides that explain how each tool works and when to use it</li>
                <li>Local browser processing for core workflows whenever possible</li>
              </ul>
              <a href="#tools" className="btn btn-primary mt-8">
                Start with a tool
              </a>
            </div>
            <div className="relative min-h-80 bg-[#ffd9dc]">
              <Image
                src="/assets/free/speed-privacy.svg"
                alt=""
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-center">
        <div className="site-container text-center">
          <h2 className="font-display text-3xl font-semibold text-[var(--ink)]">
            Trusted utilities for everyday documents
          </h2>
          <p className="mt-3 text-[var(--ink-muted)]">
            A focused toolkit for people who need quick PDF results without
            sending private files to a server.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs font-semibold uppercase tracking-wide text-[var(--ink-muted)]">
            <span className="rounded-full border border-[var(--line)] px-4 py-2">
              Local processing
            </span>
            <span className="rounded-full border border-[var(--line)] px-4 py-2">
              Browser tools
            </span>
            <span className="rounded-full border border-[var(--line)] px-4 py-2">
              No core upload
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
