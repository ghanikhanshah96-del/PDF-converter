import type { Metadata } from "next";
import { ContentPage } from "@/components/ContentPage";
import { aboutBlocks, aboutMeta, aboutTitle } from "@/lib/content/legal/about";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: aboutMeta.title,
  description: aboutMeta.description,
  alternates: { canonical: `${SITE.url}/about-us` },
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About"
      title={aboutTitle}
      blocks={[
        ...aboutBlocks,
        {
          type: "link",
          href: "/#tools",
          label: "Explore free PDF tools",
          before: "Ready to get started? ",
          after: ".",
        },
      ]}
    />
  );
}
