"use client";

import type { ToolFaq } from "@/lib/tools";
import type { FaqVariant } from "@/lib/content/toolLayouts";
import { FAQ } from "@/components/FAQ";

/** Every tool page uses the same accordion as the homepage. */
export function ToolFaqBlock({
  faqs,
  heading,
}: {
  faqs: ToolFaq[];
  heading: string;
  variant?: FaqVariant;
}) {
  return <FAQ faqs={faqs} heading={heading} />;
}
