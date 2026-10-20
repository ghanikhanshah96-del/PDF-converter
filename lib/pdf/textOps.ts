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

type ShowString = { start: number; end: number; text: string };
type ContentToken =
  | { t: "n"; v: number }
  | { t: "s"; start: number; end: number; text: string }
  | { t: "name" }
  | { t: "arr"; strings: ShowString[] };

type TextState = {
  ctm: number[];
  tm: number[];
  leading: number;
  fontSize: number;
  inText: boolean;
};

function cloneState(state: TextState): TextState {
  return {
    ctm: state.ctm.slice(),
    tm: state.tm.slice(),
    leading: state.leading,
    fontSize: state.fontSize,
    inText: state.inText,
  };
}

function multiplyCtm(m: number[], ctm: number[]) {
  const [a, b, c, d, e, f] = m;
  const [ca, cb, cc, cd, ce, cf] = ctm;
  return [
    a * ca + b * cc,
    a * cb + b * cd,
    c * ca + d * cc,
    c * cb + d * cd,
    e * ca + f * cc + ce,
    e * cb + f * cd + cf,
  ];
}

function moveText(state: TextState, tx: number, ty: number) {
  const [a, b, c, d, e, f] = state.tm;
  state.tm = [a, b, c, d, a * tx + c * ty + e, b * tx + d * ty + f];
}

function textOrigin(state: TextState) {
  const [ca, cb, cc, cd, ce, cf] = state.ctm;
  const [, , , , te, tf] = state.tm;
  return { x: te * ca + tf * cc + ce, y: te * cb + tf * cd + cf };
}

/**
 * Blank text-showing operators whose baseline sits on this line.
 * Used when the font encoding does not match the letters on screen.
 */
export function blankTextAt(
  src: string,
  target: { x: number; y: number; advance: number; fontSize: number },
): { content: string; removed: boolean } {
  const state: TextState = {
    ctm: [1, 0, 0, 1, 0, 0],
    tm: [1, 0, 0, 1, 0, 0],
    leading: 0,
    fontSize: target.fontSize,
    inText: false,
  };
  const saved: TextState[] = [];
  const stack: ContentToken[] = [];
  const ranges: Array<[number, number]> = [];
  const size = Math.max(target.fontSize, 1);
  const near = (origin: { x: number; y: number }) =>
    Math.abs(origin.y - target.y) <= size * 0.45 &&
    origin.x >= target.x - size &&
    origin.x <= target.x + Math.max(target.advance, size) + size;

  const takeString = (token: ContentToken | undefined) =>
    token && token.t === "s" && token.text.length <= 500 ? token : null;

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
      stack.push({ t: "s", start, end: i, text: read.value });
      continue;
    }
    if (ch === "<" && src[i + 1] !== "<") {
      const start = i;
      const read = readHex(src, i);
      i = read.next;
      stack.push({ t: "s", start, end: i, text: read.value });
      continue;
    }
    if (ch === "[") {
      const strings: ShowString[] = [];
      i += 1;
      while (i < src.length && src[i] !== "]") {
        if (src[i] === "%") {
          while (i < src.length && src[i] !== "\n" && src[i] !== "\r") i += 1;
          continue;
        }
        if (isSpace(src[i])) {
          i += 1;
          continue;
        }
        if (src[i] === "(") {
          const start = i;
          const read = readLiteral(src, i);
          i = read.next;
          strings.push({ start, end: i, text: read.value });
          continue;
        }
        if (src[i] === "<" && src[i + 1] !== "<") {
          const start = i;
          const read = readHex(src, i);
          i = read.next;
          strings.push({ start, end: i, text: read.value });
          continue;
        }
        i += 1;
      }
      if (src[i] === "]") i += 1;
      stack.push({ t: "arr", strings });
      continue;
    }
    if (ch === "/") {
      i += 1;
      while (i < src.length && !/[\s<>[\](){}/%]/.test(src[i])) i += 1;
      stack.push({ t: "name" });
      continue;
    }
    if (/[0-9.+-]/.test(ch)) {
      const start = i;
      if (src[i] === "+" || src[i] === "-") i += 1;
      while (i < src.length && /[0-9.]/.test(src[i])) i += 1;
      const value = Number(src.slice(start, i));
      if (Number.isFinite(value)) stack.push({ t: "n", v: value });
      continue;
    }
    if (!/[A-Za-z*'"]/.test(ch)) {
      i += 1;
      continue;
    }
    const start = i;
    if (ch === "'" || ch === '"') i += 1;
    else while (i < src.length && /[A-Za-z*]/.test(src[i])) i += 1;
    const word = src.slice(start, i);
    if (word === "q") {
      saved.push(cloneState(state));
      continue;
    }
    if (word === "Q") {
      const prev = saved.pop();
      if (prev) {
        state.ctm = prev.ctm;
        state.tm = prev.tm;
        state.leading = prev.leading;
        state.fontSize = prev.fontSize;
        state.inText = prev.inText;
      }
      continue;
    }
    if (word === "cm") {
      const f = stack.pop();
      const e = stack.pop();
      const d = stack.pop();
      const c = stack.pop();
      const b = stack.pop();
      const a = stack.pop();
      if (a?.t === "n" && b?.t === "n" && c?.t === "n" && d?.t === "n" && e?.t === "n" && f?.t === "n") {
        state.ctm = multiplyCtm([a.v, b.v, c.v, d.v, e.v, f.v], state.ctm);
      }
      continue;
    }
    if (word === "BT") {
      state.inText = true;
      state.tm = [1, 0, 0, 1, 0, 0];
      continue;
    }
    if (word === "ET") {
      state.inText = false;
      continue;
    }
    if (word === "Tm") {
      const f = stack.pop();
      const e = stack.pop();
      const d = stack.pop();
      const c = stack.pop();
      const b = stack.pop();
      const a = stack.pop();
      if (a?.t === "n" && b?.t === "n" && c?.t === "n" && d?.t === "n" && e?.t === "n" && f?.t === "n") {
        state.tm = [a.v, b.v, c.v, d.v, e.v, f.v];
      }
      continue;
    }
    if (word === "Td" || word === "TD") {
      const ty = stack.pop();
      const tx = stack.pop();
      if (tx?.t === "n" && ty?.t === "n") {
        moveText(state, tx.v, ty.v);
        if (word === "TD") state.leading = -ty.v;
      }
      continue;
    }
    if (word === "TL") {
      const leading = stack.pop();
      if (leading?.t === "n") state.leading = leading.v;
      continue;
    }
    if (word === "T*") {
      moveText(state, 0, -state.leading);
      continue;
    }
    if (word === "Tf") {
      const fontSize = stack.pop();
      stack.pop();
      if (fontSize?.t === "n" && fontSize.v > 0) state.fontSize = fontSize.v;
      continue;
    }
    if (!state.inText) continue;
    if (word === "Tj" || word === "'") {
      if (word === "'") moveText(state, 0, -state.leading);
      const shown = takeString(stack.pop());
      if (shown && near(textOrigin(state))) ranges.push([shown.start, shown.end]);
      continue;
    }
    if (word === '"') {
      stack.pop();
      stack.pop();
      moveText(state, 0, -state.leading);
      const shown = takeString(stack.pop());
      if (shown && near(textOrigin(state))) ranges.push([shown.start, shown.end]);
      continue;
    }
    if (word === "TJ") {
      const array = stack.pop();
      if (array?.t === "arr" && near(textOrigin(state))) {
        for (const shown of array.strings) {
          if (shown.text.length <= 500) ranges.push([shown.start, shown.end]);
        }
      }
    }
  }

  if (ranges.length === 0) return { content: src, removed: false };
  ranges.sort((a, b) => b[0] - a[0]);
  let content = src;
  for (const [start, end] of ranges) {
    content = `${content.slice(0, start)}()${content.slice(end)}`;
  }
  return { content, removed: true };
}
