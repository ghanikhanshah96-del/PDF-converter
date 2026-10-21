"use client";

import type { MouseEvent } from "react";

export function CmsArticleContent({ html }: { html: string }) {
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>("button[aria-controls]");
    if (!button || !event.currentTarget.contains(button)) return;
    const id = button.getAttribute("aria-controls");
    const panel = id ? event.currentTarget.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`) : null;
    if (!panel?.classList.contains("faq-panel")) return;
    const opening = button.getAttribute("aria-expanded") !== "true";
    const section = button.closest("section") || event.currentTarget;
    section.querySelectorAll<HTMLButtonElement>("button[aria-controls]").forEach(control => {
      const controlledId = control.getAttribute("aria-controls");
      const controlled = controlledId ? section.querySelector<HTMLElement>(`[id="${CSS.escape(controlledId)}"]`) : null;
      if (!controlled?.classList.contains("faq-panel")) return;
      const open = control === button && opening;
      control.setAttribute("aria-expanded", String(open));
      control.querySelector<HTMLElement>(".faq-plus")?.setAttribute("data-open", String(open));
      controlled.setAttribute("aria-hidden", String(!open));
      controlled.dataset.open = String(open);
      controlled.querySelector(".faq-panel-inner")?.toggleAttribute("inert", !open);
    });
  };
  return <div className="cms-article-content" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />;
}
