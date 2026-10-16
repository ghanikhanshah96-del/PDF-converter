export type TextOperand = { start: number; end: number; text: string };

function isSpace(ch: string | undefined): boolean {
  return ch === "\0" || ch === "\t" || ch === "\n" || ch === "\f" || ch === "\r" || ch === " ";
}

function readLiteral(src: string, i: number): { value: string; next: number } {
  let value = "";
  i += 1;
  while (i < src.length) {
    const ch = src[i];
    if (ch === "\\") {
      const next = src[i + 1];
      if (next === "n") {
        value += "\n";
        i += 2;
        continue;
      }
      if (next === "r") {
        value += "\r";
        i += 2;
        continue;
      }
      if (next === "t") {
        value += "\t";
        i += 2;
        continue;
      }
      if (next === "b") {
        value += "\b";
        i += 2;
        continue;
      }
      if (next === "f") {
        value += "\f";
        i += 2;
        continue;
      }
      if (next === "(" || next === ")" || next === "\\") {
        value += next;
        i += 2;
        continue;
      }
      if (next === "\n" || next === "\r") {
        i += next === "\r" && src[i + 2] === "\n" ? 3 : 2;
        continue;
      }
      if (next >= "0" && next <= "7") {
        let oct = next;
        let k = i + 2;
        for (let n = 0; n < 2 && src[k] >= "0" && src[k] <= "7"; n += 1, k += 1) {
          oct += src[k];
        }
        value += String.fromCharCode(Number.parseInt(oct, 8));
        i = k;
        continue;
      }
      value += next ?? "";
      i += 2;
      continue;
    }
    if (ch === ")") return { value, next: i + 1 };
    value += ch;
    i += 1;
  }
  return { value, next: i };
}

function readHex(src: string, i: number): { value: string; next: number } {
  i += 1;
  let hex = "";
  while (i < src.length && src[i] !== ">") {
    if (/[0-9A-Fa-f]/.test(src[i])) hex += src[i];
    i += 1;
  }
  if (src[i] === ">") i += 1;
  if (hex.length % 2 === 1) hex += "0";
  const bytes = new Uint8Array(hex.length / 2);
  for (let k = 0; k < bytes.length; k += 1) {
    bytes[k] = Number.parseInt(hex.slice(k * 2, k * 2 + 2), 16);
  }
  let value = "";
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    for (let k = 2; k + 1 < bytes.length; k += 2) {
      value += String.fromCharCode((bytes[k] << 8) | bytes[k + 1]);
    }
  } else {
    value = new TextDecoder("iso-8859-1").decode(bytes);
  }
  return { value, next: i };
}

function onlySpace(src: string, from: number, to: number): boolean {
  for (let i = from; i < to; i += 1) {
    if (!isSpace(src[i]) && src[i] !== "%") return false;
    if (src[i] === "%") {
      while (i < to && src[i] !== "\n" && src[i] !== "\r") i += 1;
    }
  }
  return true;
}

/** String operands that a Tj or TJ operator actually shows. */
export function listTextOperands(src: string): TextOperand[] {
  const shown: TextOperand[] = [];
  const recent: TextOperand[] = [];
  let arrayStrings: TextOperand[] = [];
  let arrayDepth = 0;
  let i = 0;

  while (i < src.length) {
    const ch = src[i];
    if (ch === "%") {
      while (i < src.length && src[i] !== "\n" && src[i] !== "\r") i += 1;
      continue;
    }
    if (isSpace(ch)) {
      i += 1;
      continue;
    }
    if (ch === "(") {
      const start = i;
      const read = readLiteral(src, i);
      i = read.next;
      const op = { start, end: i, text: read.value };
      recent.push(op);
      if (arrayDepth > 0) arrayStrings.push(op);
      continue;
    }
    if (ch === "<" && src[i + 1] !== "<") {
      const start = i;
      const read = readHex(src, i);
      i = read.next;
      const op = { start, end: i, text: read.value };
      recent.push(op);
      if (arrayDepth > 0) arrayStrings.push(op);
      continue;
    }
    if (ch === "[") {
      if (arrayDepth === 0) arrayStrings = [];
      arrayDepth += 1;
      i += 1;
      continue;
    }
    if (ch === "]") {
      arrayDepth = Math.max(0, arrayDepth - 1);
      const end = i + 1;
      i = end;
      let k = i;
      while (isSpace(src[k])) k += 1;
      if (src.startsWith("TJ", k) && !/[A-Za-z]/.test(src[k + 2] ?? "")) {
        shown.push(...arrayStrings);
        i = k + 2;
      }
      arrayStrings = [];
      continue;
    }
    if (/[A-Za-z'"]/.test(ch)) {
      const start = i;
      if (ch === "'" || ch === '"') {
        i += 1;
      } else {
        while (i < src.length && /[A-Za-z*]/.test(src[i])) i += 1;
      }
      const word = src.slice(start, i);
      if ((word === "Tj" || word === "'" || word === '"') && recent.length > 0) {
        const last = recent[recent.length - 1];
        if (onlySpace(src, last.end, start)) shown.push(last);
      }
      continue;
    }
    i += 1;
  }
  return shown;
}

/**
 * Replace operands only when each item string occurs exactly once.
 * Returns null when that cannot be proven, leaving the stream unchanged.
 */
/** A PDF literal is safe only when every character is a single byte the font already uses. */
export function pdfLiteral(text: string): string | null {
  let body = "";
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 32 || code > 126) return null;
    body += ch === "\\" || ch === "(" || ch === ")" ? `\\${ch}` : ch;
  }
  return `(${body})`;
}

export type SimpleLiteralHit = {
  content: string;
  fontResource: string;
  fontSize: number;
};

function hexFor(text: string): string | null {
  let body = "";
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 32 || code > 126) return null;
    body += code.toString(16).padStart(2, "0");
  }
  return `<${body}>`;
}

function simpleHex(src: string, i: number, original: string): { end: number } | null {
  i += 1;
  let hex = "";
  while (i < src.length && src[i] !== ">") {
    if (/[0-9A-Fa-f]/.test(src[i])) hex += src[i];
    else if (!isSpace(src[i])) return null;
    i += 1;
  }
  if (src[i] !== ">") return null;
  i += 1;
  if (hex.length % 2 === 1 || hex.length / 2 !== original.length) return null;
  if (hex.length >= 4 && hex.slice(0, 4).toLowerCase() === "feff") return null;
  for (let k = 0; k < original.length; k += 1) {
    const byte = Number.parseInt(hex.slice(k * 2, k * 2 + 2), 16);
    if (byte !== original.charCodeAt(k) || byte < 32 || byte > 126) return null;
  }
  return { end: i };
}

/**
 * Replace one parenthesized `Tj` string and leave every other operator in place.
 * Hex strings, TJ arrays, and a missing font size are refused.
 */
export function replaceSimpleLiteral(
  src: string,
  original: string,
  replacement: string,
): SimpleLiteralHit | null {
  const literal = pdfLiteral(replacement);
  const asHex = hexFor(replacement);
  if (literal === null || asHex === null || !original) return null;
  let i = 0;
  let arrayDepth = 0;
  let currentFont = "";
  let currentSize = 0;
  let fontResource = "";
  let fontSize = 0;
  const hits: Array<{ start: number; end: number; hex: boolean }> = [];

  while (i < src.length) {
    const ch = src[i];
    if (ch === "%") {
      while (i < src.length && src[i] !== "\n" && src[i] !== "\r") i += 1;
      continue;
    }
    if (isSpace(ch)) {
      i += 1;
      continue;
    }
    if (ch === "[") {
      arrayDepth += 1;
      i += 1;
      continue;
    }
    if (ch === "]") {
      arrayDepth = Math.max(0, arrayDepth - 1);
      i += 1;
      continue;
    }
    if (ch === "(" && arrayDepth === 0) {
      const start = i;
      const read = readLiteral(src, i);
      i = read.next;
      let k = i;
      while (isSpace(src[k])) k += 1;
      const isTj = src.startsWith("Tj", k) && !/[A-Za-z]/.test(src[k + 2] ?? "");
      if (isTj && read.value === original && currentFont && currentSize > 0) {
        hits.push({ start, end: i, hex: false });
        fontResource = currentFont;
        fontSize = currentSize;
      }
      continue;
    }
    if (ch === "<" && src[i + 1] !== "<" && arrayDepth === 0) {
      const start = i;
      const read = simpleHex(src, i, original);
      if (!read) {
        i += 1;
        continue;
      }
      i = read.end;
      let k = i;
      while (isSpace(src[k])) k += 1;
      const isTj = src.startsWith("Tj", k) && !/[A-Za-z]/.test(src[k + 2] ?? "");
      if (isTj && currentFont && currentSize > 0) {
        hits.push({ start, end: i, hex: true });
        fontResource = currentFont;
        fontSize = currentSize;
      }
      continue;
    }
    if (ch === "/") {
      const nameStart = i + 1;
      i += 1;
      while (i < src.length && !/[\s<>[\](){}/%]/.test(src[i])) i += 1;
      const name = src.slice(nameStart, i);
      let k = i;
      while (isSpace(src[k])) k += 1;
      let n = k;
      let num = "";
      const first = src[n];
      if (first === "-" || first === "+" || first === "." || (first >= "0" && first <= "9")) {
        while (n < src.length && /[0-9.+-]/.test(src[n])) {
          num += src[n];
          n += 1;
        }
        let m = n;
        while (isSpace(src[m])) m += 1;
        if (src.startsWith("Tf", m) && !/[A-Za-z]/.test(src[m + 2] ?? "")) {
          const size = Number(num);
          if (name && Number.isFinite(size) && size > 0) {
            currentFont = name;
            currentSize = size;
          }
          i = m + 2;
        }
      }
      continue;
    }
    i += 1;
  }

  if (hits.length !== 1) return null;
  const hit = hits[0];
  return {
    content: `${src.slice(0, hit.start)}${hit.hex ? asHex : literal}${src.slice(hit.end)}`,
    fontResource,
    fontSize,
  };
}

export function blankUniqueOperands(src: string, items: string[]): string | null {
  const { content, removed } = blankLines(src, [items]);
  return removed[0] ? content : null;
}

export function blankLines(
  src: string,
  lines: string[][],
): { content: string; removed: boolean[] } {
  const ops = listTextOperands(src);
  const counts = new Map<string, number>();
  for (const op of ops) counts.set(op.text, (counts.get(op.text) ?? 0) + 1);

  const removed = lines.map(() => false);
  const ranges: Array<[number, number]> = [];
  const claimed = new Set<number>();

  for (let line = 0; line < lines.length; line += 1) {
    const wanted = lines[line].filter((item) => item.trim().length > 0);
    if (wanted.length === 0) continue;
    const picks: number[] = [];
    let ok = true;
    for (const item of wanted) {
      if ((counts.get(item) ?? 0) !== 1) {
        ok = false;
        break;
      }
      const idx = ops.findIndex((op, opIndex) => op.text === item && !claimed.has(opIndex) && !picks.includes(opIndex));
      if (idx < 0) {
        ok = false;
        break;
      }
      picks.push(idx);
    }
    if (!ok) continue;
    for (const idx of picks) claimed.add(idx);
    for (const idx of picks) ranges.push([ops[idx].start, ops[idx].end]);
    removed[line] = true;
  }

  ranges.sort((a, b) => b[0] - a[0]);
  let content = src;
  for (const [start, end] of ranges) {
    content = `${content.slice(0, start)}()${content.slice(end)}`;
  }
  return { content, removed };
}
