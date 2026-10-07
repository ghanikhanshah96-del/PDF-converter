import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { termsBlocks, termsMeta, termsTitle } from "@/lib/content/legal/terms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: termsMeta.title,
  description: termsMeta.description,
  alternates: { canonical: `${SITE.url}/terms-and-conditions` },
};

export default function TermsPage() {
  return (
    <ContentPage eyebrow="Legal" title={termsTitle} blocks={termsBlocks} />
  );
}
