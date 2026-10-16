export type CardinalAngle = 0 | 90 | 180 | 270;

export type TextLine = {
  id: string;
  pageIndex: number;
  text: string;
  items: string[];
  /** Fractions of the displayed page, origin at the top left. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Baseline start in displayed PDF points, origin at the bottom left. */
  originX: number;
  originY: number;
  advance: number;
  fontSize: number;
  angle: CardinalAngle | null;
  editable: boolean;
  reason?: string;
};

export type LineEdit = {
  id: string;
  pageIndex: number;
  original: string;
  text: string;
  items: string[];
  x: number;
  y: number;
  w: number;
  h: number;
  originX: number;
  originY: number;
  advance: number;
  fontSize: number;
  angle: CardinalAngle;
  cover: { r: number; g: number; b: number };
  color: { r: number; g: number; b: number };
  coverUncertain: boolean;
};

export type RawTextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  dir?: string;
};

export type PointViewport = {
  width: number;
  height: number;
  convertToViewportPoint: (x: number, y: number) => number[];
};

const ODD_ANGLE = "This text is rotated in a way this editor can't rewrite.";
const AMBIGUOUS = "This line isn't safe to edit on its own. Add a text box instead.";
const RTL = "This line runs right to left. This editor can't rewrite it safely.";

export function snapAngle(a: number, b: number): CardinalAngle | null {
  let deg = (Math.atan2(b, a) * 180) / Math.PI;
  deg = ((deg % 360) + 360) % 360;
  const choices: CardinalAngle[] = [0, 90, 180, 270];
  let best: CardinalAngle = 0;
  let error = 360;
  for (const choice of choices) {
    const delta = Math.min(Math.abs(deg - choice), Math.abs(deg - (choice + 360)));
    if (delta < error) {
      error = delta;
      best = choice;
    }
  }
  return error <= 8 ? best : null;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

export function groupTextLines(
  raw: RawTextItem[],
  pageIndex: number,
  viewport: PointViewport,
): TextLine[] {
  type Placed = {
    str: string;
    x: number;
    y: number;
    width: number;
    fontSize: number;
    angle: CardinalAngle | null;
    dir?: string;
    along: number;
    cross: number;
  };

  const placed: Placed[] = [];
  for (const item of raw) {
    if (!item.str) continue;
    const [a, b, c, d, e, f] = item.transform;
    const angle = snapAngle(a, b);
    const fontSize = Math.max(1, Math.hypot(a, b) || Math.hypot(c, d) || item.height || 1);
    const rad = ((angle ?? 0) * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    placed.push({
      str: item.str,
      x: e,
      y: f,
      width: item.width,
      fontSize,
      angle,
      dir: item.dir,
      along: e * dx + f * dy,
      cross: -e * dy + f * dx,
    });
  }

  const groups: Placed[][] = [];
  for (const item of placed) {
    if (item.angle === null) {
      groups.push([item]);
      continue;
    }
    const found = groups.find((group) => {
      const head = group[0];
      if (head.angle !== item.angle) return false;
      const tolerance = Math.max(head.fontSize, item.fontSize) * 0.5;
      return Math.abs(head.cross - item.cross) <= tolerance;
    });
    if (found) found.push(item);
    else groups.push([item]);
  }

  return groups.map((group, index) => {
    const sorted = [...group].sort((p, q) => p.along - q.along);
    const chunks: Placed[][] = [];
    for (const item of sorted) {
      const current = chunks[chunks.length - 1];
      if (!current) {
        chunks.push([item]);
        continue;
      }
      const prev = current[current.length - 1];
      const gap = item.along - (prev.along + prev.width);
      const space = Math.max(prev.fontSize, item.fontSize) * 0.33 * 3;
      if (gap > space) chunks.push([item]);
      else current.push(item);
    }

    return chunks.map((chunk) => {
      const first = chunk[0];
      const angle = first.angle;
      const fontSize = chunk.reduce((sum, item) => sum + item.fontSize, 0) / chunk.length;
      const sizesDiffer = chunk.some((item) => item.fontSize > fontSize * 1.35 || item.fontSize < fontSize / 1.35);
      const rtl = chunk.some((item) => item.dir === "rtl");
      const [vx, vy] = viewport.convertToViewportPoint(first.x, first.y);
      const points: number[][] = [];
      for (const item of chunk) {
        const rad = ((item.angle ?? 0) * Math.PI) / 180;
        const endX = item.x + Math.cos(rad) * item.width;
        const endY = item.y + Math.sin(rad) * item.width;
        const upX = item.x - Math.sin(rad) * item.fontSize;
        const upY = item.y + Math.cos(rad) * item.fontSize;
        points.push(
          viewport.convertToViewportPoint(item.x, item.y),
          viewport.convertToViewportPoint(endX, endY),
          viewport.convertToViewportPoint(upX, upY),
        );
      }
      const xs = points.map((p) => p[0]);
      const ys = points.map((p) => p[1]);
      const left = Math.min(...xs);
      const top = Math.min(...ys);
      const right = Math.max(...xs);
      const bottom = Math.max(...ys);
      const padX = 1 / Math.max(viewport.width, 1);
      const padY = 1 / Math.max(viewport.height, 1);
      const editable = angle !== null && !sizesDiffer && !rtl;
      let reason: string | undefined;
      if (angle === null) reason = ODD_ANGLE;
      else if (rtl) reason = RTL;
      else if (sizesDiffer) reason = AMBIGUOUS;
      const text = chunk.map((item) => item.str).join("");
      const advance = chunk.reduce((sum, item) => sum + item.width, 0);
      return {
        id: `p${pageIndex}-a${angle ?? "x"}-${Math.round(left)}-${Math.round(top)}-${index}`,
        pageIndex,
        text,
        items: chunk.map((item) => item.str),
        x: clamp01(left / viewport.width - padX),
        y: clamp01(top / viewport.height - padY),
        w: clamp01((right - left) / viewport.width + padX * 2),
        h: Math.max(0.02, (bottom - top) / viewport.height + padY * 2),
        originX: vx,
        originY: viewport.height - vy,
        advance: Math.max(advance, 1),
        fontSize,
        angle,
        editable,
        reason,
      } satisfies TextLine;
    });
  }).flat();
}
