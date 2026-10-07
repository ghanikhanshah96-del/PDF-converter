import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import {
  editorialBlocks,
  editorialMeta,
  editorialTitle,
} from "@/lib/content/legal/editorial";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: editorialMeta.title,
  description: editorialMeta.description,
  alternates: { canonical: `${SITE.url}/editorial-policy` },
};

export default function EditorialPolicyPage() {
  return (
    <ContentPage
      eyebrow="Editorial"
      title={editorialTitle}
      blocks={editorialBlocks}
    />
  );
}
