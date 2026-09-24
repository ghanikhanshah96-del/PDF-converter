import { PDFDocument, StandardFonts, type PDFFont } from "pdf-lib";
import * as fontkit from "@pdf-lib/fontkit";

let cachedFontBytes: ArrayBuffer | null = null;

async function loadUnicodeFontBytes(): Promise<ArrayBuffer | null> {
  if (cachedFontBytes) return cachedFontBytes;
  if (typeof fetch === "undefined") return null;

  try {
    const res = await fetch("/fonts/NotoSans-Regular.ttf");
    if (!res.ok) return null;
    cachedFontBytes = await res.arrayBuffer();
    return cachedFontBytes;
  } catch {
    return null;
  }
}

/** Map common Unicode symbols to WinAnsi-safe ASCII when a Unicode font is unavailable. */
export function toWinAnsiSafe(text: string): string {
  const map: Record<string, string> = {
    "\u2018": "'",
    "\u2019": "'",
    "\u201C": '"',
    "\u201D": '"',
    "\u2013": "-",
    "\u2014": "-",
    "\u2026": "...",
    "\u00A0": " ",
    "\u2190": "<-",
    "\u2192": "->",
    "\u2191": "^",
    "\u2193": "v",
    "\u2022": "*",
    "\u00B7": "*",
    "\u20AC": "EUR",
    "\u00A3": "GBP",
    "\u00A5": "YEN",
    "\u2122": "(TM)",
    "\u00AE": "(R)",
    "\u00A9": "(C)",
  };

  let out = "";
  for (const ch of text) {
    if (map[ch]) {
      out += map[ch];
      continue;
    }
    const code = ch.codePointAt(0) ?? 0;
    // Keep printable WinAnsi / Latin-1 where Helvetica can encode them
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 255)) {
      out += ch;
    } else {
      out += "?";
    }
  }
  return out;
}

/**
 * Prefer Noto Sans (Unicode) so symbols like → render correctly.
 * Falls back to Helvetica with WinAnsi-safe text sanitization.
 */
export async function embedTextFont(
  pdf: PDFDocument,
): Promise<{ font: PDFFont; sanitize: (text: string) => string }> {
  const bytes = await loadUnicodeFontBytes();
  if (bytes) {
    try {
      pdf.registerFontkit(fontkit);
      const font = await pdf.embedFont(bytes, { subset: true });
      return { font, sanitize: (text) => text };
    } catch {
      // fall through to Helvetica
    }
  }

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  return { font, sanitize: toWinAnsiSafe };
}
