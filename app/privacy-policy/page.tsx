import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import {
  privacyBlocks,
  privacyMeta,
  privacyTitle,
} from "@/lib/content/legal/privacy";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: privacyMeta.title,
  description: privacyMeta.description,
  alternates: { canonical: `${SITE.url}/privacy-policy` },
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title={privacyTitle}
      blocks={[
        {
          type: "note",
          text: `**${SITE.name}** (${SITE.domain}) is built so core PDF tools process files in your browser. Documents are not intentionally uploaded to our servers for conversion.`,
        },
        ...privacyBlocks,
        {
          type: "link",
          href: "/contact-us",
          label: "Contact Us page",
          before: "Privacy questions: use our ",
          after: " or email support@bestfreepdfconverter.com.",
        },
      ]}
    />
  );
}
