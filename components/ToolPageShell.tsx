import type { ReactNode } from "react";
import type { Metadata } from "next";
import type { ToolDefinition } from "@/lib/tools";
import { SITE } from "@/lib/site";
import { getToolPage } from "@/lib/content/getToolPage";
import { getToolLayout, type BlockId } from "@/lib/content/toolLayouts";
import { PrivacyCallout } from "@/components/PrivacyCallout";
import { ToolJsonLd } from "@/components/ToolJsonLd";
import { ToolSeoSections } from "@/components/ToolSeoSections";
import { ToolHowTo } from "@/components/ToolHowTo";
import { ToolFaqBlock } from "@/components/ToolFaqBlock";

export function toolMetadata(tool: ToolDefinition): Metadata {
  const url = `${SITE.url}${tool.href}`;
  return {
    title: tool.title,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: tool.title,
      description: tool.metaDescription,
      url,
      siteName: SITE.name,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.title,
      description: tool.metaDescription,
    },
  };
}

function HeroBlock({
  tool,
  variant,
}: {
  tool: ToolDefinition;
  variant: ReturnType<typeof getToolLayout>["hero"];
}) {
  if (variant === "with-aside") {
    return (
      <header className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-start">
        <div>
          <h1 className="font-display text-[clamp(2rem,9vw,2.5rem)] font-bold leading-tight sm:text-4xl">
            {tool.h1}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
            {tool.description}
          </p>
        </div>
        <aside className="rounded-2xl border border-[var(--line)] bg-[var(--brand-soft)] p-4 text-sm text-[var(--ink-muted)]">
          <p className="font-semibold text-[var(--ink)]">Quick tip</p>
          <p className="mt-2">
            {tool.name} runs in your browser. Select a file below, process it
            locally, then download the result — no account required.
          </p>
        </aside>
      </header>
    );
  }

  if (variant === "centered-narrow") {
    return (
      <header className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-[clamp(2rem,8vw,2.75rem)] font-bold leading-tight">
          {tool.h1}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
          {tool.description}
        </p>
      </header>
    );
  }

  if (variant === "split-banner") {
    return (
      <header className="overflow-hidden rounded-2xl border border-[var(--line)] bg-gradient-to-br from-white to-[var(--brand-soft)]">
        <div className="grid gap-4 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <h1 className="font-display text-[clamp(1.85rem,8vw,2.6rem)] font-bold leading-tight">
              {tool.h1}
            </h1>
          </div>
          <p className="text-sm leading-relaxed text-[var(--ink-muted)] sm:text-base">
            {tool.description}
          </p>
        </div>
      </header>
    );
  }

  return (
    <header>
      <h1 className="font-display text-[clamp(2rem,9vw,2.5rem)] font-bold leading-tight sm:text-4xl">
        {tool.h1}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-[var(--ink-muted)] sm:text-lg">
        {tool.description}
      </p>
    </header>
  );
}

/** Always put the upload workspace near the top, after hero + privacy. */
function normalizeBlocks(
  blocks: BlockId[],
): Exclude<BlockId, "related">[] {
  const rest = blocks.filter(
    (id): id is Exclude<BlockId, "related" | "hero" | "privacy" | "workspace"> =>
      id !== "hero" &&
      id !== "privacy" &&
      id !== "workspace" &&
      id !== "related",
  );
  return ["hero", "privacy", "workspace", ...rest];
}

export async function ToolPageShell({
  tool,
  children,
  notice,
}: {
  tool: ToolDefinition;
  children: ReactNode;
  notice?: ReactNode;
}) {
  const seo = await getToolPage(tool.id);
  const layout = getToolLayout(tool.id);
  const blocksOrder = normalizeBlocks(layout.blocks);

  const blocks: Record<Exclude<BlockId, "related">, ReactNode> = {
    hero: <HeroBlock tool={tool} variant={layout.hero} />,
    privacy: (
      <>
        <PrivacyCallout className="mt-5" />
        {notice}
      </>
    ),
    workspace: (
      <div id="tool-workspace" className="mt-5 scroll-mt-24">
        {children}
      </div>
    ),
    howto: (
      <ToolHowTo
        toolName={tool.name}
        steps={tool.howTo}
        variant={layout.howTo}
      />
    ),
    seo: seo?.sections?.length ? (
      <ToolSeoSections
        sections={seo.sections.filter((s) => {
          if (s.type === "steps") return false;
          if (s.type === "cards") {
            const howToHeading = /^how to\b/i.test(s.heading);
            const stepCards = s.items.some((item) =>
              /^step\s*\d/i.test(item.title),
            );
            if (howToHeading || stepCards) return false;
          }
          return true;
        })}
        skin={layout.seoSkin}
        order={layout.seoOrder}
      />
    ) : null,
    faq: (
      <ToolFaqBlock
        faqs={tool.faqs}
        heading={`${tool.name} FAQs`}
        variant={layout.faq}
      />
    ),
  };

  return (
    <div
      className="site-container py-6 sm:py-10"
      data-tool-layout={layout.name}
    >
      <ToolJsonLd tool={tool} />

      {blocksOrder.map((blockId) => (
        <div key={blockId}>{blocks[blockId]}</div>
      ))}
    </div>
  );
}
