import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { toolsById } from "@/lib/tools";

const wordToPdf = toolsById["word-to-pdf"];
const pdfToWord = toolsById["pdf-to-word"];
const compressPdf = toolsById["compress-pdf"];
const mergePdf = toolsById["merge-pdf"];

const linkClass =
  "font-semibold text-[var(--brand-deep)] underline decoration-[rgba(200,36,32,0.35)] underline-offset-2 hover:decoration-[var(--brand-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]";

const h2Class =
  "scroll-mt-28 font-display text-2xl font-semibold tracking-tight text-[var(--ink)] sm:text-[1.65rem]";

const h3Class =
  "scroll-mt-28 mt-6 font-display text-lg font-semibold text-[var(--ink)]";

function In({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={linkClass}>
      {children}
    </Link>
  );
}

function Out({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className={linkClass} rel="noopener noreferrer">
      {children}
    </a>
  );
}

const toc = [
  { href: "#choose-a-method", label: "Choose a method" },
  { href: "#convert-with-our-tool", label: "Convert a DOCX file on this site" },
  { href: "#what-is-preserved", label: "What the PDF keeps" },
  { href: "#use-another-app", label: "When to export from Word or Docs" },
  { href: "#troubleshooting", label: "Fix a bad result" },
  { href: "#privacy", label: "How the file is processed" },
  { href: "#questions", label: "Common questions" },
] as const;

export function DownloadWordAsPdfArticle() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-base leading-7 text-[var(--ink)]">
        You can download a Word document as a PDF from Microsoft Word, from
        Word for the web, from Google Docs, or from the{" "}
        <In href={wordToPdf.href}>Word to PDF converter</In> on
        BestFreePDFConverter.com. The right choice depends on whether you need
        the original page design or only the words.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        Our converter accepts <code>.docx</code> files, reads them in your
        browser, and builds a new PDF from the extracted text. It does not
        copy images, table columns, headers, or the Word layout. Use it when
        the text is what you need to share. Export from Word or Google Docs
        when the pages have to look like the original.
      </p>

      <figure className="mt-6">
        <Image
          src="/blog/bestfreepdfconverter-docx-to-pdf-process.svg"
          alt="Diagram of a DOCX file, browser text extraction, and a new PDF made of plain lines rather than the original layout"
          width={960}
          height={420}
          priority
          unoptimized
          className="h-auto w-full rounded-lg border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Our converter extracts the words, then places them on new US Letter
          pages. The picture and table in the first panel are not carried into
          the PDF. This is an illustration, not a screenshot.
        </figcaption>
      </figure>

      <nav
        aria-label="On this page"
        className="mt-6 rounded-lg border border-[var(--line)] bg-white p-4 sm:p-5"
      >
        <p className="text-sm font-semibold text-[var(--ink)]">On this page</p>
        <ol className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {toc.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="inline-flex rounded-md py-1 text-sm text-[var(--ink-muted)] underline-offset-2 hover:text-[var(--brand-deep)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand)]"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section className="mt-10" aria-labelledby="choose-a-method">
        <h2 id="choose-a-method" className={h2Class}>
          Choose a method
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Start with the file you have and the result you need. A designed
          résumé should be saved from Word. A notes file that is mostly
          paragraphs can go through our converter.
        </p>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm leading-6">
            <caption className="border-b border-[var(--line)] px-3 py-2 text-left text-xs text-[var(--ink-muted)]">
              Four ways to get a PDF. Swipe sideways on a narrow screen.
            </caption>
            <thead className="bg-[var(--bg-c)] text-[var(--ink)]">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Method
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Best suited for
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Main advantage
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Important limitation
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  BestFreePDFConverter.com
                </th>
                <td className="px-3 py-3">
                  A <code>.docx</code> file when you need the extracted text
                  in a PDF and Word is not open.
                </td>
                <td className="px-3 py-3">
                  Select the file, choose Convert to PDF, then Download. Up
                  to 20 files, 50 MB each, processed in the browser.
                </td>
                <td className="px-3 py-3">
                  Text is rebuilt on letter-size pages. Images, table grids,
                  headers, and the original layout are not kept.{" "}
                  <code>.doc</code> files are rejected.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Microsoft Word on Windows or Mac
                </th>
                <td className="px-3 py-3">
                  Letters, résumés, reports, and anything with pictures or
                  tables that must stay in place.
                </td>
                <td className="px-3 py-3">
                  Word publishes a PDF from the document you are editing,
                  including more of the layout than a text extract can.
                </td>
                <td className="px-3 py-3">
                  Menus differ by version. On Mac, reusing the Word file name
                  can replace the editable document. A PDF can still be
                  edited later.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Word for the web
                </th>
                <td className="px-3 py-3">
                  A document already open in Word in the browser, when you do
                  not need desktop PDF options.
                </td>
                <td className="px-3 py-3">
                  File, Export, then Download as PDF. Use the comments
                  download only when comments should be visible.
                </td>
                <td className="px-3 py-3">
                  Fewer controls than desktop Word. The file is already stored
                  with Microsoft.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Google Docs
                </th>
                <td className="px-3 py-3">
                  A Word file you can open from Google Drive when Word is not
                  installed.
                </td>
                <td className="px-3 py-3">
                  Open with Google Docs, check the pages, then File, Download,
                  PDF Document (.pdf).
                </td>
                <td className="px-3 py-3">
                  Import can move page breaks and objects. Edits are saved
                  back to the original Office file.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="convert-with-our-tool">
        <h2 id="convert-with-our-tool" className={h2Class}>
          Convert a DOCX file on this site
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Open the{" "}
          <In href={wordToPdf.href}>Word to PDF tool</In>. The drop area says
          “Drop Word (.docx) files” and “Select one or more documents — or
          click to browse.” The helper line states the limits: 50 MB per file
          and up to 20 files.
        </p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-7 text-[var(--ink)]">
          <li>
            Choose one or more <code>.docx</code> files within those limits.
            A legacy <code>.doc</code> file is not a supported type and is
            skipped.
          </li>
          <li>
            Check the list of selected names. Select{" "}
            <strong>Convert to PDF</strong>. The status line moves through
            reading the Word file, extracting text, and building PDF pages.
          </li>
          <li>
            Wait until the progress line says Done. One file shows “Ready:”
            plus the PDF name. Several files show how many are ready.
          </li>
          <li>
            Under Downloads, select <strong>Download</strong> beside the file
            name, or the button that begins with Download and shows that name.
            For more than one result, <strong>Download all</strong> starts a
            separate download for each PDF.
          </li>
          <li>
            Open the PDF and read it. Each DOCX becomes its own PDF. Nothing
            on this page merges them into one document.
          </li>
        </ol>
        <p className="mt-4 text-base leading-7 text-[var(--ink)]">
          If you later want those separate PDFs in a single file, use{" "}
          <In href={mergePdf.href}>Merge PDF</In> after the downloads finish.
          Merging does not put images or table columns back.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="what-is-preserved">
        <h2 id="what-is-preserved" className={h2Class}>
          What the PDF keeps
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A PDF file type does not mean the Word design was copied. Our tool
          uses Mammoth to extract raw text, then pdf-lib to draw that text on
          new pages. The original DOCX is not rewritten.
        </p>
        <figure className="mt-4">
          <Image
            src="/blog/bestfreepdfconverter-word-layout-vs-text-pdf.svg"
            alt="Side-by-side illustration: a Word page with a photo and a two-column table, and a PDF page that keeps only the words as plain lines"
            width={960}
            height={480}
            unoptimized
            className="h-auto w-full rounded-lg border border-[var(--line)] bg-white"
          />
          <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            The heading and sentences can survive as text. The photo and the
            table grid do not. This drawing shows the difference. It is not a
            file produced by the converter.
          </figcaption>
        </figure>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm leading-6">
            <caption className="border-b border-[var(--line)] px-3 py-2 text-left text-xs text-[var(--ink-muted)]">
              What the BestFreePDFConverter.com Word to PDF tool carries into
              the download.
            </caption>
            <thead className="bg-[var(--bg-c)]">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  In the DOCX
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  In the PDF
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Body text and line breaks
                </th>
                <td className="px-3 py-3">
                  Kept as text, then wrapped onto US Letter pages (612 by 792
                  points) with 50-point margins and 11-point type.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Word fonts, spacing, and page size
                </th>
                <td className="px-3 py-3">
                  Not kept. The page may request a site font so more characters
                  can be drawn. If that font file is unavailable, Helvetica is
                  used and some characters may be replaced. Your document is
                  not part of that font request.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Images, headers, footers, page numbers
                </th>
                <td className="px-3 py-3">
                  Not drawn. A file that is only pictures can come back as the
                  words “(Empty document)”.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Tables
                </th>
                <td className="px-3 py-3">
                  Not kept as columns. Cell text, if it was extracted, is
                  written as ordinary lines.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Word page breaks
                </th>
                <td className="px-3 py-3">
                  Ignored. Pages break when the new letter-size page is full.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="use-another-app">
        <h2 id="use-another-app" className={h2Class}>
          When to export from Word or Docs
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Use a desktop or cloud editor when the PDF must resemble the Word
          file. Our converter will not do that, and changing Word styles
          afterward will not put pictures back into a PDF it already built
          from text.
        </p>
        <h3 className={h3Class}>Word on Windows</h3>
        <p className="mt-2 text-base leading-7 text-[var(--ink)]">
          Microsoft’s current desktop article says: if the file was already
          saved, select File, then Save a Copy. If it is new, select Save As
          or Save a Copy. Choose Browse, select PDF in the format list, then
          Save. More Options, then Options, can limit the page range and
          choose whether markup is published. Confirm the new file ends in{" "}
          <code>.pdf</code> and that the DOCX is still there. Details are on{" "}
          <Out href="https://support.microsoft.com/en-us/office/collab-files/save-or-convert-to-pdf-or-xps-in-office-desktop-apps">
            Save or convert to PDF or XPS
          </Out>
          .
        </p>
        <h3 className={h3Class}>Word on Mac</h3>
        <p className="mt-2 text-base leading-7 text-[var(--ink)]">
          Select File, then Save As. Give the PDF a different name from the
          Word file. Microsoft’s Mac article says keeping the same name can
          replace the editable document. Set File Format to PDF, then select
          Export or Save, whichever button that version shows. Retest links if
          you used Best for printing. See{" "}
          <Out href="https://support.microsoft.com/en-us/word/save-or-convert-to-pdf-on-your-mac">
            Save or convert to PDF on your Mac
          </Out>
          .
        </p>
        <h3 className={h3Class}>Word for the web and Google Docs</h3>
        <p className="mt-2 text-base leading-7 text-[var(--ink)]">
          In Word for the web, select File, Export, then Download as PDF, or
          Download as PDF with comments if comments should appear. Select
          Download in the confirmation dialog. The Office article also
          documents File, Print, then Save as PDF. Those labels are on{" "}
          <Out href="https://support.microsoft.com/en-us/word/export-word-document-as-pdf">
            Export Word document as PDF
          </Out>
          .
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          In Google Drive, open the Word file and select Open with Google
          Docs. Check the layout, because pagination often shifts, and because
          later edits are saved to the original Office file. Then select File,
          Download, and PDF Document (.pdf). See{" "}
          <Out href="https://support.google.com/docs/answer/9310150">
            Switch from Microsoft Word to Google Docs
          </Out>{" "}
          and{" "}
          <Out href="https://support.google.com/docs/answer/49114">
            Create, view, or download a file
          </Out>
          .
        </p>
      </section>

      <section className="mt-10" aria-labelledby="troubleshooting">
        <h2 id="troubleshooting" className={h2Class}>
          Fix a bad result
        </h2>
        <figure className="mt-4">
          <Image
            src="/blog/bestfreepdfconverter-pdf-check-list.svg"
            alt="Four checks after download: the name ends in .pdf, the words are readable, pictures are not expected, and each DOCX produced its own PDF"
            width={960}
            height={360}
            unoptimized
            className="h-auto w-full rounded-lg border border-[var(--line)] bg-white"
          />
          <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
            Read the PDF before you send it. Missing pictures are a limit of
            this converter, not a download that stopped halfway.
          </figcaption>
        </figure>
        <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--line)] bg-white">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm leading-6">
            <caption className="border-b border-[var(--line)] px-3 py-2 text-left text-xs text-[var(--ink-muted)]">
              Problems you can hit with this converter, and what actually
              fixes them.
            </caption>
            <thead className="bg-[var(--bg-c)]">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  What you see
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Why
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  What to do
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  The PDF says “(Empty document)”
                </th>
                <td className="px-3 py-3">
                  Mammoth found no text to extract. The file may contain only
                  images, or the body is blank.
                </td>
                <td className="px-3 py-3">
                  This converter cannot recover those pictures. Export the PDF
                  from Word or Google Docs instead.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Images are missing
                </th>
                <td className="px-3 py-3">
                  The tool never draws images. Adjusting Word wrapping will
                  not add them to this PDF.
                </td>
                <td className="px-3 py-3">
                  Save or download the PDF from Word or Google Docs if the
                  pictures have to appear.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  A table is no longer a table
                </th>
                <td className="px-3 py-3">
                  Columns are not reconstructed. Extracted cell text becomes
                  lines.
                </td>
                <td className="px-3 py-3">
                  Use Word’s own PDF save when column alignment matters. Do
                  not expect a second run here to restore the grid.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Spacing or page breaks look wrong
                </th>
                <td className="px-3 py-3">
                  Text is reflowed at a fixed size onto letter pages. Word
                  page breaks are not used.
                </td>
                <td className="px-3 py-3">
                  For the original breaks, export from the editor that has
                  the layout. Our PDF will not match that pagination.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  A .doc file is skipped
                </th>
                <td className="px-3 py-3">
                  The picker accepts <code>.docx</code> only. The page reports
                  that the file is not a supported type.
                </td>
                <td className="px-3 py-3">
                  In Word, save a DOCX copy or save the PDF there. Do not
                  rename <code>.doc</code> to <code>.docx</code>.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  The file is too large
                </th>
                <td className="px-3 py-3">
                  Anything over 50 MB is refused. The message names the file
                  and says the maximum size is 50 MB.
                </td>
                <td className="px-3 py-3">
                  Remove unused pictures in Word and save a smaller DOCX, or
                  export the PDF from Word.{" "}
                  <In href={compressPdf.href}>Compress PDF</In> is for a PDF
                  you already have. It redraws pages as JPEG images, so it
                  does not restore missing Word content, and the text is no
                  longer selectable.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  Too many files were selected
                </th>
                <td className="px-3 py-3">
                  The session stops at 20 files. Extra files are not added,
                  and the page says the maximum was reached.
                </td>
                <td className="px-3 py-3">
                  Convert the first 20, download them, clear the list, then
                  add the rest. They still come back as separate PDFs.
                </td>
              </tr>
              <tr className="border-t border-[var(--line)] align-top">
                <th scope="row" className="px-3 py-3 font-semibold">
                  The download is missing or will not open
                </th>
                <td className="px-3 py-3">
                  Conversion failed, the browser download did not finish, or
                  the page was refreshed before you saved the file. A failed
                  run shows an error and no Downloads block.
                </td>
                <td className="px-3 py-3">
                  Run Convert to PDF again and download only after the status
                  says Ready. Look in the browser downloads list, not inside
                  the website. Open the file in a PDF viewer and confirm the
                  name ends in <code>.pdf</code>.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-base leading-7 text-[var(--ink)]">
          If you need an editable file again,{" "}
          <In href={pdfToWord.href}>PDF to Word</In> can turn a text-based PDF
          back into a DOCX. That is a second conversion, not a way to recover
          pictures this tool never wrote.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="privacy">
        <h2 id="privacy" className={h2Class}>
          How the file is processed
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The Word to PDF code runs in the page. It reads the DOCX you select,
          extracts the text, and creates a PDF blob for the Download button.
          That path does not post the document to a conversion API. Closing or
          refreshing the page can discard the in-memory result, so download
          the PDF before you leave.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          That is not a promise that every browser, extension, or computer is
          safe, and it does not encrypt the PDF or remove hidden information.
          Read the{" "}
          <In href="/privacy-policy">privacy policy</In> before you convert a
          contract or other confidential file. Word for the web and Google
          Docs keep the document in those companies’ storage, which is a
          different arrangement from this page. For a highly sensitive file
          with a layout you must preserve, desktop Word and a folder you
          control are the more predictable choice.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="questions">
        <h2 id="questions" className={h2Class}>
          Common questions
        </h2>
        <div className="mt-4 space-y-6">
          <div>
            <h3 className={h3Class}>
              Can I convert a DOCX file here without Word?
            </h3>
            <p className="mt-2 text-base leading-7 text-[var(--ink)]">
              Yes, if the file is <code>.docx</code>, under 50 MB, and you
              only need the extracted text. The page does not show a payment
              step or an account form. It will not open a legacy{" "}
              <code>.doc</code> file.
            </p>
          </div>
          <div>
            <h3 className={h3Class}>Does the PDF match the Word file?</h3>
            <p className="mt-2 text-base leading-7 text-[var(--ink)]">
              No. You get the words on new letter-size pages. Word and Google
              Docs are the methods that try to keep the design. Even those
              exports can change fonts or links, so open the PDF before you
              send it.
            </p>
          </div>
          <div>
            <h3 className={h3Class}>
              Does conversion change my original document?
            </h3>
            <p className="mt-2 text-base leading-7 text-[var(--ink)]">
              On this site, no. The selected DOCX is read and a new PDF is
              downloaded. On a Mac, Word can replace the document if you save
              the PDF under the same name. In Google Docs, edits after Open
              with Google Docs are written back to the Office file.
            </p>
          </div>
          <div>
            <h3 className={h3Class}>Can I convert several Word files at once?</h3>
            <p className="mt-2 text-base leading-7 text-[var(--ink)]">
              You can add up to 20 DOCX files and select Convert to PDF. Each
              one becomes a separate PDF. Use Download all to save them, then{" "}
              <In href={mergePdf.href}>Merge PDF</In> only if you want those
              PDFs combined afterward.
            </p>
          </div>
          <div>
            <h3 className={h3Class}>
              Is this appropriate for a confidential file?
            </h3>
            <p className="mt-2 text-base leading-7 text-[var(--ink)]">
              Only if browser processing, as described in the{" "}
              <In href="/privacy-policy">privacy policy</In>, fits the
              sensitivity of the file. Conversion does not password-protect
              the PDF. Desktop Word can add a password from its own PDF
              options. This tool does not.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-lg border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Convert the DOCX, then read the PDF
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Use Word or Google Docs when images, tables, and page design have to
          survive. Use this site when you have a DOCX file and need its text
          in a PDF: select the file, choose Convert to PDF, then download and
          check the words.
        </p>
        <p className="mt-4">
          <Link href={wordToPdf.href} className="btn btn-primary">
            Convert a DOCX file to PDF
          </Link>
        </p>
      </section>
    </div>
  );
}
