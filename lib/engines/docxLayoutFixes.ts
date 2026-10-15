import JSZip from "jszip";

const RTL = /[\u0590-\u08FF]/;
const RLI = "\u2067";
const PDI = "\u2069";
const WJ = "\u2060";

function decodeXml(text: string): string {
  return text
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function encodeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attr(tag: string, name: string): number | null {
  const match = new RegExp(`\\b${name}="(-?\\d+)"`).exec(tag);
  return match ? Number(match[1]) : null;
}

function sectionBox(xml: string, from: number): { width: number } {
  const sectAt = xml.indexOf("<w:sectPr", from);
  const sect = sectAt === -1 ? "" : xml.slice(sectAt, xml.indexOf("</w:sectPr>", sectAt) + 11);
  const size = sect.match(/<w:pgSz\b[^>]*>/)?.[0] ?? "";
  const margin = sect.match(/<w:pgMar\b[^>]*>/)?.[0] ?? "";
  const page = attr(size, "w:w") ?? 12240;
  const left = attr(margin, "w:left") ?? 1440;
  const right = attr(margin, "w:right") ?? 1440;
  return { width: Math.max(1440, page - left - right) };
}

/**
 * Keep a parenthesized right-to-left phrase together.
 * The parentheses are stored in reverse inside an RTL isolate so LibreOffice
 * draws "(" on the left and ")" on the right, and wraps the group as one unit.
 */
export function keepRtlParenthesesTogether(text: string): string {
  if (!RTL.test(text) || text.includes(RLI)) return text;
  return text.replace(/\(([^()\n]+)\)/g, (full, inner: string) => {
    if (!RTL.test(inner)) return full;
    return `${RLI})${WJ}${inner}${WJ}(${PDI}`;
  });
}

function fixTextNodes(xml: string): string {
  return xml.replace(/<w:t(\s[^>]*)?>([^<]*)<\/w:t>/g, (full, attrs: string | undefined, raw: string) => {
    const next = keepRtlParenthesesTogether(decodeXml(raw));
    if (next === decodeXml(raw)) return full;
    return `<w:t${attrs ?? ""}>${encodeXml(next)}</w:t>`;
  });
}

function paragraphText(paragraph: string): string {
  return [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)]
    .map((match) => decodeXml(match[1]))
    .join("");
}

function widenExtremeIndent(paragraph: string, contentWidth: number): string {
  const indent = paragraph.match(/<w:ind\b[^>]*>/)?.[0];
  if (!indent) return paragraph;
  const left = attr(indent, "w:left");
  if (left === null || left < 1440) return paragraph;
  const room = contentWidth - left;
  const text = paragraphText(paragraph);
  if (room >= 2160 || text.length < 12) return paragraph;
  const desired = Math.min(5760, Math.max(4320, text.length * 140));
  const nextLeft = Math.max(0, contentWidth - desired);
  let next = paragraph.replace(indent, indent.replace(/w:left="-?\d+"/, `w:left="${nextLeft}"`));
  if (!/<w:jc\b/.test(next)) {
    next = next.replace(/<w:pPr>/, `<w:pPr><w:jc w:val="right"/>`);
  }
  return next;
}

function rotatedTextLength(cell: string): number {
  const text = paragraphText(cell);
  const size = attr(cell.match(/<w:sz\b[^>]*>/)?.[0] ?? "", "w:val") ?? 22;
  return text.length * size * 6 + 800;
}

function preventRotatedWrap(cell: string): string {
  if (/<w:wordWrap\b/.test(cell)) return cell;
  if (/<w:pPr>/.test(cell)) {
    return cell.replace(/<w:pPr>/, `<w:pPr><w:wordWrap w:val="off"/>`);
  }
  return cell.replace(/<w:p>/, `<w:p><w:pPr><w:wordWrap w:val="off"/></w:pPr>`);
}

function giveRotatedRowsRoom(table: string): string {
  return table.replace(/<w:tr\b[^>]*>[\s\S]*?<\/w:tr>/g, (row) => {
    const cells = row.match(/<w:tc\b[\s\S]*?<\/w:tc>/g) ?? [];
    const rotated = cells.find((cell) => /<w:textDirection\b[^>]*w:val="(?:btLr|tbRl)"/.test(cell));
    if (!rotated) return row;
    const height = rotatedTextLength(rotated);
    let next = row.replace(rotated, preventRotatedWrap(rotated));
    if (/<w:trHeight\b/.test(next)) {
      next = next.replace(/<w:trHeight\b[^>]*>/, `<w:trHeight w:val="${height}" w:hRule="atLeast"/>`);
    } else if (/<w:trPr>/.test(next)) {
      next = next.replace(/<w:trPr>/, `<w:trPr><w:trHeight w:val="${height}" w:hRule="atLeast"/>`);
    } else {
      next = next.replace(/<w:tr\b[^>]*>/, (tag) => `${tag}<w:trPr><w:trHeight w:val="${height}" w:hRule="atLeast"/></w:trPr>`);
    }
    return next;
  });
}

function fixOutsideTables(xml: string): string {
  const parts = xml.split(/(<w:tbl\b[\s\S]*?<\/w:tbl>)/);
  let cursor = 0;
  const next = parts.map((part) => {
    const start = cursor;
    cursor += part.length;
    if (part.startsWith("<w:tbl")) return giveRotatedRowsRoom(part);
    return part.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (paragraph, offset: number) =>
      widenExtremeIndent(paragraph, sectionBox(xml, start + offset).width),
    );
  });
  return next.join("");
}

/** Adjust three Word constructs LibreOffice lays out too tightly, before PDF export. */
export async function prepareDocxLayout(bytes: Uint8Array): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(bytes);
  const file = zip.file("word/document.xml");
  if (!file) return bytes;
  const xml = await file.async("string");
  const next = fixOutsideTables(fixTextNodes(xml));
  if (next === xml) return bytes;
  zip.file("word/document.xml", next);
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
