import Image from "next/image";
import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import { toolsById } from "@/lib/tools";
import {
  ArticleToc,
  h2Class,
  h3Class,
  In,
  Out,
} from "@/components/blog/articleUi";

const mergePdf = toolsById["merge-pdf"];
const splitPdf = toolsById["split-pdf"];
const compressPdf = toolsById["compress-pdf"];

const toc = [
  { href: "#how-to-merge", label: "Merge files step by step" },
  { href: "#why-combine", label: "Why combine PDFs" },
  { href: "#quality", label: "Quality, page size, and forms" },
  { href: "#privacy", label: "Privacy" },
  { href: "#password", label: "Password-protected PDFs" },
  { href: "#mobile", label: "Phone and tablet" },
  { href: "#errors", label: "When a merge fails" },
  { href: "#clean-file", label: "A cleaner result" },
  { href: "#questions", label: "Common questions" },
] as const;

export function MergePdfArticle() {
  return (
    <div className="w-full">
      <p className="text-base leading-7 text-[var(--ink)]">
        You can combine several PDF files into one document in the browser,
        without installing a PDF editor. That is useful for an assignment, a
        report, or an application packet that should arrive as a single file.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        This guide covers the order of the files, locked PDFs, the optional
        password on the result, and the problems that stop a merge. The{" "}
        <In href={mergePdf.href}>Merge PDF tool</In> needs at least two PDFs.
        It accepts up to 20 files, 50 MB each, and downloads one file named{" "}
        <code>merged.pdf</code>.
      </p>

      <figure className="mt-6">
        <Image
          src="/blog/bestfreepdfconverter-merge-pdf-order.svg"
          alt="Diagram of a cover letter, resume, and certificates arranged in order and saved as one merged PDF"
          width={960}
          height={420}
          priority
          unoptimized
          className="h-auto w-full rounded-lg border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          The merged PDF follows the order of the files in the list. This
          drawing is an illustration, not a screenshot.
        </figcaption>
      </figure>

      <ArticleToc items={toc} />

      <section className="mt-10" aria-labelledby="how-to-merge">
        <h2 id="how-to-merge" className={h2Class}>
          How to merge PDF files online for free
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The files already need to be PDFs. The tool does not convert Word or
          image files during the merge.
        </p>

        <h3 className={h3Class}>Step 1: Open the merger</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Go to the <In href={mergePdf.href}>Merge PDF page</In>. It runs in
          the browser, so there is no desktop app to install and no account to
          create.
        </p>

        <h3 className={h3Class}>Step 2: Select the PDF files</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Choose the documents from your computer, phone, or tablet. A job
          application might be <code>Resume.pdf</code>,{" "}
          <code>Cover-Letter.pdf</code>, and <code>Certificates.pdf</code>.
          Each file can be up to 50 MB, and the session can hold 20 files.
          Leave out anything that should not appear in the final PDF.
        </p>

        <h3 className={h3Class}>Step 3: Arrange them</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The merged PDF follows the list from top to bottom. For an
          application, put the cover letter first, the resume second, and the
          certificates last. Use the up and down controls beside each file.
          Checking the order now avoids a second merge.
        </p>

        <h3 className={h3Class}>Step 4: Handle locked files and the output password</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A locked PDF shows a password field. Enter the password that opens
          that file and select Unlock. Only unlock a document you are allowed
          to open.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Under “Protect merged PDF,” choose one of three results:
        </p>
        <ul className="point-grid">
          <li>No password on the merged file.</li>
          <li>The same password, typed again, applied to the merged file.</li>
          <li>
            A new password, entered twice. The two entries have to match.
          </li>
        </ul>

        <h3 className={h3Class}>Step 5: Merge the files</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Select <strong>Merge PDFs</strong>. The tool copies the pages into
          one PDF. A large or complex file takes longer, and the work uses
          memory on your device.
        </p>

        <h3 className={h3Class}>Step 6: Download and read merged.pdf</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The download is named <code>merged.pdf</code>. You can rename it in
          the download field before you save it. Open it and confirm:
        </p>
        <ul className="point-grid">
          <li>Every document you selected is included.</li>
          <li>The pages are in the order you arranged.</li>
          <li>Text and images look right.</li>
          <li>Nothing important is missing.</li>
          <li>A password you set actually opens the file.</li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="why-combine">
        <h2 id="why-combine" className={h2Class}>
          Why combine PDF files into one document
        </h2>
        <h3 className={h3Class}>Easier sharing</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          One attachment is easier to send than five. The reader opens a single
          file and sees the pages in the order you chose. That helps with
          forms, reports, and application materials.
        </p>
        <h3 className={h3Class}>One place for related pages</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          An introduction, findings, and supporting pages that started as
          separate PDFs can live in one file for review.
        </p>
        <h3 className={h3Class}>Fewer missing attachments</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Separate files are easy to forget. Combining them first lets you
          check the packet before you send it.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="quality">
        <h2 id="quality" className={h2Class}>
          Can you merge PDFs without losing quality?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For an ordinary PDF, the merger copies existing pages. It does not
          turn those pages into images, and you do not paste text or take
          screenshots. Text, embedded images, and the page layout of each
          source page stay in the copy. Still open the result when a file has
          detailed graphics, unusual fonts, or scanned pages.
        </p>
        <h3 className={h3Class}>Different page sizes</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          You can combine an A4 file with a US Letter file. Each page can keep
          its own size. If a printer needs one size throughout, check the
          download before you print.
        </p>
        <h3 className={h3Class}>Forms and digital signatures</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The new file is a fresh PDF. Bookmarks, document info such as title
          and author, a working form, and a valid digital signature from the
          originals are not carried over as a complete signed or fillable
          document. If a signature or an editable form has to survive, keep the
          original and check the download in a PDF reader before you rely on it.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A locked file is unlocked in the browser first. When that unlock can
          keep the PDF structure, the pages are copied. When it cannot, every
          page of that file is redrawn as a JPEG before the merge, and the text
          is no longer selectable. That path is the exception, not the normal
          merge.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="privacy">
        <h2 id="privacy" className={h2Class}>
          Is it safe to merge PDF files online?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Some sites upload the documents. This merger reads the selected PDFs
          in the browser and does not send them to a conversion server. The
          privacy note on the tool page says files are not uploaded, stored, or
          scanned on a server. Read the{" "}
          <In href="/privacy-policy#local-conversion">privacy policy</In> before
          you combine contracts, financial records, or other confidential files.
          Browser processing does not encrypt the contents or make them private
          by itself.
        </p>
        <ul className="point-grid">
          <li>Confirm you are on the site you meant to use.</li>
          <li>Do not send the download through a channel you do not trust.</li>
          <li>Leave out personal details the packet does not need.</li>
          <li>Keep the original files.</li>
          <li>Set a password on the merged file when the packet needs one.</li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="password">
        <h2 id="password" className={h2Class}>
          How to merge password-protected PDF files
        </h2>
        <ol className="point-grid point-grid-ordered">
          <li>Select the PDFs you want to combine.</li>
          <li>Enter the correct password for each locked file and unlock it.</li>
          <li>Arrange the documents.</li>
          <li>
            Choose whether <code>merged.pdf</code> stays open or gets a
            password.
          </li>
          <li>Select Merge PDFs and download the result.</li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          If you do not know the password, ask the person who protected the
          file. The merger is not a way to open a PDF you are not allowed to
          read. The finished file can have different protection from the
          originals, so open it once before you share it. A wrong password
          shows <code>Incorrect password.</code>
        </p>
      </section>

      <section className="mt-10" aria-labelledby="mobile">
        <h2 id="mobile" className={h2Class}>
          How to merge PDF files on a phone
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The same page works in a mobile browser when you already have the
          PDFs on the phone.
        </p>
        <h3 className={h3Class}>Android</h3>
        <ol className="point-grid point-grid-ordered">
          <li>Open the browser and go to the merge page.</li>
          <li>Select the PDFs from the phone’s file picker.</li>
          <li>Arrange them with the up and down controls.</li>
          <li>Select Merge PDFs.</li>
          <li>Download the combined PDF.</li>
        </ol>
        <h3 className={h3Class}>iPhone</h3>
        <ol className="point-grid point-grid-ordered">
          <li>Open Safari or another browser on the phone.</li>
          <li>Open the merge page.</li>
          <li>Select the documents from the file picker.</li>
          <li>Check the order.</li>
          <li>Merge the files and save the download.</li>
        </ol>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          On an iPhone, saved downloads are often in the Files app, depending
          on the browser. A computer is easier when the files are long, because
          you can inspect page order before and after the merge.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="errors">
        <h2 id="errors" className={h2Class}>
          Why a PDF merge fails
        </h2>
        <h3 className={h3Class}>A PDF is password-protected</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Enter the password for that file and select Unlock, then merge again.
        </p>
        <h3 className={h3Class}>A file is larger than 50 MB</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The page names the file and refuses it. Reduce that PDF first.{" "}
          <In href={compressPdf.href}>Compress PDF</In> redraws pages as JPEG
          images, so text in that compressed file is no longer selectable. Use
          it only when a smaller file matters more than selectable text.
        </p>
        <h3 className={h3Class}>More than 20 files</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Merge them in batches of 20 or fewer, then merge those results, as
          long as each file is still within 50 MB. You also need at least two
          PDFs. One file cannot be merged with itself unless you add it twice.
        </p>
        <h3 className={h3Class}>A page is blank or the PDF is damaged</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A blank page stops the merge with{" "}
          <code>Page N is blank. No file was saved.</code> Remove that page
          first, for example with the <In href={splitPdf.href}>PDF splitter</In>,
          by saving a range that skips it. If a file will not open in a PDF
          reader, replace it with a working copy before you merge.
        </p>
        <h3 className={h3Class}>The browser runs out of memory</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Close other tabs, merge fewer files, or use a device with more free
          memory.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="clean-file">
        <h2 id="clean-file" className={h2Class}>
          Tips for a clean merged PDF
        </h2>
        <h3 className={h3Class}>Name the files before you combine them</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Names such as <code>01-Cover-Letter.pdf</code>,{" "}
          <code>02-Resume.pdf</code>, and <code>03-Certificates.pdf</code> make
          the intended order obvious in the list.
        </p>
        <h3 className={h3Class}>Remove pages you do not want</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          A merge copies what is already in each PDF. It does not drop outdated
          pages for you. Take those pages out first. A blank page will stop the
          job, so exclude it.
        </p>
        <h3 className={h3Class}>Check orientation and readability</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Open each source file. Pages that are sideways, cropped, or hard to
          read stay that way after the merge.
        </p>
        <h3 className={h3Class}>Keep the originals</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          The tool creates <code>merged.pdf</code> and leaves the selected
          files where they are. Keep them so you can change the order or
          replace a section later.
        </p>
      </section>

      <FAQ
        id="questions"
        heading="Common questions"
        faqs={[
          {
            question: "Can I merge PDFs online without installing software?",
            answer:
              "Yes. Select the PDFs, arrange them, choose Merge PDFs, and download merged.pdf. There is no desktop app and no account form.",
          },
          {
            question: "How many PDF files can I merge at once?",
            answer:
              "From 2 to 20 PDFs, with a maximum of 50 MB for each file.",
          },
          {
            question: "Can I combine two PDFs into one file?",
            answer:
              "Yes. Select both, put them in order, merge them, and download the result.",
          },
          {
            question: "Does merging change the original files?",
            answer:
              "No. The tool reads the selected PDFs and downloads a new file. The originals stay on your device.",
          },
          {
            question: "Can I merge scanned PDFs?",
            answer:
              "Yes, when they are valid PDFs within the size limit. Scanned pages stay images. Merging them does not make the text searchable.",
          },
          {
            question: "Can I merge password-protected PDFs?",
            answer:
              "Yes, if you know each password. Enter it when the file is marked locked. You can also put a password on the merged file.",
          },
          {
            question: "Can I rearrange the files before merging?",
            answer:
              "Yes. Use the up and down controls. The merged PDF follows that order.",
          },
          {
            question: "Can I merge PDFs on an iPhone or Android phone?",
            answer:
              "Yes, in a mobile browser, using the phone’s file picker. A computer is easier when you need to inspect a long result.",
          },
          {
            question: "Will merging reduce image quality?",
            answer:
              "A normal merge copies the existing pages and does not lower image resolution. A locked PDF that cannot be unlocked as a normal PDF may be redrawn as JPEG images first. Open the download if the file has detailed graphics.",
          },
        ]}
      />

      <section className="mt-10 rounded-lg border border-[var(--line)] bg-white p-5 sm:p-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Arrange the files, then read merged.pdf
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Select the PDFs that belong in the packet, put them in order, unlock
          any file that asks for a password, and open the download before you
          send it. The originals are not replaced.
        </p>
        <p className="mt-4">
          <Link href={mergePdf.href} className="btn btn-primary">
            Merge PDF files
          </Link>
        </p>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
          If you need to pull pages out of one file first, use the{" "}
          <In href={splitPdf.href}>PDF splitter</In> or read{" "}
          <In href="/blog/how-to-split-pdf-pages">how to split PDF pages</In>.
          Adobe’s desktop steps are in{" "}
          <Out href="https://helpx.adobe.com/uk/acrobat/desktop/edit-documents/combine-files/combine-files.html">
            Combine files into one PDF
          </Out>
          . That article describes Acrobat, not this page.
        </p>
      </section>
    </div>
  );
}
