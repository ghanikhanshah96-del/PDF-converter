import type { ToolPageSection } from "@/lib/content/types";
import type { SeoSkin, ToolLayout } from "@/lib/content/toolLayouts";

/** Reorder sections for structural uniqueness — never drops content. */
export function orderSeoSections(
  sections: ToolPageSection[],
  order: ToolLayout["seoOrder"],
): ToolPageSection[] {
  if (order === "as-is" || sections.length < 2) return sections;

  const cta = sections.filter((s) => s.type === "cta");
  const prose = sections.filter((s) => s.type === "prose");
  const cards = sections.filter((s) => s.type === "cards");
  const bullets = sections.filter((s) => s.type === "bullets");
  const steps = sections.filter((s) => s.type === "steps");
  const rest = sections.filter(
    (s) => !["cta", "prose", "cards", "bullets", "steps"].includes(s.type),
  );

  switch (order) {
    case "prose-first":
      return [...prose, ...bullets, ...cards, ...steps, ...rest, ...cta];
    case "cards-first":
      return [...cards, ...steps, ...bullets, ...prose, ...rest, ...cta];
    case "cta-early": {
      const body = sections.filter((s) => s.type !== "cta");
      const mid = Math.max(1, Math.floor(body.length / 3));
      return [...body.slice(0, mid), ...cta, ...body.slice(mid)];
    }
    case "interleave": {
      const pools = [prose, cards, bullets, steps];
      const out: ToolPageSection[] = [];
      let added = true;
      let i = 0;
      while (added) {
        added = false;
        for (const pool of pools) {
          if (pool[i]) {
            out.push(pool[i]);
            added = true;
          }
        }
        i += 1;
      }
      return [...out, ...rest, ...cta];
    }
    default:
      return sections;
  }
}

function proseBlock(
  section: Extract<ToolPageSection, { type: "prose" }>,
  skin: SeoSkin,
) {
  if (skin === "magazine") {
    return (
      <section
        key={section.heading}
        className="rounded-2xl border border-[var(--line)] bg-white px-5 py-6 sm:px-8"
      >
        <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
          {section.heading}
        </h2>
        <div className="mt-4 max-w-3xl space-y-4 text-base leading-relaxed text-[var(--ink-muted)]">
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
      </section>
    );
  }

  if (skin === "dense-editorial") {
    return (
      <section
        key={section.heading}
        className="border-l-4 border-[var(--brand)] pl-4 sm:pl-6"
      >
        <h2 className="font-display text-lg font-bold uppercase tracking-wide sm:text-xl">
          {section.heading}
        </h2>
        <div className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
      </section>
    );
  }

  if (skin === "banded") {
    return (
      <section
        key={section.heading}
        className="rounded-xl bg-[var(--bg-a)] px-5 py-6"
      >
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          {section.heading}
        </h2>
        <div className="mt-3 columns-1 gap-6 space-y-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:columns-2 sm:text-base">
          {section.paragraphs.map((p) => (
            <p key={p.slice(0, 48)} className="break-inside-avoid">
              {p}
            </p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section key={section.heading}>
      <h2 className="font-display text-xl font-bold sm:text-2xl">
        {section.heading}
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
        {section.paragraphs.map((p) => (
          <p key={p.slice(0, 48)}>{p}</p>
        ))}
      </div>
    </section>
  );
}

function stepsBlock(
  section: Extract<ToolPageSection, { type: "steps" }>,
  skin: SeoSkin,
) {
  if (skin === "feature-spotlight" || skin === "split-rhythm") {
    return (
      <section key={section.heading}>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          {section.heading}
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {section.steps.map((step, i) => (
            <div
              key={step}
              className="rounded-2xl border border-[var(--line)] bg-[var(--brand-soft)] p-4"
            >
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--brand)]">
                Step {i + 1}
              </p>
              <p className="mt-2 text-sm leading-relaxed sm:text-base">{step}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section key={section.heading}>
      <h2 className="font-display text-xl font-bold sm:text-2xl">
        {section.heading}
      </h2>
      <ol className="mt-4 space-y-3">
        {section.steps.map((step, i) => (
          <li
            key={step}
            className="flex gap-3 rounded-xl border border-[var(--line)] bg-white/70 px-4 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5 text-sm leading-relaxed sm:text-base">
              {step}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function cardsBlock(
  section: Extract<ToolPageSection, { type: "cards" }>,
  skin: SeoSkin,
) {
  if (skin === "card-stack") {
    return (
      <section key={section.heading}>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          {section.heading}
        </h2>
        {section.intro && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            {section.intro}
          </p>
        )}
        <div className="mt-4 space-y-3">
          {section.items.map((item, i) => (
            <article
              key={item.title}
              className={`rounded-xl border border-[var(--line)] p-4 sm:p-5 ${
                i % 2 === 0 ? "bg-white" : "bg-[var(--bg-a)]"
              }`}
            >
              <h3 className="font-display text-base font-semibold sm:text-lg">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (skin === "feature-spotlight") {
    return (
      <section key={section.heading}>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          {section.heading}
        </h2>
        {section.intro && (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            {section.intro}
          </p>
        )}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {section.items.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl bg-[var(--ink)] p-5 text-white"
            >
              <h3 className="font-display text-base font-semibold">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (skin === "split-rhythm") {
    return (
      <section key={section.heading}>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          {section.heading}
        </h2>
        {section.intro && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            {section.intro}
          </p>
        )}
        <div className="mt-4 grid gap-4">
          {section.items.map((item, i) => (
            <article
              key={item.title}
              className={`grid gap-2 rounded-xl border border-[var(--line)] p-4 sm:grid-cols-[11rem_1fr] sm:gap-6 sm:p-5 ${
                i % 2 ? "bg-[var(--brand-soft)]" : "bg-white"
              }`}
            >
              <h3 className="font-display text-base font-semibold text-[var(--brand-deep)]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--ink-muted)]">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const cols =
    skin === "magazine"
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : skin === "dense-editorial"
        ? "sm:grid-cols-1"
        : "sm:grid-cols-2";

  return (
    <section key={section.heading}>
      <h2 className="font-display text-xl font-bold sm:text-2xl">
        {section.heading}
      </h2>
      {section.intro && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
          {section.intro}
        </p>
      )}
      <div className={`mt-4 grid gap-3 ${cols}`}>
        {section.items.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-[var(--line)] bg-white/80 p-4"
          >
            <h3 className="font-display text-base font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-muted)]">
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function bulletsBlock(
  section: Extract<ToolPageSection, { type: "bullets" }>,
  skin: SeoSkin,
) {
  if (skin === "magazine" || skin === "feature-spotlight") {
    return (
      <section key={section.heading}>
        <h2 className="font-display text-xl font-bold sm:text-2xl">
          {section.heading}
        </h2>
        {section.intro && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            {section.intro}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {section.items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]"
            >
              {item}
            </span>
          ))}
        </div>
      </section>
    );
  }

  if (skin === "split-rhythm") {
    return (
      <section
        key={section.heading}
        className="grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--bg-a)] p-5 md:grid-cols-[1fr_1.2fr]"
      >
        <div>
          <h2 className="font-display text-xl font-bold sm:text-2xl">
            {section.heading}
          </h2>
          {section.intro && (
            <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)]">
              {section.intro}
            </p>
          )}
        </div>
        <ul className="space-y-2 text-sm leading-relaxed text-[var(--ink-muted)]">
          {section.items.map((item) => (
            <li
              key={item}
              className="rounded-lg border border-[var(--line)] bg-white px-3 py-2"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section key={section.heading}>
      <h2 className="font-display text-xl font-bold sm:text-2xl">
        {section.heading}
      </h2>
      {section.intro && (
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
          {section.intro}
        </p>
      )}
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
        {section.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function ctaBlock(section: Extract<ToolPageSection, { type: "cta" }>, skin: SeoSkin) {
  const dark = skin === "feature-spotlight" || skin === "dense-editorial";
  return (
    <section
      key={section.heading}
      className={`rounded-2xl px-5 py-6 sm:px-8 ${
        dark
          ? "bg-[var(--ink)]"
          : "border border-[var(--line)] bg-[var(--brand-soft)]"
      }`}
    >
      <h2
        className={`font-display text-xl font-bold sm:text-2xl ${
          dark ? "text-white" : "text-[var(--ink)]"
        }`}
      >
        {section.heading}
      </h2>
      <p
        className={`mt-2 text-sm leading-relaxed sm:text-base ${
          dark ? "text-white/80" : "text-[var(--ink-muted)]"
        }`}
      >
        {section.text}
      </p>
      {/* Always use brand primary button so label stays white-on-red (never white-on-white). */}
      <a href="#tool-workspace" className="btn btn-primary mt-5">
        {section.buttonLabel}
      </a>
    </section>
  );
}

export function ToolSeoSections({
  sections,
  skin = "classic",
  order = "as-is",
}: {
  sections: ToolPageSection[];
  skin?: SeoSkin;
  order?: ToolLayout["seoOrder"];
}) {
  if (!sections.length) return null;
  const ordered = orderSeoSections(sections, order);

  const wrapper =
    skin === "banded"
      ? "mt-12 space-y-8"
      : skin === "magazine"
        ? "mt-12 space-y-12"
        : skin === "dense-editorial"
          ? "mt-10 space-y-6"
          : "mt-12 space-y-10";

  return (
    <div className={wrapper} data-seo-skin={skin}>
      {ordered.map((section) => {
        switch (section.type) {
          case "prose":
            return proseBlock(section, skin);
          case "steps":
            return stepsBlock(section, skin);
          case "cards":
            return cardsBlock(section, skin);
          case "bullets":
            return bulletsBlock(section, skin);
          case "cta":
            return ctaBlock(section, skin);
          default:
            return null;
        }
      })}
    </div>
  );
}
