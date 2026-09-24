const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const pages = [
  ["pdf-to-word", "PdfToWordClient", "PdfToWordClient"],
  ["word-to-pdf", "WordToPdfClient", "WordToPdfClient"],
  ["merge-pdf", "MergePdfClient", "MergePdfClient"],
  ["split-pdf", "SplitPdfClient", "SplitPdfClient"],
  ["compress-pdf", "CompressPdfClient", "CompressPdfClient"],
  ["pdf-to-jpg", "PdfToJpgClient", "PdfToJpgClient"],
  ["jpg-to-pdf", "JpgToPdfClient", "JpgToPdfClient"],
  ["edit-pdf", "EditPdfClient", "EditPdfClient"],
  ["pdf-password-remover", "PasswordRemoverClient", "UnlockPdfClient"],
  ["sign-pdf", "SignPdfClient", "SignPdfClient"],
  ["excel-to-pdf", "ExcelToPdfClient", "ExcelToPdfClient"],
  ["pdf-to-excel", "PdfToExcelClient", "PdfToExcelClient"],
  ["rotate-pdf", "RotatePdfClient", "RotatePdfClient"],
  ["unlock-pdf", "UnlockPdfClient", "UnlockPdfClient"],
];

for (const [id, exportName, file] of pages) {
  const content = `import type { Metadata } from "next";
import { ToolPageShell, toolMetadata } from "@/components/ToolPageShell";
import { ${exportName} } from "@/components/tools/${file}";
import { toolsById } from "@/lib/tools";

const tool = toolsById["${id}"];
export const metadata: Metadata = toolMetadata(tool);

export default function Page() {
  return (
    <ToolPageShell tool={tool}>
      <${exportName} />
    </ToolPageShell>
  );
}
`;
  const out = path.join(root, "app", id, "page.tsx");
  fs.writeFileSync(out, content);
  console.log("Wrote", out);
}
