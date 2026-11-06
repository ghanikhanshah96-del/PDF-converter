import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import { ArticleToc, h2Class, h3Class, In } from "@/components/blog/articleUi";
import { toolsById } from "@/lib/tools";

const pdfToJpg = toolsById["pdf-to-jpg"];

const toc = [
  { href: "#convert-online", label: "Save a PDF as JPEG online" },
  { href: "#mac-preview", label: "Save as JPEG on Mac" },
  { href: "#multi-page", label: "Multi-page PDFs" },
  { href: "#quality", label: "Does quality drop?" },
  { href: "#privacy", label: "Privacy and limits" },
  { href: "#questions", label: "Common questions" },
] as const;

export function SavePdfAsJpegArticle() {
  return (
    <div className="w-full">
      <p className="text-base leading-7 text-[var(--ink)]">
        Wondering how do I save a PDF as a JPEG? You can convert PDF pages into
        JPEG images using a free online converter or the Preview app on a Mac.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        JPEG and JPG are the same image format. Converting a PDF to JPG is
        useful when you need to share a document page as a picture, insert it
        into a presentation, or upload it to a website that accepts images. The
        free{" "}
        <In href={pdfToJpg.href}>PDF to JPG converter</In> does this in the
        browser.
      </p>

      <figure className="mt-6">
        <img
          src="/blog/bestfreepdfconverter-pdf-to-jpeg.svg"
          alt="Diagram of a PDF becoming separate JPEG images, one file per page"
          width={1200}
          height={525}
          decoding="async"
          className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Each PDF page becomes its own JPEG. JPG and JPEG refer to the same
          format.
        </figcaption>
      </figure>

      <ArticleToc items={[...toc]} />

      <section className="mt-10" aria-labelledby="convert-online">
        <h2 id="convert-online" className={h2Class}>
          How do I save a PDF as a JPEG online for free?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A browser-based PDF to JPG converter works on Windows, Mac, and mobile
          devices.
        </p>

        <h3 className={h3Class}>Step 1: Open the PDF to JPG converter</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Visit the free{" "}
          <In href={pdfToJpg.href}>PDF to JPG converter</In>. You don&apos;t
          need to install additional software or create an account.
        </p>
        <figure className="mt-4">
          <img
            src="/blog/bestfreepdfconverter-pdf-to-jpeg-steps.svg"
            alt="Four steps to save a PDF as JPEG: open the converter, select the PDF, convert, then download the images"
            width={1200}
            height={420}
            decoding="async"
            className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
          />
          <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            Convert to JPG, then download and check each image.
          </figcaption>
        </figure>

        <h3 className={h3Class}>Step 2: Select your PDF</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Choose the PDF file you want to convert. The converter supports PDF
          files up to 50 MB each and allows up to 20 files per batch.
        </p>

        <h3 className={h3Class}>Step 3: Convert PDF to JPEG</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Click <strong>Convert to JPG</strong>. The tool converts each PDF page
          into a separate JPG image.
        </p>

        <h3 className={h3Class}>Step 4: Download your images</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Download the converted JPG files. Open the images to check that the
          text, graphics, and page layout are clear.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="mac-preview">
        <h2 id="mac-preview" className={h2Class}>
          How to save a PDF as JPEG on Mac
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If you&apos;re using a Mac, you can export a PDF page as a JPEG using
          Preview.
        </p>
        <ol className="point-grid point-grid-ordered">
          <li>Open your PDF in Preview.</li>
          <li>Select the page you want to save.</li>
          <li>
            Click <strong>File → Export</strong>.
          </li>
          <li>
            Choose <strong>JPEG</strong> from the Format menu.
          </li>
          <li>Adjust the image quality if needed.</li>
          <li>
            Click <strong>Save</strong>.
          </li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The selected PDF page is saved as a JPEG image. For a multi-page PDF,
          you can repeat the process for individual pages or use an{" "}
          <In href={pdfToJpg.href}>online converter</In> to convert all pages.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="multi-page">
        <h2 id="multi-page" className={h2Class}>
          How to convert a multi-page PDF to JPG
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A PDF can contain several pages, but a standard JPG file contains only
          one image. When converting a multi-page PDF, each page is usually
          saved as a separate JPG.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For example, a five-page PDF produces five JPG images. This is useful
          when you want to share individual pages without sending the entire PDF
          document.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="quality">
        <h2 id="quality" className={h2Class}>
          Does converting PDF to JPEG reduce quality?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Image quality depends on the original PDF and the conversion settings.
          JPEG uses lossy compression, which may reduce image sharpness,
          especially around small text and detailed graphics.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For better results:
        </p>
        <ul className="point-grid">
          <li>Start with a clear, high-quality PDF.</li>
          <li>
            Choose a suitable image resolution if the converter offers that
            option.
          </li>
          <li>Check that small text remains readable.</li>
          <li>Keep the original PDF for future editing.</li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Remember: converting a PDF page to JPEG turns it into an image. The
          text will no longer be directly selectable or editable as ordinary PDF
          text.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="privacy">
        <h2 id="privacy" className={h2Class}>
          Privacy and limits on this site
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          PDF to JPG conversion on BestFreePDFConverter runs in your browser.
          Files are not sent to a conversion server for that step. Read the{" "}
          <In href="/privacy-policy#local-conversion">privacy policy</In> before
          you convert sensitive documents. Keep the original PDF until you
          confirm the images are clear.
        </p>
        <ul className="point-grid">
          <li>Up to 50 MB per file and 20 files per batch.</li>
          <li>No sign-up is required to convert.</li>
          <li>
            Conversion creates new image files. Your original PDF stays on your
            device unless you delete it.
          </li>
        </ul>
      </section>

      <FAQ
        id="questions"
        heading="Frequently asked questions"
        faqs={[
          {
            question: "Can I save a PDF as a JPEG for free?",
            answer:
              "Yes. You can use a free online PDF to JPG converter without installing additional software.",
          },
          {
            question: "Is JPG the same as JPEG?",
            answer:
              "Yes. JPG and JPEG refer to the same image format. The different extensions do not change the file format.",
          },
          {
            question: "Can I convert every page of a PDF to JPEG?",
            answer:
              "Yes. A PDF to JPG converter can save each page of a multi-page PDF as a separate image.",
          },
          {
            question: "Can I save a PDF as a JPEG on Windows?",
            answer:
              "Yes. You can use a browser-based PDF to JPG converter on Windows without installing a dedicated application.",
          },
        ]}
      />

      <section className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--brand-soft)] px-4 py-5 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Conclusion
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          So, how do I save a PDF as a JPEG? The simplest method is to convert
          your PDF pages into JPG images using an online converter. Mac users
          can also export individual pages through Preview.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For a quick browser-based solution, use the{" "}
          <In href={pdfToJpg.href}>free PDF to JPG converter</In> to convert
          and download your PDF pages as images.
        </p>
        <p className="mt-4">
          <Link href={pdfToJpg.href} className="btn btn-primary inline-flex">
            Convert PDF to JPG
          </Link>
        </p>
      </section>
    </div>
  );
}
