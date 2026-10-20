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
const pdfToJpg = toolsById["pdf-to-jpg"];

const toc = [
  { href: "#attach-pdf", label: "Add PDF as an attachment" },
  { href: "#convert-online", label: "Insert content with a converter" },
  { href: "#open-in-word", label: "Open the PDF in Word" },
  { href: "#multiple-pages", label: "Multiple PDF pages" },
  { href: "#formatting", label: "Why formatting changes" },
  { href: "#privacy", label: "Privacy and limits" },
  { href: "#questions", label: "Common questions" },
] as const;

export function AddPdfToWordArticle() {
  return (
    <div className="w-full">
      <p className="text-base leading-7 text-[var(--ink)]">
        Want to add a PDF to a Word document without retyping it? You can insert
        the PDF as an attachment, convert it into a Word file, or open it in
        Microsoft Word and copy the parts you need.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        The right method depends on the result you need. If readers should open
        the original PDF, embed it as an object. If you need the content inside
        your document, converting with the{" "}
        <In href={pdfToWord.href}>PDF to Word converter</In> is usually more
        practical.
      </p>

      <figure className="mt-6">
        {/* Native img keeps SVG sharp and avoids next/image edge cases. */}
        <img
          src="/blog/bestfreepdfconverter-add-pdf-to-word.svg"
          alt="Three ways to add a PDF to Word: attach as an object, convert PDF to DOCX, or open the PDF in Microsoft Word"
          width={1200}
          height={525}
          decoding="async"
          className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Choose attach, convert, or open in Word based on whether you need the
          original PDF file or editable text.
        </figcaption>
      </figure>

      <ArticleToc items={[...toc]} />

      <section className="mt-10" aria-labelledby="attach-pdf">
        <h2 id="attach-pdf" className={h2Class}>
          How to add a PDF to a Word document as an attachment
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Microsoft Word can embed a PDF file inside a document so readers can
          open the original file from an icon or preview.
        </p>
        <ol className="point-grid point-grid-ordered">
          <li>Open your document in Microsoft Word.</li>
          <li>Place the cursor where you want to insert the PDF.</li>
          <li>
            Select <strong>Insert → Object</strong>.
          </li>
          <li>
            Choose <strong>Create from File</strong>.
          </li>
          <li>
            Click <strong>Browse</strong> and select your PDF.
          </li>
          <li>
            Check <strong>Display as icon</strong> if you want a clickable
            attachment.
          </li>
          <li>
            Click <strong>OK</strong>.
          </li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Readers using compatible desktop software can open the embedded file
          by double-clicking its icon. Embedding a PDF does not turn every page
          into editable Word text.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="convert-online">
        <h2 id="convert-online" className={h2Class}>
          How to insert PDF content into Word using a free converter
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If you want to reuse PDF content in an existing Word document, convert
          the PDF to DOCX first, then copy the sections you need.
        </p>

        <h3 className={h3Class}>Step 1: Open the PDF to Word converter</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Visit the free{" "}
          <In href={pdfToWord.href}>PDF to Word converter</In> on
          BestFreePDFConverter.com. The tool runs in your browser and does not
          require desktop conversion software.
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
            Select the PDF, convert in the browser, download the DOCX, then open
            it in Word.
          </figcaption>
        </figure>

        <h3 className={h3Class}>Step 2: Select your PDF</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Choose the PDF from your device. The converter accepts files up to 50
          MB each and up to 20 PDFs per batch.
        </p>

        <h3 className={h3Class}>Step 3: Convert PDF to Word</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Select <strong>Convert to Word</strong> and download the DOCX when
          conversion finishes.
        </p>

        <h3 className={h3Class}>Step 4: Add the content to your Word document</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Open the DOCX in Microsoft Word or another compatible editor. Copy the
          content you need, paste it into your existing document, and review the
          layout before you save.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The converter keeps PDF pages as images and places available
          selectable text underneath. The output may need adjustments. Scanned
          text does not become fully editable by itself.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="open-in-word">
        <h2 id="open-in-word" className={h2Class}>
          How to open a PDF directly in Microsoft Word
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Supported desktop versions of Microsoft Word can convert many PDFs
          into editable documents.
        </p>
        <ol className="point-grid point-grid-ordered">
          <li>Open Microsoft Word.</li>
          <li>
            Select <strong>File → Open</strong>.
          </li>
          <li>Browse to your PDF file.</li>
          <li>
            Click <strong>Open</strong>.
          </li>
          <li>Confirm the conversion when Word displays a message.</li>
          <li>Copy the required content into your original Word document.</li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          This method works best with text-based PDFs. Complex layouts, scanned
          pages, and tables may not convert perfectly. Microsoft documents the
          process in its guide to{" "}
          <Out href="https://support.microsoft.com/en-us/word/training/edit-a-pdf">
            editing a PDF in Word
          </Out>
          .
        </p>
      </section>

      <section className="mt-10" aria-labelledby="multiple-pages">
        <h2 id="multiple-pages" className={h2Class}>
          Can you insert multiple PDF pages into Word?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Yes. The best approach depends on how you want the pages to appear.
        </p>
        <ul className="point-grid">
          <li>
            <strong>As an attachment:</strong> Embed the PDF as an object.
            Readers can open the complete file, but its pages do not appear as
            separate Word pages.
          </li>
          <li>
            <strong>As document content:</strong> Convert the PDF to Word, then
            copy or insert the required sections.
          </li>
          <li>
            <strong>As images:</strong> Convert PDF pages with the{" "}
            <In href={pdfToJpg.href}>PDF to JPG</In> tool, then use{" "}
            <strong>Insert → Pictures</strong>. The pages stay visible, but the
            text is not directly editable.
          </li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For a report that should show several readable pages inline, converting
          the file or inserting page images is usually better than embedding an
          attachment.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="formatting">
        <h2 id="formatting" className={h2Class}>
          Why does PDF formatting change in Word?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          PDF and Word handle page layouts differently, so conversion can change
          some elements. That is normal and not a sign that the file was
          damaged.
        </p>
        <ul className="point-grid">
          <li>
            <strong>Fonts changing:</strong> The original fonts may not be
            available on your computer.
          </li>
          <li>
            <strong>Tables shifting:</strong> Complex table layouts may need
            manual adjustment.
          </li>
          <li>
            <strong>Page breaks moving:</strong> Converted content may flow
            differently across pages.
          </li>
          <li>
            <strong>Scanned text staying uneditable:</strong> Image-only PDFs
            need optical character recognition (OCR) before the text can be
            edited.
          </li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Always review the converted document before you share or submit it.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="privacy">
        <h2 id="privacy" className={h2Class}>
          Privacy and limits on this site
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The BestFreePDFConverter PDF to Word tool processes files in your
          browser. It does not upload your PDF to a conversion server for this
          step. Read the{" "}
          <In href="/privacy-policy#local-conversion">privacy policy</In> before
          you convert contracts or other confidential files. Browser processing
          does not replace your own care when you share the download.
        </p>
        <ul className="point-grid">
          <li>Maximum 50 MB per file and up to 20 files per batch.</li>
          <li>No account is required to use the converter.</li>
          <li>Keep the original PDF until you are satisfied with the result.</li>
          <li>
            Need a PDF again later? Use the{" "}
            <In href={wordToPdf.href}>Word to PDF converter</In>.
          </li>
        </ul>
      </section>

      <FAQ
        id="questions"
        heading="Common questions"
        faqs={[
          {
            question: "Can I add a PDF to Word without converting it?",
            answer:
              "Yes. Use Insert → Object → Create from File to embed the PDF inside a Word document.",
          },
          {
            question: "Can I insert a PDF into Word as editable text?",
            answer:
              "Yes, if the PDF contains text that can be converted or extracted. You can open it in Microsoft Word or use a PDF to Word converter. Some formatting may need correction.",
          },
          {
            question: "Can I add a PDF to Word for free?",
            answer:
              "Yes. You can use Microsoft Word’s built-in features or a free online PDF to Word converter to prepare content for insertion.",
          },
          {
            question: "Why can I only see the first page of my inserted PDF?",
            answer:
              "When you embed a PDF as an object, Word may show an icon or a preview rather than every page. To show individual pages inside the document, convert the PDF content or insert the pages as images.",
          },
          {
            question: "Does converting a PDF replace my original file?",
            answer:
              "No. Conversion creates a new Word document. Your original PDF stays on your device unless you delete it yourself.",
          },
        ]}
      />

      <section className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--brand-soft)] px-4 py-5 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Conclusion
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          To add a PDF to a Word document, choose the method that matches your
          goal. Use <strong>Insert → Object</strong> when you want to attach the
          original PDF. If you need to reuse its contents, convert the PDF to
          Word and insert the sections you need.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For a simple conversion option, try the{" "}
          <In href={pdfToWord.href}>free PDF to Word converter</In> and review
          the output before you add it to your document.
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
