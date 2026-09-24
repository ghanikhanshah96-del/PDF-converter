import type { ToolId } from "@/lib/tools";
import type { ToolPageContent } from "./types";

/**
 * Lazily load SEO body content for a single tool.
 * Keeps each tool route from parsing the full ~100KB content map.
 */
export async function getToolPage(
  id: ToolId,
): Promise<ToolPageContent | undefined> {
  switch (id) {
    case "pdf-to-word":
      return (await import("./pages/pdf-to-word")).default;
    case "word-to-pdf":
      return (await import("./pages/word-to-pdf")).default;
    case "merge-pdf":
      return (await import("./pages/merge-pdf")).default;
    case "split-pdf":
      return (await import("./pages/split-pdf")).default;
    case "compress-pdf":
      return (await import("./pages/compress-pdf")).default;
    case "pdf-to-jpg":
      return (await import("./pages/pdf-to-jpg")).default;
    case "jpg-to-pdf":
      return (await import("./pages/jpg-to-pdf")).default;
    case "edit-pdf":
      return (await import("./pages/edit-pdf")).default;
    case "pdf-password-remover":
      return (await import("./pages/pdf-password-remover")).default;
    case "sign-pdf":
      return (await import("./pages/sign-pdf")).default;
    case "excel-to-pdf":
      return (await import("./pages/excel-to-pdf")).default;
    case "pdf-to-excel":
      return (await import("./pages/pdf-to-excel")).default;
    case "rotate-pdf":
      return (await import("./pages/rotate-pdf")).default;
    case "unlock-pdf":
      return (await import("./pages/unlock-pdf")).default;
    default:
      return undefined;
  }
}
