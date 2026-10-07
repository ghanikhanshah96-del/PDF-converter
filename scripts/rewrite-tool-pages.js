const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

// [id, slug, exportName, clientFile]
const pages = [
  ["pdf-to-word", "pdf-to-word-converter-free", "PdfToWordClient", "PdfToWordClient"],
  ["word-to-pdf", "word-to-pdf-converter-free", "WordToPdfClient", "WordToPdfClient"],
  ["merge-pdf", "merge-pdf-online-free", "MergePdfClient", "MergePdfClient"],
  ["split-pdf", "split-pdf-online-free", "SplitPdfClient", "SplitPdfClient"],
  ["compress-pdf", "compress-pdf-free", "CompressPdfClient", "CompressPdfClient"],
  ["pdf-to-jpg", "pdf-to-jpg-converter-free", "PdfToJpgClient", "PdfToJpgClient"],
  ["jpg-to-pdf", "jpg-to-pdf-converter-free", "JpgToPdfClient", "JpgToPdfClient"],
  ["edit-pdf", "edit-pdf-online-free", "EditPdfClient", "EditPdfClient"],
  ["pdf-password-remover", "pdf-password-remover", "PasswordRemoverClient", "UnlockPdfClient"],
  ["sign-pdf", "sign-pdf-online-free", "SignPdfClient", "SignPdfClient"],
  ["excel-to-pdf", "excel-to-pdf-converter", "ExcelToPdfClient", "ExcelToPdfClient"],
  ["pdf-to-excel", "pdf-to-excel-converter", "PdfToExcelClient", "PdfToExcelClient"],
  ["rotate-pdf", "rotate-pdf-online", "RotatePdfClient", "RotatePdfClient"],
  ["unlock-pdf", "unlock-pdf-online", "UnlockPdfClient", "UnlockPdfClient"],
];

for (const [id, slug, exportName, file] of pages) {
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
  const dir = path.join(root, "app", slug);
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, "page.tsx");
  fs.writeFileSync(out, content);
  console.log("Wrote", out);
}
