"use client";

type Props = {
  disabled?: boolean;
  onTurnPage: (delta: 90 | 270) => void;
  onTurnAll: (delta: 90 | 270) => void;
};

export function PageTurnBar({ disabled, onTurnPage, onTurnAll }: Props) {
  return (
    <div className="mb-4 rounded-[var(--radius)] border border-[var(--line)] p-3">
      <p className="text-sm font-semibold">Turn pages</p>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Turn the page you are looking at, or turn every page the same way.
      </p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !py-2 text-sm"
          disabled={disabled}
          onClick={() => onTurnPage(270)}
        >
          Turn left
        </button>
        <button
          type="button"
          className="btn btn-secondary !min-h-10 !py-2 text-sm"
          disabled={disabled}
          onClick={() => onTurnPage(90)}
        >
          Turn right
        </button>
      </div>
      <button
        type="button"
        className="btn btn-secondary mt-2 w-full !min-h-10 !py-2 text-sm"
        disabled={disabled}
        onClick={() => onTurnAll(90)}
      >
        Turn every page right
      </button>
    </div>
  );
}
