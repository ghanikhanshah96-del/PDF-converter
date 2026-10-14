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
          text: `**${SITE.name}** (${SITE.domain}) processes most PDF tools in your browser. Word to PDF is sent to our server for conversion and deleted as soon as the PDF is ready.`,
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
