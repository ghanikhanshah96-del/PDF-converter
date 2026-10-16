export type QuarterTurn = 0 | 90 | 180 | 270;

export function normalizeRotation(angle: number): QuarterTurn {
  const turn = ((Math.round(angle) % 360) + 360) % 360;
  if (turn === 90 || turn === 180 || turn === 270) return turn;
  return 0;
}

export function viewSize(rotation: number, pageWidth: number, pageHeight: number) {
  const turn = normalizeRotation(rotation);
  if (turn === 90 || turn === 270) return { width: pageHeight, height: pageWidth };
  return { width: pageWidth, height: pageHeight };
}

/** Viewport point, origin at the top left, into unrotated PDF user space. */
export function viewportPointToPdf(
  rotation: number,
  pageWidth: number,
  pageHeight: number,
  vx: number,
  vy: number,
) {
  const turn = normalizeRotation(rotation);
  if (turn === 90) return { x: vy, y: vx };
  if (turn === 180) return { x: pageWidth - vx, y: vy };
  if (turn === 270) return { x: pageWidth - vy, y: pageHeight - vx };
  return { x: vx, y: pageHeight - vy };
}

export function pdfPointToViewport(
  rotation: number,
  pageWidth: number,
  pageHeight: number,
  px: number,
  py: number,
) {
  const turn = normalizeRotation(rotation);
  if (turn === 90) return { x: py, y: px };
  if (turn === 180) return { x: pageWidth - px, y: py };
  if (turn === 270) return { x: pageHeight - py, y: pageWidth - px };
  return { x: px, y: pageHeight - py };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Keep a box on the same page content after the page view turns. */
export function turnFractionBox(
  box: { x: number; y: number; w: number; h: number },
  pageWidth: number,
  pageHeight: number,
  fromRotation: number,
  toRotation: number,
) {
  const from = viewSize(fromRotation, pageWidth, pageHeight);
  const to = viewSize(toRotation, pageWidth, pageHeight);
  const corners = [
    [box.x, box.y],
    [box.x + box.w, box.y],
    [box.x, box.y + box.h],
    [box.x + box.w, box.y + box.h],
  ].map(([fx, fy]) => {
    const pdf = viewportPointToPdf(
      fromRotation,
      pageWidth,
      pageHeight,
      fx * from.width,
      fy * from.height,
    );
    const view = pdfPointToViewport(toRotation, pageWidth, pageHeight, pdf.x, pdf.y);
    return { x: view.x / to.width, y: view.y / to.height };
  });
  const left = Math.min(...corners.map((corner) => corner.x));
  const top = Math.min(...corners.map((corner) => corner.y));
  const right = Math.max(...corners.map((corner) => corner.x));
  const bottom = Math.max(...corners.map((corner) => corner.y));
  const x = clamp(left, 0, 0.98);
  const y = clamp(top, 0, 0.98);
  return {
    x,
    y,
    w: clamp(right - left, 0.02, 1 - x),
    h: clamp(bottom - top, 0.02, 1 - y),
  };
}

/** Draw an image so it stays upright on the rotated page view. */
export function uprightImage(
  rotation: number,
  pageWidth: number,
  pageHeight: number,
  vx: number,
  vy: number,
  vw: number,
  vh: number,
) {
  const turn = normalizeRotation(rotation);
  if (turn === 90) {
    return { x: vy + vh, y: vx, width: vw, height: vh, rotate: 90 as const };
  }
  if (turn === 180) {
    return { x: pageWidth - vx, y: vy + vh, width: vw, height: vh, rotate: 180 as const };
  }
  if (turn === 270) {
    return {
      x: pageWidth - (vy + vh),
      y: pageHeight - vx,
      width: vw,
      height: vh,
      rotate: 270 as const,
    };
  }
  return { x: vx, y: pageHeight - vy - vh, width: vw, height: vh, rotate: 0 as const };
}

/** Baseline of upright text in the rotated page view. */
export function uprightText(
  rotation: number,
  pageWidth: number,
  pageHeight: number,
  vx: number,
  vy: number,
  size: number,
) {
  const turn = normalizeRotation(rotation);
  if (turn === 90) return { x: vy + size, y: vx, rotate: 90 as const };
  if (turn === 180) return { x: pageWidth - vx, y: vy + size, rotate: 180 as const };
  if (turn === 270) return { x: pageWidth - (vy + size), y: pageHeight - vx, rotate: 270 as const };
  return { x: vx, y: pageHeight - vy - size, rotate: 0 as const };
}

export function uprightEllipse(
  rotation: number,
  pageWidth: number,
  pageHeight: number,
  vx: number,
  vy: number,
  vw: number,
  vh: number,
) {
  const center = viewportPointToPdf(
    rotation,
    pageWidth,
    pageHeight,
    vx + vw / 2,
    vy + vh / 2,
  );
  const turn = normalizeRotation(rotation);
  const swap = turn === 90 || turn === 270;
  return {
    x: center.x,
    y: center.y,
    xScale: (swap ? vh : vw) / 2,
    yScale: (swap ? vw : vh) / 2,
  };
}
