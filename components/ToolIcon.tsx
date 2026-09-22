import type { ReactNode } from "react";
import type { ToolId } from "@/lib/tools";

const iconClass = "h-6 w-6";

function Svg({ children }: { children: ReactNode }) {
  return (
    <svg
      className={iconClass}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

const icons: Record<ToolId, ReactNode> = {
  "pdf-to-word": (
    <Svg>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6M9 17h4" />
    </Svg>
  ),
  "word-to-pdf": (
    <Svg>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 15l2 3 2-3 2 3 2-3" />
    </Svg>
  ),
  "merge-pdf": (
    <Svg>
      <path d="M8 7H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
      <path d="M10 3h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    </Svg>
  ),
  "split-pdf": (
    <Svg>
      <path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2" />
      <path d="M16 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2" />
      <path d="M12 3v18" />
    </Svg>
  ),
  "compress-pdf": (
    <Svg>
      <path d="M12 3v12" />
      <path d="M8 11l4 4 4-4" />
      <path d="M5 19h14" />
    </Svg>
  ),
  "pdf-to-jpg": (
    <Svg>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="1.5" />
      <path d="M3 16l5-4 4 3 3-2 6 4" />
    </Svg>
  ),
  "jpg-to-pdf": (
    <Svg>
      <rect x="3" y="4" width="10" height="8" rx="1.5" />
      <path d="M14 10h4a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4" />
      <path d="M14 14h4M14 18h2" />
    </Svg>
  ),
  "edit-pdf": (
    <Svg>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </Svg>
  ),
  "pdf-password-remover": (
    <Svg>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <path d="M9 16h6" />
    </Svg>
  ),
  "sign-pdf": (
    <Svg>
      <path d="M4 19c2-4 5-6 8-6s4 1 8 5" />
      <path d="M14 8c1.5-2 3.5-3 5-3" />
      <path d="M4 19h16" />
    </Svg>
  ),
  "excel-to-pdf": (
    <Svg>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8M10 13v4M14 13v4" />
    </Svg>
  ),
  "pdf-to-excel": (
    <Svg>
      <path d="M3 5h18v14H3z" />
      <path d="M3 10h18M3 15h18M9 5v14M15 5v14" />
    </Svg>
  ),
  "rotate-pdf": (
    <Svg>
      <path d="M21 12a9 9 0 1 1-2.6-6.4" />
      <path d="M21 3v6h-6" />
    </Svg>
  ),
  "unlock-pdf": (
    <Svg>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 7.5-2" />
      <circle cx="12" cy="16" r="1" fill="currentColor" stroke="none" />
    </Svg>
  ),
};

const iconColors: Record<ToolId, string> = {
  "pdf-to-word": "#4f7bd9",
  "word-to-pdf": "#4f7bd9",
  "merge-pdf": "#f2614b",
  "split-pdf": "#f2614b",
  "compress-pdf": "#78b957",
  "pdf-to-jpg": "#f0c33c",
  "jpg-to-pdf": "#f0c33c",
  "edit-pdf": "#b45aa0",
  "pdf-password-remover": "#4d78a8",
  "sign-pdf": "#4d78a8",
  "excel-to-pdf": "#58a55c",
  "pdf-to-excel": "#58a55c",
  "rotate-pdf": "#b45aa0",
  "unlock-pdf": "#4d78a8",
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
