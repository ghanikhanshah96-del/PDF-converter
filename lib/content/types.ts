import type { ToolId } from "@/lib/tools";

export type ToolPageSection =
  | { type: "prose"; heading: string; paragraphs: string[] }
  | { type: "steps"; heading: string; steps: string[] }
  | {
      type: "cards";
      heading: string;
      intro?: string;
      items: { title: string; text: string }[];
    }
  | { type: "bullets"; heading: string; intro?: string; items: string[] }
  | { type: "cta"; heading: string; text: string; buttonLabel: string };

export type ToolPageContent = {
  sections: ToolPageSection[];
};

export type ToolPagesMap = Record<ToolId, ToolPageContent>;
