import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import {
  ArticleToc,
  h2Class,
  h3Class,
  In,
  Out,
} from "@/components/blog/articleUi";
import { toolsById } from "@/lib/tools";

const compressPdf = toolsById["compress-pdf"];
const splitPdf = toolsById["split-pdf"];

const toc = [
  { href: "#compress-online", label: "Compress a PDF online" },
  { href: "#word-document", label: "Reduce a Word file" },
  { href: "#image-file", label: "Shrink an image" },
  { href: "#check-size", label: "Check the file size" },
  { href: "#privacy", label: "Privacy and limits" },
  { href: "#questions", label: "Common questions" },
] as const;

export function MakeFileLessThan10MbArticle() {
  return (
    <div className="w-full">
      <p className="text-base leading-7 text-[var(--ink)]">
        Wondering how to make a file less than 10 MB for an online form or email
        attachment? The simplest solution is to compress the file, reduce large
        images, or remove unnecessary content.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        The best method depends on whether you are working with a PDF, Word
        document, or image. For PDFs, start with the free{" "}
        <In href={compressPdf.href}>Compress PDF</In> tool.
      </p>

      <figure className="mt-6">
        <img
          src="/blog/bestfreepdfconverter-file-under-10mb.svg"
          alt="Diagram of reducing a PDF, Word document, and image so each file is under 10 MB"
          width={1200}
          height={525}
          decoding="async"
          className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Compress a PDF, shrink pictures in Word, or resize an image, then
          confirm the result is under 10 MB.
        </figcaption>
      </figure>

      <ArticleToc items={[...toc]} />

      <section className="mt-10" aria-labelledby="compress-online">
        <h2 id="compress-online" className={h2Class}>
          How to make a file less than 10 MB online
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If your file is a PDF, a browser-based compression tool is a convenient
          option.
        </p>

        <h3 className={h3Class}>Step 1: Open a PDF compressor</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Visit BestFreePDFConverter and select the{" "}
          <In href={compressPdf.href}>Compress PDF</In> tool.
        </p>
        <figure className="mt-4">
          <img
            src="/blog/bestfreepdfconverter-compress-pdf-steps.svg"
            alt="Four steps to compress a PDF: open the compressor, select the PDF, choose quality, then download and check the size"
            width={1200}
            height={420}
            decoding="async"
            className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
          />
          <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            Choose High, Medium, or Low quality, then download and check the new
            size.
          </figcaption>
        </figure>

        <h3 className={h3Class}>Step 2: Select your PDF</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Choose the PDF you want to reduce. The tool supports files up to 50 MB
          each and allows up to 20 PDFs per batch.
        </p>

        <h3 className={h3Class}>Step 3: Choose a compression level</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Select one of the available quality settings:
        </p>
        <ul className="point-grid">
          <li>
            <strong>High:</strong> Better image quality, potentially larger
            output.
          </li>
          <li>
            <strong>Medium:</strong> Balance between quality and file size.
          </li>
          <li>
            <strong>Low:</strong> Smaller output, potentially lower image
            quality.
          </li>
        </ul>

        <h3 className={h3Class}>Step 4: Compress and download</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Click <strong>Compress PDF</strong> and download the result. Check the
          new file size. If it is still 10 MB or larger, try a stronger
          compression setting or remove unnecessary pages with the{" "}
          <In href={splitPdf.href}>Split PDF</In> tool.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Compression cannot guarantee that every PDF will become smaller than
          10 MB.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="word-document">
        <h2 id="word-document" className={h2Class}>
          How to reduce a Word document below 10 MB
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Word documents often become large because they contain high-resolution
          pictures. To reduce their size in Microsoft Word:
        </p>
        <ol className="point-grid point-grid-ordered">
          <li>Open your document.</li>
          <li>Select a picture.</li>
          <li>
            Go to <strong>Picture Format → Compress Pictures</strong>.
          </li>
          <li>
            Clear <strong>Apply only to this picture</strong> to compress all
            pictures.
          </li>
          <li>Choose a suitable lower resolution.</li>
          <li>Save the document and check its file size.</li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          You can also remove unnecessary images or embedded content. Microsoft
          provides additional instructions for{" "}
          <Out href="https://support.microsoft.com/en-us/office/reduce-the-file-size-of-a-picture-in-microsoft-office-8db9f184-c8ca-4d93-be85-2683f297597b">
            reducing Word document size
          </Out>
          .
        </p>
      </section>

      <section className="mt-10" aria-labelledby="image-file">
        <h2 id="image-file" className={h2Class}>
          How to make an image file less than 10 MB
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If you are uploading a JPG or PNG image, try these methods:
        </p>
        <ul className="point-grid">
          <li>
            <strong>Resize the image:</strong> Reduce its pixel dimensions if
            the original is larger than needed.
          </li>
          <li>
            <strong>Compress the image:</strong> Use an image compression tool
            to reduce file size.
          </li>
          <li>
            <strong>Change the format:</strong> Converting a photographic PNG to
            JPG may produce a smaller file.
          </li>
          <li>
            <strong>Adjust image quality:</strong> Lower JPG quality slightly
            and compare the result.
          </li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Always check that important text or details remain readable.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="check-size">
        <h2 id="check-size" className={h2Class}>
          How to check if your file is under 10 MB
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          After compression, confirm the file size before uploading.
        </p>
        <ul className="point-grid">
          <li>
            <strong>On Windows:</strong> Right-click the file, select{" "}
            <strong>Properties</strong>, and check Size.
          </li>
          <li>
            <strong>On Mac:</strong> Select the file, press{" "}
            <strong>Command + I</strong>, and check the size in the information
            window.
          </li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If a website requires a file smaller than 10 MB, aim slightly below
          the limit rather than exactly 10 MB.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="privacy">
        <h2 id="privacy" className={h2Class}>
          Privacy and limits on this site
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          PDF compression on BestFreePDFConverter runs in your browser. Files
          are not sent to a compression server for that step. Read the{" "}
          <In href="/privacy-policy#local-conversion">privacy policy</In> before
          you compress sensitive documents. Keep the original file until you
          confirm the smaller copy is readable and under the limit.
        </p>
        <ul className="point-grid">
          <li>Up to 50 MB per file and 20 files per batch.</li>
          <li>No sign-up is required to compress.</li>
          <li>
            Results vary. A PDF that is already compact, or that is mostly
            images, may stay above 10 MB even after a low-quality pass.
          </li>
        </ul>
      </section>

      <FAQ
        id="questions"
        heading="Frequently asked questions"
        faqs={[
          {
            question: "Can I reduce a PDF to less than 10 MB for free?",
            answer:
              "Yes. A free PDF compressor may reduce your document below 10 MB, depending on its original size and contents.",
          },
          {
            question: "Will compressing a file reduce its quality?",
            answer:
              "It depends on the method. Image compression and lowering resolution can reduce visual quality, while some other file optimizations preserve the original content.",
          },
          {
            question: "Can I use ZIP to make a file smaller than 10 MB?",
            answer:
              "Sometimes. ZIP compression can reduce file size, but it may not help much with already compressed PDFs or JPG images. Also, some upload forms don't accept ZIP files.",
          },
        ]}
      />

      <section className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--brand-soft)] px-4 py-5 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Conclusion
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Now you know how to make a file less than 10 MB using compression,
          image resizing, and document optimization.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For PDFs, visit BestFreePDFConverter and use its{" "}
          <In href={compressPdf.href}>compression tool</In>. For Word documents
          and images, reduce unnecessary content and lower image resolution
          where appropriate. Always verify the final file size and readability
          before uploading or sharing.
        </p>
        <p className="mt-4">
          <Link href={compressPdf.href} className="btn btn-primary inline-flex">
            Compress PDF
          </Link>
        </p>
      </section>
    </div>
  );
}
