import Image from "next/image";
import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import { toolsById } from "@/lib/tools";
import {
  ArticleToc,
  DataTable,
  h2Class,
  h3Class,
  In,
  Out,
  rowClass,
  tdClass,
  thClass,
} from "@/components/blog/articleUi";

const splitPdf = toolsById["split-pdf"];
const mergePdf = toolsById["merge-pdf"];
const compressPdf = toolsById["compress-pdf"];
const rotatePdf = toolsById["rotate-pdf"];
const passwordRemover = toolsById["pdf-password-remover"];

const toc = [
  { href: "#how-to-split", label: "Split pages step by step" },
  { href: "#extract-pages", label: "Extract specific pages" },
  { href: "#choose-output", label: "One PDF or a ZIP" },
  { href: "#two-parts", label: "Split into two parts" },
  { href: "#multiple-files", label: "Several PDFs at once" },
  { href: "#quality", label: "Quality and features" },
  { href: "#password", label: "Password-protected PDFs" },
  { href: "#errors", label: "Common errors" },
  { href: "#privacy", label: "Privacy" },
  { href: "#questions", label: "Common questions" },
] as const;

export function SplitPdfArticle() {
  return (
    <div className="w-full">
      <p className="text-base leading-7 text-[var(--ink)]">
        Extract a few pages from a long PDF, save every page as its own file,
        or divide one document into two parts. The right choice is the output
        you need, not a generic “split” button.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        The <In href={splitPdf.href}>free PDF splitter</In> saves the pages you
        name as <strong>one PDF</strong> or as <strong>individual PDFs in a ZIP</strong>.
        It reads the file in your browser. There is no account and no checkout.
        You can run it again as often as you need. Each PDF still has to be 50
        MB or smaller, and one session holds at most 20 PDFs.
      </p>

      <figure className="mt-6">
        <Image
          src="/blog/bestfreepdfconverter-split-pdf-modes.svg"
          alt="Diagram of a page range saved as one PDF or as separate page files in a ZIP, plus a two-run method for two multi-page parts"
          width={960}
          height={420}
          priority
          unoptimized
          className="h-auto w-full rounded-lg border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          The same range can stay in one PDF or become one file per page. Two
          grouped parts take two runs. This drawing is an illustration, not a
          screenshot.
        </figcaption>
      </figure>

      <ArticleToc items={toc} />

      <section className="mt-10" aria-labelledby="how-to-split">
        <h2 id="how-to-split" className={h2Class}>
          How to split PDF pages online for free
        </h2>

        <h3 className={h3Class}>Step 1: Choose the result you need</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Decide whether the selected pages should stay together or become
          separate files.
        </p>
        <ul className="point-grid">
          <li>
            <strong>One PDF with selected pages.</strong> Use this for a
            chapter, a report section, or a few contract pages.
          </li>
          <li>
            <strong>A separate PDF for each page.</strong> Use this for
            certificates, invoices, or forms. The pages download together in
            one ZIP.
          </li>
        </ul>

        <h3 className={h3Class}>Step 2: Select the original PDF locally</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Open the <In href={splitPdf.href}>free online PDF splitter</In> and
          choose a PDF from your device. The tool accepts PDF files only, up to{" "}
          <strong>50 MB each</strong>, and up to <strong>20 files in one session</strong>.
          No account form appears.
        </p>

        <h3 className={h3Class}>Step 3: Enter a page range</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Type the pages in the range field. Spaces around commas are fine.
          Repeated numbers count once. The splitter always writes pages in{" "}
          <strong>ascending order</strong>. The box selects pages. It does not
          rearrange them into the order you typed.
        </p>
        <DataTable caption="What the range field keeps. Swipe sideways on a narrow screen.">
          <thead className="bg-[var(--bg-c)] text-[var(--ink)]">
            <tr>
              <th scope="col" className={thClass}>
                What you type
              </th>
              <th scope="col" className={thClass}>
                Pages saved
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Empty", "Every page"],
              ["1-3", "1, 2, 3"],
              ["1-3, 5", "1, 2, 3, 5"],
              ["5-1", "1, 2, 3, 4, 5"],
              ["2, 2, 4", "2, 4"],
              ["10-12, 2", "2, 10, 11, 12"],
            ].map(([input, pages]) => (
              <tr key={input} className={rowClass}>
                <th scope="row" className={`${tdClass} font-semibold`}>
                  <code>{input}</code>
                </th>
                <td className={tdClass}>{pages}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>

        <h3 className={h3Class}>Step 4: Split and check the download</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Choose <strong>One PDF</strong> or <strong>a separate PDF for each page</strong>,
          then select Split PDF. Starting from <code>report.pdf</code>, one PDF
          is named <code>report-split.pdf</code>. Separate pages download as{" "}
          <code>report-pages.zip</code>, with files such as <code>page-3.pdf</code>{" "}
          and <code>page-7.pdf</code>.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Open the download and check the page count, order, text, and images.
          The PDF you selected is not edited.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="extract-pages">
        <h2 id="extract-pages" className={h2Class}>
          How to extract specific pages from a PDF
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For pages 4, 9, and 15, enter <code>4, 9, 15</code> and choose{" "}
          <strong>One PDF</strong>. Those pages stay together, in ascending
          order. A mix of ranges and single pages works the same way:{" "}
          <code>1-3, 7, 10-12</code>. A reversed range such as <code>5-1</code>{" "}
          selects the full span. Typing <code>8, 3, 1</code> saves pages 1, 3,
          and 8, not the order you typed.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Every selected page has to exist. If the PDF has eight pages and the
          range includes page 10, that file stops with an error that names the
          real page count.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="choose-output">
        <h2 id="choose-output" className={h2Class}>
          One PDF or individual pages
        </h2>
        <DataTable caption="Match the output to the file you need to send.">
          <thead className="bg-[var(--bg-c)] text-[var(--ink)]">
            <tr>
              <th scope="col" className={thClass}>
                Goal
              </th>
              <th scope="col" className={thClass}>
                Output
              </th>
              <th scope="col" className={thClass}>
                Result
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Send pages 8–12 of a report", "One PDF", "A five-page PDF"],
              ["Extract only page 7", "One PDF", "A one-page PDF"],
              [
                "Give each certificate its own file",
                "Separate PDF for each page",
                "A ZIP of individual PDFs",
              ],
              ["Keep pages 2, 4, and 6 together", "One PDF", "One three-page PDF"],
              [
                "Save pages 3–5 separately",
                "Separate PDF for each page",
                "page-3.pdf through page-5.pdf inside a ZIP",
              ],
            ].map(([goal, output, result]) => (
              <tr key={goal} className={rowClass}>
                <th scope="row" className={`${tdClass} font-semibold`}>
                  {goal}
                </th>
                <td className={tdClass}>{output}</td>
                <td className={tdClass}>{result}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <p className="mt-4 text-base leading-7 text-[var(--ink)]">
          Separate pages means <strong>one PDF per selected page</strong>, not
          several grouped multi-page PDFs. Grouped sections use the next method.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="two-parts">
        <h2 id="two-parts" className={h2Class}>
          How to split a PDF into two parts
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A 20-page file that should become pages 1–10 and pages 11–20 needs
          two runs. One operation cannot produce two grouped multi-page PDFs.
        </p>
        <ol className="point-grid point-grid-ordered">
          <li>
            Select the original, enter <code>1-10</code>, choose{" "}
            <strong>One PDF</strong>, and download it. Rename it{" "}
            <code>Part-1.pdf</code>.
          </li>
          <li>
            Select the original again, enter <code>11-20</code>, choose{" "}
            <strong>One PDF</strong>, and download it. Rename it{" "}
            <code>Part-2.pdf</code>.
          </li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If you later need those parts in one file, use the{" "}
          <In href={mergePdf.href}>free PDF merge tool</In>.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="multiple-files">
        <h2 id="multiple-files" className={h2Class}>
          Can you split multiple PDFs at once?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Yes, up to <strong>20 PDFs</strong>, each <strong>50 MB or smaller</strong>.
          Those are limits on one session and on each file. They are not a cap
          on how many times you can use the tool, and there is no paid tier
          that raises them.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Each file is processed on its own, but <strong>every file shares the same range box</strong>.
          If you enter <code>1-3</code>, the tool tries to take pages 1–3 from
          each PDF. A two-page file then fails with an out-of-range error, even
          when the other files are long enough.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The page count on screen is for the <strong>first selected PDF only</strong>.
          When the documents have different lengths, or they need different
          ranges, split them one at a time.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="quality">
        <h2 id="quality" className={h2Class}>
          Does splitting change quality or features?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For an ordinary PDF, the splitter copies the selected pages. Text
          stays selectable, and the split step does not recompress images.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The new PDF does not keep every feature of the original:
        </p>
        <ul className="point-grid">
          <li>Bookmarks</li>
          <li>Document information, including title and author</li>
          <li>Working interactive forms</li>
          <li>A valid digital signature</li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Keep the original when you need the signature or a working form. The
          extracted file is not a substitute for that signed record. A locked
          PDF can also follow an image-based path, described below.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The new file may be smaller, and it may not. Size depends on the
          content, not only on the page count. When a smaller file is the goal,
          use <In href={compressPdf.href}>Compress PDF</In>.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="password">
        <h2 id="password" className={h2Class}>
          How to split a password-protected PDF
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Select the locked PDF and enter the correct password when the page
          asks for it. The browser unlocks the file, then the splitter copies
          the pages you named. A wrong password shows{" "}
          <code>Incorrect password.</code> The tool cannot open a protected PDF
          when you do not know the password.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A normal unlock copies the page content. If that unlock cannot keep
          the source PDF structure, the tool redraws every page as a JPEG
          before splitting. The pages can still be readable, and the text is no
          longer selectable. Check the download when you need searchable text.
          If you already know the password and want a separate removal step, use
          the <In href={passwordRemover.href}>PDF password remover</In>.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="errors">
        <h2 id="errors" className={h2Class}>
          Common PDF splitting errors
        </h2>
        <h3 className={h3Class}>A selected page is blank</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A blank page fails that document. The message is{" "}
          <code>Page N is blank. No file was saved.</code> Use a range that
          leaves the blank page out.
        </p>
        <h3 className={h3Class}>The range goes past the last page</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Processing stops for that file and reports how many pages it actually
          has. Enter only pages that exist.
        </p>
        <h3 className={h3Class}>The PDF is damaged or uses an unsupported filter</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A damaged file, or a compression filter the reader cannot decode,
          produces no download. Open the original in a PDF reader and use a
          working copy.
        </p>
        <h3 className={h3Class}>The PDF is larger than 50 MB</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The page refuses the file and names it. Make a smaller source
          document. Repeat uses stay free. The 50 MB limit applies to each
          selected file.
        </p>
        <h3 className={h3Class}>The password is wrong</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The page shows <code>Incorrect password.</code> Enter the password
          that opens the file.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="privacy">
        <h2 id="privacy" className={h2Class}>
          Is splitting a PDF private?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Splitting runs in the browser. The note on the tool page says selected
          PDFs are not uploaded, stored, or scanned on a conversion server. The
          original stays where you saved it, and the browser downloads a new
          PDF or ZIP.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          There is no “deleted after one hour” promise, because the splitter
          does not store the PDF on a conversion server. Refreshing or closing
          the page can clear the temporary result, so download it before you
          leave. Read the{" "}
          <In href="/privacy-policy#local-conversion">
            local processing section of the privacy policy
          </In>
          . Browser processing does not replace the care a confidential file
          needs.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="before-sharing">
        <h2 id="before-sharing" className={h2Class}>
          What to check before you share the result
        </h2>
        <ol className="point-grid point-grid-ordered">
          <li>Confirm the PDF or ZIP contains every page you meant to keep.</li>
          <li>Confirm the ascending order is the order you want.</li>
          <li>Check that text and images are readable.</li>
          <li>
            For a protected PDF, check whether the text is still selectable
            after the unlock step.
          </li>
          <li>
            Keep the original if bookmarks, forms, document info, or a valid
            signature matter.
          </li>
          <li>
            If a page is sideways, use <In href={rotatePdf.href}>Rotate PDF</In>.
          </li>
        </ol>
      </section>

      <FAQ
        id="questions"
        heading="Common questions"
        faqs={[
          {
            question: "Is the PDF splitter free?",
            answer:
              "Yes. You can use it again without a subscription, payment, account, or upgrade. Each file still has to be 50 MB or smaller, and each session accepts up to 20 PDFs.",
          },
          {
            question: "Is there a limit on how many times I can split PDFs?",
            answer:
              "There is no counter on the number of sessions. The 20-file cap and the 50 MB cap apply to each session and each file.",
          },
          {
            question: "Can I extract one page?",
            answer:
              "Yes. Enter that page number, select One PDF, and download the result.",
          },
          {
            question: "Can I save every page as a separate file?",
            answer:
              "Yes. Leave the range box empty and choose a separate PDF for each page. The pages download in one ZIP.",
          },
          {
            question: "Can I split a PDF into two multi-page files with one click?",
            answer:
              "No. Create each multi-page section in its own run with One PDF selected.",
          },
          {
            question: "Can I give each file in a batch a different range?",
            answer:
              "No. Every file in the session uses the same range box. Split them separately when the ranges differ.",
          },
          {
            question: "Will splitting keep signatures and forms?",
            answer:
              "No. The new file does not keep a valid digital signature or a working interactive form. Keep the original.",
          },
          {
            question: "Are my PDFs uploaded to a conversion server?",
            answer: (
              <>
                No. Splitting runs in the browser. The{" "}
                <In href="/privacy-policy#local-conversion">privacy policy</In>{" "}
                describes that local processing.
              </>
            ),
          },
          {
            question: "Can I merge the resulting PDFs later?",
            answer: (
              <>
                Yes. Use the <In href={mergePdf.href}>free PDF merge tool</In>.
              </>
            ),
          },
        ]}
      />

      <section className="mt-10 rounded-lg border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Choose the output, then check the download
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Use one PDF when the selected pages belong together. Use a ZIP when
          every page needs its own file. The range field accepts commas, spans,
          and an empty box for every page, and it always sorts pages from first
          to last. There is no account and no paid upgrade. The 50 MB and
          20-file limits still apply.
        </p>
        <p className="mt-4">
          <Link href={splitPdf.href} className="btn btn-primary">
            Open the free online PDF splitter
          </Link>
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
          Adobe describes a different desktop workflow in{" "}
          <Out href="https://helpx.adobe.com/acrobat/desktop/edit-documents/organize-pages/extract-pages.html">
            Extract pages in Acrobat
          </Out>
          . That page is about Acrobat, including options this splitter does
          not offer, such as deleting pages from the original file.
        </p>
      </section>
    </div>
  );
}
