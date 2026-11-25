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
  { href: "#compress-windows", label: "Compress on Windows" },
  { href: "#built-in-tools", label: "Windows built-in tools" },
  { href: "#word-export", label: "Reduce size in Word" },
  { href: "#still-too-large", label: "If it is still too large" },
  { href: "#under-10mb", label: "Below 10 MB" },
  { href: "#privacy", label: "Privacy and limits" },
  { href: "#questions", label: "Common questions" },
] as const;

export function CompressPdfInWindowsArticle() {
  return (
    <div className="w-full">
      <p className="text-base leading-7 text-[var(--ink)]">
        Wondering how to compress a PDF in Windows without installing software?
        You can use a free online PDF compressor to reduce file size directly in
        Microsoft Edge, Chrome, or another browser.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        This is useful when your PDF is too large for an email attachment,
        online form, or document upload. Start with the free{" "}
        <In href={compressPdf.href}>Compress PDF</In> tool.
      </p>

      <figure className="mt-6">
        <img
          src="/blog/bestfreepdfconverter-compress-pdf-windows.svg"
          alt="Diagram of compressing a PDF on Windows 10 or 11 in a browser, then checking the smaller file in File Explorer"
          width={1200}
          height={525}
          decoding="async"
          className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Compress in Edge or Chrome, then compare sizes in File Explorer
          Properties.
        </figcaption>
      </figure>

      <ArticleToc items={[...toc]} />

      <section className="mt-10" aria-labelledby="compress-windows">
        <h2 id="compress-windows" className={h2Class}>
          How to compress a PDF in Windows for free
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Follow these steps on Windows 10 or Windows 11.
        </p>

        <h3 className={h3Class}>Step 1: Open a PDF compressor</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Visit the{" "}
          <In href={compressPdf.href}>free online PDF compressor</In>. The tool
          runs in your browser and processes files locally on your device.
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
            Choose High, Medium, or Low, then download and check the new size.
          </figcaption>
        </figure>

        <h3 className={h3Class}>Step 2: Select your PDF file</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Click the upload area or drag and drop your PDF from File Explorer.
          The tool supports files up to 50 MB each and allows up to 20 PDFs per
          batch.
        </p>

        <h3 className={h3Class}>Step 3: Choose compression quality</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Select a setting based on your needs:
        </p>
        <ul className="point-grid">
          <li>
            <strong>High quality:</strong> Keeps pages sharper, usually with a
            larger output file.
          </li>
          <li>
            <strong>Medium quality:</strong> Balances file size and
            readability.
          </li>
          <li>
            <strong>Low quality:</strong> Prioritizes a smaller file size.
          </li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Start with Medium if you&apos;re unsure which setting to use.
        </p>

        <h3 className={h3Class}>Step 4: Compress and download</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Click <strong>Compress PDF</strong> and download the resulting file.
          To check whether compression worked, right-click the downloaded PDF in
          File Explorer, select <strong>Properties</strong>, and compare its
          size with the original.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Open the PDF to confirm that the text and images remain readable.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="built-in-tools">
        <h2 id="built-in-tools" className={h2Class}>
          Can you compress a PDF using Windows built-in tools?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Windows 10 and 11 include Microsoft Print to PDF, but it is primarily
          a PDF creation feature, not a dedicated compressor.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Printing an existing PDF to a new PDF may change its file size, but it
          doesn&apos;t provide reliable compression controls. It can also affect
          features such as bookmarks, hyperlinks, and interactive forms.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For predictable quality settings, use a dedicated{" "}
          <In href={compressPdf.href}>PDF compression tool</In>.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="word-export">
        <h2 id="word-export" className={h2Class}>
          How to reduce PDF size in Microsoft Word
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If you still have the original Word document, exporting it again may
          be another option.
        </p>
        <ol className="point-grid point-grid-ordered">
          <li>Open the document in Microsoft Word.</li>
          <li>
            Select <strong>File → Save As</strong> or{" "}
            <strong>Save a Copy</strong>.
          </li>
          <li>Choose PDF as the file format.</li>
          <li>
            Select <strong>Minimum size</strong> if your version offers that
            optimization option.
          </li>
          <li>Save the PDF and check its file size.</li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Microsoft documents smaller-file export options in its{" "}
          <Out href="https://support.microsoft.com/en-us/office/save-or-convert-to-pdf-or-xps-in-office-desktop-apps-d85416c5-7d77-4fd6-a216-6f4bf7c7c110">
            official PDF export guidance
          </Out>
          . For additional instructions, see our guide on{" "}
          <In href="/blog/how-to-download-word-document-as-pdf">
            how to save a Word document as a PDF
          </In>
          .
        </p>
      </section>

      <section className="mt-10" aria-labelledby="still-too-large">
        <h2 id="still-too-large" className={h2Class}>
          What if your PDF is still too large?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Some PDFs don&apos;t shrink significantly because their content is
          already compressed.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If your file remains too large:
        </p>
        <ul className="point-grid">
          <li>
            <strong>Check large images:</strong> High-resolution photographs and
            scanned pages can increase PDF size.
          </li>
          <li>
            <strong>Remove unnecessary pages:</strong> Use the free{" "}
            <In href={splitPdf.href}>PDF Splitter</In> if you only need specific
            pages.
          </li>
          <li>
            <strong>Adjust compression quality:</strong> Try a stronger setting,
            then inspect the output.
          </li>
          <li>
            <strong>Optimize the original document:</strong> Reduce oversized
            images before creating the PDF again.
          </li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Adobe&apos;s{" "}
          <Out href="https://helpx.adobe.com/acrobat/using/optimizing-pdfs-acrobat-pro.html">
            PDF optimization guidance
          </Out>{" "}
          explains how image compression and other document settings affect file
          size. For more detail, read{" "}
          <In href="/blog/what-does-compressing-a-pdf-do">
            what compressing a PDF does
          </In>
          .
        </p>
      </section>

      <section className="mt-10" aria-labelledby="under-10mb">
        <h2 id="under-10mb" className={h2Class}>
          How to compress a PDF below 10 MB on Windows
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If a website requires a PDF smaller than 10 MB, first check the
          original file size.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For example, a 20 MB PDF needs more than a 50% reduction to become
          smaller than 10 MB. Compression may achieve this, but the result
          depends on the PDF&apos;s contents.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Our guide on{" "}
          <In href="/blog/how-to-make-a-file-less-than-10-mb">
            how to make a file less than 10 MB
          </In>{" "}
          explains additional options for meeting upload limits.
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
          you compress sensitive documents. Keep the original until you confirm
          the smaller copy is readable.
        </p>
        <ul className="point-grid">
          <li>Up to 50 MB per file and 20 files per batch.</li>
          <li>No sign-up is required to compress.</li>
          <li>
            Compression creates a new file. Your original PDF stays on your
            device unless you delete it.
          </li>
        </ul>
      </section>

      <FAQ
        id="questions"
        heading="Frequently asked questions"
        faqs={[
          {
            question: "Can I compress a PDF on Windows 11 for free?",
            answer:
              "Yes. A browser-based PDF compressor can reduce file size without requiring paid desktop software.",
          },
          {
            question: "Can I compress a PDF without losing quality?",
            answer:
              "Some PDFs can be optimized without noticeable visual changes. However, stronger compression may reduce the sharpness of images and scanned text.",
          },
          {
            question: "Why isn't my PDF getting smaller?",
            answer:
              "The PDF may already be optimized, contain mostly text, or include data that the selected compression method cannot reduce further.",
          },
        ]}
      />

      <section className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--brand-soft)] px-4 py-5 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Conclusion
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Learning how to compress a PDF in Windows is straightforward. Open a
          PDF compressor, select your file, choose a quality setting, and
          download the smaller version.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For the best results, compare file sizes, check readability, and keep
          the original document as a backup. Use the{" "}
          <In href={compressPdf.href}>free PDF compressor</In> in Edge or
          Chrome when you need a smaller file without installing software.
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
