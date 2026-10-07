import type { ReactNode } from "react";
import type { ToolId } from "@/lib/tools";

const iconClass = "h-7 w-7";

function Svg({
  children,
  filled,
}: {
  children: ReactNode;
  filled?: boolean;
}) {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Distinct, iLovePDF-style glyphs so each tool is recognizable at a glance. */
const icons: Record<ToolId, ReactNode> = {
  "merge-pdf": (
    <Svg>
      <path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" />
      <path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M9 12h6" />
      <path d="M12 9l3 3-3 3" />
      <path d="M12 9l-3 3 3 3" />
    </Svg>
  ),
  "split-pdf": (
    <Svg>
      <path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" />
      <path d="M12 3v18" strokeDasharray="2 2" />
      <path d="M9 12H4" />
      <path d="M6 9l-3 3 3 3" />
      <path d="M15 12h5" />
      <path d="M18 9l3 3-3 3" />
    </Svg>
  ),
  "compress-pdf": (
    <Svg>
      <path d="M12 3v6" />
      <path d="M12 15v6" />
      <path d="M9 6l3 3 3-3" />
      <path d="M9 18l3-3 3 3" />
      <path d="M3 12h6" />
      <path d="M15 12h6" />
      <path d="M6 9l3 3-3 3" />
      <path d="M18 9l-3 3 3 3" />
    </Svg>
  ),
  "pdf-to-word": (
    <Svg>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="7"
        fontWeight="700"
        fontFamily="system-ui,sans-serif"
      >
        W
      </text>
    </Svg>
  ),
  "word-to-pdf": (
    <Svg>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="6"
        fontWeight="700"
        fontFamily="system-ui,sans-serif"
      >
        PDF
      </text>
    </Svg>
  ),
  "pdf-to-excel": (
    <Svg>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
        fontSize="7"
        fontWeight="700"
        fontFamily="system-ui,sans-serif"
      >
        X
      </text>
    </Svg>
  ),
  "excel-to-pdf": (
    <Svg>
      <path d="M3 5h18v14H3z" />
      <path d="M3 10h18M9 5v14M15 5v14M3 15h18" />
    </Svg>
  ),
  "pdf-to-jpg": (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="1.6" />
      <path d="M3 16l5-4 4 3 3-2 6 4" />
    </Svg>
  ),
  "jpg-to-pdf": (
    <Svg>
      <rect x="2" y="4" width="11" height="9" rx="1.5" />
      <circle cx="5.5" cy="7.5" r="1" />
      <path d="M2 11l3-2 2 1.5 2-1 4 2.5" />
      <path d="M12 12h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-3" />
    </Svg>
  ),
  "edit-pdf": (
    <Svg>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M11 17l6-6 2 2-6 6H11v-2z" />
    </Svg>
  ),
  "sign-pdf": (
    <Svg>
      <path d="M4 20c2.5-5 6-8 10-8 1.5 0 3 .4 5 1.5" />
      <path d="M15 7c1.2-1.8 2.8-2.8 4.5-3" />
      <path d="M4 20h16" />
      <path d="M14 11l2.5-5 1.5 1-2.5 5z" />
    </Svg>
  ),
  "rotate-pdf": (
    <Svg>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
      <path d="M9 12h.01M12 12h.01M15 12h.01" />
    </Svg>
  ),
  "unlock-pdf": (
    <Svg>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.2-2.4" />
      <circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  ),
  "pdf-password-remover": (
    <Svg>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M10 16h4" />
      <path d="M19 7l2 2M21 7l-2 2" />
    </Svg>
  ),
};

const iconColors: Record<ToolId, string> = {
  "merge-pdf": "#f2614b",
  "split-pdf": "#f2614b",
  "compress-pdf": "#78b957",
  "pdf-to-word": "#4f7bd9",
  "word-to-pdf": "#4f7bd9",
  "pdf-to-excel": "#58a55c",
  "excel-to-pdf": "#58a55c",
  "pdf-to-jpg": "#f0c33c",
  "jpg-to-pdf": "#f0c33c",
  "edit-pdf": "#b45aa0",
  "sign-pdf": "#4d78a8",
  "rotate-pdf": "#b45aa0",
  "unlock-pdf": "#4d78a8",
  "pdf-password-remover": "#4d78a8",
};

export function ToolIcon({ id }: { id: ToolId }) {
  return (
    <span
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white"
      style={{ backgroundColor: iconColors[id] }}
      aria-hidden="true"
    >
      {icons[id]}
    </span>
  );
}
