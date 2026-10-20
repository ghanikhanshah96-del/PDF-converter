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

const pdfToWord = toolsById["pdf-to-word"];
const wordToPdf = toolsById["word-to-pdf"];
const editPdf = toolsById["edit-pdf"];

const toc = [
  { href: "#open-directly", label: "Open a PDF in Word directly" },
  { href: "#convert-online", label: "Use a free online converter" },
  { href: "#looks-different", label: "Why the layout changes" },
  { href: "#privacy", label: "Privacy and limits" },
  { href: "#questions", label: "Common questions" },
] as const;

export function OpenPdfInWordArticle() {
  return (
    <div className="w-full">
      <p className="text-base leading-7 text-[var(--ink)]">
        If you are asking how you can open a PDF file in Word, the simplest path
        is to open the PDF directly in Microsoft Word. Word can convert many PDF
        files into editable documents so you can update text, fix errors, and
        save the result as a Word file.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        You can also use a free online{" "}
        <In href={pdfToWord.href}>PDF to Word converter</In> when you prefer a
        browser-based step before you open the file in Word. Both methods are
        covered below.
      </p>

      <figure className="mt-6">
        <img
          src="/blog/bestfreepdfconverter-open-pdf-in-word.svg"
          alt="Two ways to open a PDF in Word: File Open in Microsoft Word, or convert PDF to DOCX online first"
          width={1200}
          height={525}
          decoding="async"
          className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Open the PDF in Word directly, or convert online to DOCX first, then
          review the layout before editing.
        </figcaption>
      </figure>

      <ArticleToc items={[...toc]} />

      <section className="mt-10" aria-labelledby="open-directly">
        <h2 id="open-directly" className={h2Class}>
          How can I open a PDF file in Word directly?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Microsoft Word can open and convert PDF documents without a separate
          converter app. Follow these steps in a supported desktop version of
          Word:
        </p>
        <ol className="point-grid point-grid-ordered">
          <li>Open Microsoft Word on your computer.</li>
          <li>
            Click <strong>File → Open</strong>.
          </li>
          <li>
            Select <strong>Browse</strong> and locate your PDF file.
          </li>
          <li>
            Choose the PDF and click <strong>Open</strong>.
          </li>
          <li>
            Word will explain that it will convert the PDF into an editable
            document.
          </li>
          <li>
            Click <strong>OK</strong> to continue.
          </li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          When conversion finishes, review and edit the document. To save it as
          a Word file, select <strong>File → Save As</strong>, choose Word
          Document (<code>.docx</code>), and save it where you want.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Your original PDF remains unchanged. Conversion works best with
          text-based documents. Complex tables, images, and page layouts may not
          look exactly the same afterward.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="convert-online">
        <h2 id="convert-online" className={h2Class}>
          How to open a PDF in Word using a free online converter
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If you want to convert the PDF before you open it in Word, use a
          browser-based tool.
        </p>

        <h3 className={h3Class}>Step 1: Open the PDF to Word converter</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Visit the free{" "}
          <In href={pdfToWord.href}>PDF to Word converter</In>. You can use it
          in the browser without installing additional software.
        </p>
        <figure className="mt-4">
          <img
            src="/blog/bestfreepdfconverter-pdf-to-word-steps.svg"
            alt="Four steps to convert a PDF to Word: select PDF, convert in the browser, download DOCX, then edit in Word"
            width={1200}
            height={420}
            decoding="async"
            className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
          />
          <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            Convert in the browser, download the DOCX, then open it in Word.
          </figcaption>
        </figure>

        <h3 className={h3Class}>Step 2: Select your PDF file</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Choose the PDF from your device. The tool supports files up to 50 MB
          each and up to 20 PDF files per batch.
        </p>

        <h3 className={h3Class}>Step 3: Convert PDF to Word</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Select <strong>Convert to Word</strong> and wait until conversion
          finishes.
        </p>

        <h3 className={h3Class}>Step 4: Download and open the DOCX file</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Download the <code>.docx</code> file, then open it in Microsoft Word
          or another compatible editor. Review the text and layout before you
          make changes.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The converter includes PDF pages as images and places available
          selectable text underneath them. Scanned pages without selectable text
          will not automatically become editable.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="looks-different">
        <h2 id="looks-different" className={h2Class}>
          Why does my PDF look different in Microsoft Word?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          PDF and Word use different document models. When Word converts a PDF,
          it tries to recreate the original as editable content. You may notice:
        </p>
        <ul className="point-grid">
          <li>
            <strong>Changed page breaks:</strong> Text can move onto different
            pages.
          </li>
          <li>
            <strong>Different fonts:</strong> Some fonts may be substituted.
          </li>
          <li>
            <strong>Shifted tables:</strong> Complex tables may need adjustment.
          </li>
          <li>
            <strong>Uneditable scanned pages:</strong> Image-based PDFs may need
            OCR before the text can be extracted.
          </li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For better results, start with a PDF that has selectable text and check
          the converted document carefully. Microsoft also explains these limits
          in its guide to{" "}
          <Out href="https://support.microsoft.com/en-us/word/opening-pdfs-in-word">
            opening PDFs in Word
          </Out>
          . If you only need small text changes inside a PDF and want to keep the
          layout, try the{" "}
          <In href={editPdf.href}>Edit PDF</In> tool instead of a full conversion.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="privacy">
        <h2 id="privacy" className={h2Class}>
          Privacy and limits on this site
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Conversion on BestFreePDFConverter runs in your browser for this tool.
          Files are not sent to a conversion server for that step. Read the{" "}
          <In href="/privacy-policy#local-conversion">privacy policy</In> before
          you convert sensitive documents. Always keep your original PDF until
          you confirm the Word file is usable.
        </p>
        <ul className="point-grid">
          <li>Up to 50 MB per file and 20 files per batch.</li>
          <li>No sign-up is required to convert.</li>
          <li>
            To go back to PDF later, use the{" "}
            <In href={wordToPdf.href}>Word to PDF converter</In>.
          </li>
        </ul>
      </section>

      <FAQ
        id="questions"
        heading="Common questions"
        faqs={[
          {
            question: "Can Microsoft Word open PDF files?",
            answer:
              "Yes. Supported desktop versions of Microsoft Word can open PDF files and convert their contents into Word documents.",
          },
          {
            question: "Can I open a PDF in Word for free?",
            answer:
              "If you do not have access to Microsoft Word, you can use a free online PDF to Word converter to create a DOCX file. You still need a compatible application to open or edit the converted document.",
          },
          {
            question: "Can I edit a PDF after opening it in Word?",
            answer:
              "Yes, if Word successfully converts the PDF content into editable text. Image-based or scanned pages may remain uneditable without OCR.",
          },
          {
            question: "Does opening a PDF in Word change the original PDF?",
            answer:
              "No. Microsoft Word creates a converted copy and leaves the original PDF unchanged.",
          },
          {
            question: "What if my PDF is password protected?",
            answer:
              "Unlock the PDF with the correct password first, then open or convert it. Only unlock files you are allowed to open.",
          },
        ]}
      />

      <section className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--brand-soft)] px-4 py-5 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Conclusion
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          You can open a PDF file in Word in two straightforward ways. If you
          have Microsoft Word, use <strong>File → Open</strong> and select your
          PDF. If you prefer an online step first, use the{" "}
          <In href={pdfToWord.href}>free PDF to Word converter</In> to create a
          DOCX file.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Always review the converted document before you edit or share it,
          especially when the original PDF has complex formatting.
        </p>
        <p className="mt-4">
          <Link href={pdfToWord.href} className="btn btn-primary inline-flex">
            Convert PDF to Word
          </Link>
        </p>
      </section>
    </div>
  );
}
