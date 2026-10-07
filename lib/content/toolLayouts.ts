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

/** Shared layout used by Free PDF to Word Converter Online — applied to every tool. */
export const defaultToolLayout: ToolLayout = {
  name: "workspace-first-classic",
  hero: "standard",
  blocks: ["hero", "privacy", "workspace", "howto", "seo", "faq"],
  howTo: "numbered-cards",
  seoSkin: "classic",
  seoOrder: "as-is",
  faq: "accordion",
  related: "grid",
  banded: false,
};

const TOOL_IDS: ToolId[] = [
  "pdf-to-word",
  "word-to-pdf",
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "pdf-to-jpg",
  "jpg-to-pdf",
  "edit-pdf",
  "pdf-password-remover",
  "sign-pdf",
  "excel-to-pdf",
  "pdf-to-excel",
  "rotate-pdf",
  "unlock-pdf",
];

/** Every tool uses the same layout as PDF to Word. */
export const toolLayouts: Record<ToolId, ToolLayout> = Object.fromEntries(
  TOOL_IDS.map((id) => [id, { ...defaultToolLayout }]),
) as Record<ToolId, ToolLayout>;

export function getToolLayout(id: ToolId): ToolLayout {
  return toolLayouts[id] ?? defaultToolLayout;
}
