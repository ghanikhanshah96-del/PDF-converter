export type Rgb = { r: number; g: number; b: number };

const WHITE: Rgb = { r: 1, g: 1, b: 1 };
const INK: Rgb = { r: 0.1, g: 0.1, b: 0.12 };

function quantKey(r: number, g: number, b: number) {
  return `${r >> 4},${g >> 4},${b >> 4}`;
}

function modeColor(pixels: number[][]): Rgb | null {
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (const [r, g, b] of pixels) {
    const key = quantKey(r, g, b);
    const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }
  let best: { n: number; r: number; g: number; b: number } | null = null;
  for (const bucket of buckets.values()) {
    if (!best || bucket.n > best.n) best = bucket;
  }
  if (!best || best.n === 0) return null;
  return { r: best.r / best.n / 255, g: best.g / best.n / 255, b: best.b / best.n / 255 };
}

function luminanceSpread(pixels: number[][]): number {
  if (pixels.length < 2) return 0;
  const values = pixels.map(([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export type LineInk = { x: number; y: number; w: number; h: number };

/** Sample a cover color from just outside a line. A varied ring is marked uncertain. */
export async function sampleLineColors(
  imageUrl: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fontFraction = h,
): Promise<{ cover: Rgb; color: Rgb; uncertain: boolean; ink: LineInk | null }> {
  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx || canvas.width < 2 || canvas.height < 2) {
      return { cover: WHITE, color: INK, uncertain: true, ink: null };
    }
    ctx.drawImage(image, 0, 0);
    const left = Math.max(0, Math.floor(x * canvas.width));
    const top = Math.max(0, Math.floor(y * canvas.height));
    const right = Math.min(canvas.width - 1, Math.ceil((x + w) * canvas.width));
    const bottom = Math.min(canvas.height - 1, Math.ceil((y + h) * canvas.height));
    const region = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const at = (px: number, py: number) => {
      const i = (py * canvas.width + px) * 4;
      return [region[i], region[i + 1], region[i + 2]];
    };
    const outside: number[][] = [];
    for (let px = Math.max(0, left - 3); px <= Math.min(canvas.width - 1, right + 3); px += 2) {
      if (top - 3 >= 0) outside.push(at(px, top - 3));
      if (bottom + 3 < canvas.height) outside.push(at(px, bottom + 3));
    }
    for (let py = top; py <= bottom; py += 2) {
      if (left - 3 >= 0) outside.push(at(left - 3, py));
      if (right + 3 < canvas.width) outside.push(at(right + 3, py));
    }
    const inside: number[][] = [];
    for (let py = top; py <= bottom; py += 2) {
      for (let px = left; px <= right; px += 2) inside.push(at(px, py));
    }
    const cover = modeColor(outside) ?? WHITE;
    const coverPx = [cover.r * 255, cover.g * 255, cover.b * 255];
    const ink = inside.find(([r, g, b]) => {
      const dist = Math.abs(r - coverPx[0]) + Math.abs(g - coverPx[1]) + Math.abs(b - coverPx[2]);
      return dist > 80;
    });
    const em = Math.max(fontFraction, h, 0.01);
    const scanTop = Math.max(0, Math.floor((y - em * 0.35) * canvas.height));
    const scanBottom = Math.min(canvas.height - 1, Math.ceil((y + h + em * 1.15) * canvas.height));
    const scanLeft = Math.max(0, Math.floor((x - em * 0.15) * canvas.width));
    const scanRight = Math.min(canvas.width - 1, Math.ceil((x + w + em * 0.2) * canvas.width));
    let minX = scanRight;
    let minY = scanBottom;
    let maxX = scanLeft;
    let maxY = scanTop;
    let hits = 0;
    for (let py = scanTop; py <= scanBottom; py += 1) {
      for (let px = scanLeft; px <= scanRight; px += 1) {
        const [r, g, b] = at(px, py);
        const dist = Math.abs(r - coverPx[0]) + Math.abs(g - coverPx[1]) + Math.abs(b - coverPx[2]);
        if (dist < 70) continue;
        hits += 1;
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
      }
    }
    const pad = 2;
    const inkBox =
      hits > 6
        ? {
            x: Math.max(0, (minX - pad) / canvas.width),
            y: Math.max(0, (minY - pad) / canvas.height),
            w: Math.min(1, (maxX - minX + pad * 2) / canvas.width),
            h: Math.min(1, (maxY - minY + pad * 2) / canvas.height),
          }
        : null;
    return {
      cover,
      color: ink ? { r: ink[0] / 255, g: ink[1] / 255, b: ink[2] / 255 } : INK,
      uncertain: luminanceSpread(outside) > 28 || inkBox === null,
      ink: inkBox,
    };
  } catch {
    return { cover: WHITE, color: INK, uncertain: true, ink: null };
  }
}
