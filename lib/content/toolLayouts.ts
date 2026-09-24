import type { ToolId } from "@/lib/tools";

/** Unique page architecture per tool — same content, different structure. */
export type HowToVariant =
  | "numbered-cards"
  | "horizontal-rail"
  | "timeline"
  | "checklist"
  | "compact-list";

export type SeoSkin =
  | "classic"
  | "banded"
  | "magazine"
  | "feature-spotlight"
  | "dense-editorial"
  | "card-stack"
  | "split-rhythm";

export type FaqVariant = "accordion" | "two-column" | "stacked-panel";

export type RelatedVariant = "grid" | "chips" | "list";

export type BlockId =
  | "hero"
  | "privacy"
  | "workspace"
  | "howto"
  | "seo"
  | "faq"
  | "related";

export type HeroVariant =
  | "standard"
  | "with-aside"
  | "centered-narrow"
  | "split-banner";

export type ToolLayout = {
  /** Unique human-readable layout name for debugging */
  name: string;
  hero: HeroVariant;
  blocks: BlockId[];
  howTo: HowToVariant;
  seoSkin: SeoSkin;
  /** Rotate/reorder SEO section presentation without dropping content */
  seoOrder: "as-is" | "prose-first" | "cards-first" | "cta-early" | "interleave";
  faq: FaqVariant;
  related: RelatedVariant;
  /** Alternate page background banding */
  banded: boolean;
};

/**
 * 14 distinct layouts — one per tool.
 * Content stays identical; only composition/order/presentation changes.
 */
export const toolLayouts: Record<ToolId, ToolLayout> = {
  "pdf-to-word": {
    name: "workspace-first-classic",
    hero: "standard",
    blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
    howTo: "numbered-cards",
    seoSkin: "classic",
    seoOrder: "as-is",
    faq: "accordion",
    related: "grid",
    banded: false,
  },
  "word-to-pdf": {
    name: "guide-first-magazine",
    hero: "with-aside",
    blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
    howTo: "horizontal-rail",
    seoSkin: "magazine",
    seoOrder: "prose-first",
    faq: "two-column",
    related: "chips",
    banded: true,
  },
  "merge-pdf": {
    name: "steps-rail-banded",
    hero: "split-banner",
    blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
    howTo: "horizontal-rail",
    seoSkin: "banded",
    seoOrder: "cards-first",
    faq: "stacked-panel",
    related: "list",
    banded: true,
  },
  "split-pdf": {
    name: "faq-mid-checklist",
    hero: "centered-narrow",
    blocks: ["hero", "privacy", "workspace", "seo", "faq", "howto"],
    howTo: "checklist",
    seoSkin: "card-stack",
    seoOrder: "interleave",
    faq: "accordion",
    related: "chips",
    banded: false,
  },
  "compress-pdf": {
    name: "feature-spotlight",
    hero: "with-aside",
    blocks: ["hero", "privacy", "workspace", "seo", "howto", "faq"],
    howTo: "timeline",
    seoSkin: "feature-spotlight",
    seoOrder: "cards-first",
    faq: "two-column",
    related: "grid",
    banded: true,
  },
  "pdf-to-jpg": {
    name: "dense-editorial",
    hero: "standard",
    blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
    howTo: "compact-list",
    seoSkin: "dense-editorial",
    seoOrder: "prose-first",
    faq: "stacked-panel",
    related: "list",
    banded: false,
  },
  "jpg-to-pdf": {
    name: "checklist-sidebar-flow",
    hero: "split-banner",
    blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
    howTo: "checklist",
    seoSkin: "split-rhythm",
    seoOrder: "cta-early",
    faq: "accordion",
    related: "chips",
    banded: true,
  },
  "edit-pdf": {
    name: "editorial-prose-late-tool",
    hero: "centered-narrow",
    blocks: ["hero", "privacy", "workspace", "seo", "howto", "faq"],
    howTo: "numbered-cards",
    seoSkin: "magazine",
    seoOrder: "prose-first",
    faq: "two-column",
    related: "grid",
    banded: false,
  },
  "pdf-password-remover": {
    name: "security-callout-top",
    hero: "with-aside",
    blocks: ["hero", "privacy", "workspace", "faq", "howto", "seo"],
    howTo: "timeline",
    seoSkin: "banded",
    seoOrder: "as-is",
    faq: "stacked-panel",
    related: "list",
    banded: true,
  },
  "sign-pdf": {
    name: "signature-focus-split",
    hero: "split-banner",
    blocks: ["hero", "privacy", "workspace", "seo", "howto", "faq"],
    howTo: "horizontal-rail",
    seoSkin: "feature-spotlight",
    seoOrder: "cards-first",
    faq: "accordion",
    related: "chips",
    banded: false,
  },
  "excel-to-pdf": {
    name: "two-column-rhythm",
    hero: "standard",
    blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
    howTo: "numbered-cards",
    seoSkin: "split-rhythm",
    seoOrder: "interleave",
    faq: "two-column",
    related: "grid",
    banded: true,
  },
  "pdf-to-excel": {
    name: "compact-tool-expanded-guide",
    hero: "centered-narrow",
    blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
    howTo: "compact-list",
    seoSkin: "dense-editorial",
    seoOrder: "cta-early",
    faq: "stacked-panel",
    related: "list",
    banded: false,
  },
  "rotate-pdf": {
    name: "timeline-howto-late-faq",
    hero: "with-aside",
    blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
    howTo: "timeline",
    seoSkin: "card-stack",
    seoOrder: "as-is",
    faq: "accordion",
    related: "chips",
    banded: true,
  },
  "unlock-pdf": {
    name: "security-magazine-end-cta",
    hero: "split-banner",
    blocks: ["hero", "privacy", "workspace", "seo", "howto", "faq"],
    howTo: "checklist",
    seoSkin: "magazine",
    seoOrder: "prose-first",
    faq: "two-column",
    related: "grid",
    banded: false,
  },
};

export function getToolLayout(id: ToolId): ToolLayout {
  return toolLayouts[id];
}
