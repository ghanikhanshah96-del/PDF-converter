import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import {
  disclaimerBlocks,
  disclaimerMeta,
  disclaimerTitle,
} from "@/lib/content/legal/disclaimer";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: disclaimerMeta.title,
  description: disclaimerMeta.description,
  alternates: { canonical: `${SITE.url}/disclaimer` },
};

export default function DisclaimerPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title={disclaimerTitle}
      blocks={disclaimerBlocks}
    />
  );
}
