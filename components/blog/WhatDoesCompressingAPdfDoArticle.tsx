import Link from "next/link";
import { FAQ } from "@/components/FAQ";
import {
  ArticleToc,
  DataTable,
  h2Class,
  h3Class,
  In,
  tdClass,
  thClass,
  rowClass,
} from "@/components/blog/articleUi";
import { toolsById } from "@/lib/tools";

const compressPdf = toolsById["compress-pdf"];

const toc = [
  { href: "#what-it-does", label: "What it does to the file" },
  { href: "#quality", label: "Does quality change?" },
  { href: "#compress-online", label: "Compress a PDF for free" },
  { href: "#why-compress", label: "Why compress a PDF" },
  { href: "#privacy", label: "Privacy and limits" },
  { href: "#questions", label: "Common questions" },
] as const;

export function WhatDoesCompressingAPdfDoArticle() {
  return (
    <div className="w-full">
      <p className="text-base leading-7 text-[var(--ink)]">
        What does compressing a PDF do? It reduces the file size by optimizing
        images, document data, and other elements inside the PDF. The result is
        a smaller file that is easier to upload, email, and store.
      </p>
      <p className="mt-3 text-base leading-7 text-[var(--ink)]">
        PDF compression aims to preserve the document’s content and layout,
        although some compression settings may reduce image quality. You can try
        it in the browser with the free{" "}
        <In href={compressPdf.href}>Compress PDF</In> tool.
      </p>

      <figure className="mt-6">
        <img
          src="/blog/bestfreepdfconverter-what-compressing-a-pdf-does.svg"
          alt="Diagram of a large PDF becoming a smaller PDF after image optimization, data compression, and removal of extra data"
          width={1200}
          height={525}
          decoding="async"
          className="h-auto w-full rounded-xl border border-[var(--line)] bg-white"
        />
        <figcaption className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
          Compression shrinks a PDF. The original file on your device stays
          unchanged.
        </figcaption>
      </figure>

      <ArticleToc items={[...toc]} />

      <section className="mt-10" aria-labelledby="what-it-does">
        <h2 id="what-it-does" className={h2Class}>
          What does compressing a PDF do to the file?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          PDF compression can reduce file size in several ways:
        </p>
        <ul className="point-grid">
          <li>
            <strong>Image optimization:</strong> Reduces the resolution or
            amount of image data.
          </li>
          <li>
            <strong>Data compression:</strong> Stores certain document
            information more efficiently.
          </li>
          <li>
            <strong>Removing unnecessary data:</strong> Eliminates redundant
            information where possible.
          </li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          For example, a PDF containing high-resolution photographs may become
          significantly smaller after compression. A PDF that is already
          optimized may show little improvement.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="quality">
        <h2 id="quality" className={h2Class}>
          Does compressing a PDF reduce quality?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          It depends on the compression level and the document’s contents. PDFs
          containing mostly text can often be compressed with little noticeable
          visual change. Image-heavy or scanned PDFs may lose sharpness when
          stronger compression is applied.
        </p>
        <DataTable caption="How High, Medium, and Low quality usually affect size and sharpness.">
          <thead className="bg-[var(--bg-c)] text-[var(--ink)]">
            <tr>
              <th scope="col" className={thClass}>
                Compression setting
              </th>
              <th scope="col" className={thClass}>
                Expected result
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              ["High quality", "Sharper pages, usually larger file"],
              ["Medium quality", "Balance between size and readability"],
              ["Low quality", "Smaller file, potentially reduced image quality"],
            ].map(([setting, result]) => (
              <tr key={setting} className={rowClass}>
                <th scope="row" className={`${tdClass} font-semibold`}>
                  {setting}
                </th>
                <td className={tdClass}>{result}</td>
              </tr>
            ))}
          </tbody>
        </DataTable>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Always review the compressed PDF, especially if it contains scanned
          text, detailed images, or important documents.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="compress-online">
        <h2 id="compress-online" className={h2Class}>
          How to compress a PDF online for free
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          You can reduce PDF file size directly in your browser.
        </p>

        <h3 className={h3Class}>Step 1: Open the PDF compressor</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Visit the{" "}
          <In href={compressPdf.href}>free online PDF compressor</In>.
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
            Select High, Medium, or Low, then download and compare the new size.
          </figcaption>
        </figure>

        <h3 className={h3Class}>Step 2: Select your PDF</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Choose the document you want to compress. The tool supports PDFs up to
          50 MB per file and allows up to 20 files per batch.
        </p>

        <h3 className={h3Class}>Step 3: Choose the quality</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Select <strong>High</strong>, <strong>Medium</strong>, or{" "}
          <strong>Low</strong> based on your preferred balance between file size
          and quality.
        </p>

        <h3 className={h3Class}>Step 4: Compress and download</h3>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Click <strong>Compress PDF</strong> and download the resulting file.
          Compare its size with the original and check that all pages remain
          readable. If you need the file under a 10 MB upload limit, see{" "}
          <In href="/blog/how-to-make-a-file-less-than-10-mb">
            how to make a file less than 10 MB
          </In>
          .
        </p>
      </section>

      <section className="mt-10" aria-labelledby="why-compress">
        <h2 id="why-compress" className={h2Class}>
          Why should you compress a PDF?
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          PDF compression is useful when you need to:
        </p>
        <ul className="point-grid">
          <li>Send large PDF attachments by email.</li>
          <li>Upload documents to websites with file-size limits.</li>
          <li>Save storage space on your device.</li>
          <li>Share files more easily.</li>
        </ul>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          Compression does not guarantee a particular output size. The result
          depends on how much the original PDF can be optimized.
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
            question: "Does compressing a PDF delete pages?",
            answer:
              "No. Normal PDF compression is intended to reduce file size, not remove pages.",
          },
          {
            question: "Does compressing a PDF change the original file?",
            answer:
              "BestFreePDFConverter creates a compressed version while leaving your original file unchanged.",
          },
          {
            question: "Can I compress a PDF without losing quality?",
            answer:
              "Some optimization methods can reduce file size without noticeable quality loss. Stronger image compression may lower resolution or sharpness.",
          },
          {
            question: "Does compressing a PDF make it smaller?",
            answer:
              "Usually, yes. However, a PDF that's already compressed may not become significantly smaller.",
          },
        ]}
      />

      <section className="mt-10 rounded-xl border border-[var(--line)] bg-[var(--brand-soft)] px-4 py-5 sm:px-6">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)]">
          Conclusion
        </h2>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          So, what does compressing a PDF do? It reduces unnecessary file data
          and optimizes document elements to create a smaller PDF.
        </p>
        <p className="mt-3 text-base leading-7 text-[var(--ink)]">
          This makes documents easier to share, upload, and store, but stronger
          compression can affect image quality. To reduce your file size, use
          the{" "}
          <In href={compressPdf.href}>free PDF compressor</In> and choose a
          compression level that keeps your document readable.
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
