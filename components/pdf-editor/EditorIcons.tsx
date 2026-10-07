/** Thin-line icons matching iLovePDF-style toolbars (24×24). */

type IconProps = { className?: string };

function I({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className ?? "h-5 w-5"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function IconHand(p: IconProps) {
  return (
    <I {...p}>
      <path d="M8 13V7a1.5 1.5 0 0 1 3 0v4" />
      <path d="M11 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M14 10.5V7a1.5 1.5 0 0 1 3 0v7" />
      <path d="M17 13v-1.5a1.5 1.5 0 0 1 3 0V16a5 5 0 0 1-5 5h-1.5a6 6 0 0 1-5.2-3L6 13.5a1.8 1.8 0 0 1 2.5-2.5L8 13" />
    </I>
  );
}

export function IconText(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 7V5h16v2" />
      <path d="M12 5v14" />
      <path d="M8 19h8" />
    </I>
  );
}

export function IconImage(p: IconProps) {
  return (
    <I {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M3 16l5-4 4 3 5-4 4 3" />
    </I>
  );
}

export function IconPen(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </I>
  );
}

export function IconShapes(p: IconProps) {
  return (
    <I {...p}>
      <rect x="3" y="4" width="10" height="8" rx="1" />
      <circle cx="16.5" cy="15.5" r="4.5" />
    </I>
  );
}

export function IconAnnotate(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 19c3-5 6-7 10-7" />
      <path d="M14 12l6-6" />
      <path d="M17 6l1.5-1.5a1.5 1.5 0 0 1 2 2L19 8" />
    </I>
  );
}

export function IconEditMode(p: IconProps) {
  return (
    <I {...p}>
      <path d="M4 20h4L18 10l-4-4L4 16v4z" />
      <path d="M12 8l4 4" />
    </I>
  );
}

export function IconTrash(p: IconProps) {
  return (
    <I {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </I>
  );
}

export function IconBold(p: IconProps) {
  return (
    <I {...p}>
      <path d="M7 5h6a3.5 3.5 0 0 1 0 7H7z" />
      <path d="M7 12h7a3.5 3.5 0 0 1 0 7H7z" />
    </I>
  );
}

export function IconItalic(p: IconProps) {
  return (
    <I {...p}>
      <path d="M10 5h9" />
      <path d="M5 19h9" />
      <path d="M14 5l-5 14" />
    </I>
  );
}

export function IconUnderline(p: IconProps) {
  return (
    <I {...p}>
      <path d="M7 5v7a5 5 0 0 0 10 0V5" />
      <path d="M5 19h14" />
    </I>
  );
}

export function IconZoomIn(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="11" cy="11" r="6" />
      <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
    </I>
  );
}

export function IconZoomOut(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="11" cy="11" r="6" />
      <path d="M21 21l-4.3-4.3M8 11h6" />
    </I>
  );
}

export function IconChevronUp(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 14l6-6 6 6" />
    </I>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 10l6 6 6-6" />
    </I>
  );
}

export function IconClose(p: IconProps) {
  return (
    <I {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </I>
  );
}

export function IconLayer(p: IconProps) {
  return (
    <I {...p}>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </I>
  );
}

export function IconRect(p: IconProps) {
  return (
    <I {...p}>
      <rect x="4" y="6" width="16" height="12" rx="1" />
    </I>
  );
}

export function IconEllipse(p: IconProps) {
  return (
    <I {...p}>
      <ellipse cx="12" cy="12" rx="8" ry="5.5" />
    </I>
  );
}

export function IconLine(p: IconProps) {
  return (
    <I {...p}>
      <path d="M5 19L19 5" />
    </I>
  );
}

export function IconUndo(p: IconProps) {
  return (
    <I {...p}>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </I>
  );
}

export function IconRedo(p: IconProps) {
  return (
    <I {...p}>
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H10a6 6 0 0 0 0 12h3" />
    </I>
  );
}

export function IconInfo(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </I>
  );
}

export function IconArrowRight(p: IconProps) {
  return (
    <I {...p}>
      <circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" />
      <path d="M10 8l4 4-4 4" stroke="#fff" strokeWidth="2" />
    </I>
  );
}
