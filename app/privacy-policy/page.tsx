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
        { type: "note", text: "**Reviews and feedback:** When you submit a review, we store the name you provide (or Anonymous user), rating, comment, tool name, and submission time in our database. Selected reviews rated 3?5 stars may appear publicly. Ratings below 3 stars are kept private and sent to our support inbox. A daily hash of your network address is used to limit spam. Review prompt preferences are stored in your browser. Do not include sensitive information; contact us to request removal of your review." },
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
