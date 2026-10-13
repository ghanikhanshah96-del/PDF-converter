"use client";

import { useId, useState, type ReactNode } from "react";

export function ContactDetails({ children }: { children: ReactNode }) {
  const uid = useId();
  const [open, setOpen] = useState(false);
  const panelId = `${uid}-panel`;
  const buttonId = `${uid}-button`;

  return (
    <section className="rounded-[var(--radius)] border border-[var(--line)] bg-white shadow-[var(--shadow)]">
      <h2 className="sr-only" id={`${uid}-heading`}>
        More information
      </h2>
      <button
        id={buttonId}
        type="button"
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--brand)] sm:text-xs">
            Helpful details
          </span>
          <span className="mt-1 block font-display text-lg font-bold text-[var(--ink)] sm:text-xl">
            More information
          </span>
          <span className="mt-1 block text-sm text-[var(--ink-muted)]">
            Response times, what to include, and how we handle your message.
          </span>
        </span>
        <span
          className="faq-plus grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-lg leading-none text-[var(--brand)]"
          data-open={open ? "true" : "false"}
          aria-hidden
        >
          +
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="faq-panel"
        data-open={open ? "true" : "false"}
      >
        <div className="faq-panel-inner" inert={open ? undefined : true}>
          <div className="border-t border-[var(--line)] px-3 py-4 sm:px-5 sm:py-5">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
