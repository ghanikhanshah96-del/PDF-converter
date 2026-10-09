import type { ToolPageContent } from "../types";

const content: ToolPageContent = {
  sections: [
    {
      type: "bullets",
      heading: "What this Word to PDF tool does",
      intro:
        "BestFreePDFConverter.com reads a DOCX file in your browser, extracts the text, and builds a new PDF. It does not copy the Word design.",
      items: [
        "DOCX files only. Legacy DOC files are not accepted.",
        "Up to 50 MB per file and 20 files in one visit.",
        "Each file becomes its own PDF. Files are not merged.",
        "Body text is placed on US Letter pages.",
        "The original DOCX file is not rewritten.",
      ],
    },
    {
      type: "cards",
      heading: "What the PDF does not keep",
      intro:
        "Getting a file named .pdf does not mean the Word layout was preserved.",
      items: [
        {
          title: "Images",
          text: "Pictures are not drawn. A document that contains only images can produce a PDF that says (Empty document).",
        },
        {
          title: "Tables",
          text: "Columns and borders are not rebuilt. Extracted cell text is written as ordinary lines.",
        },
        {
          title: "Headers and page setup",
          text: "Headers, footers, page numbers, Word fonts, and the original page size are not copied. Pages are letter size with fixed margins.",
        },
        {
          title: "A faithful copy",
          text: "Export from Microsoft Word or Google Docs when the pages, pictures, or tables have to match the original.",
        },
      ],
    },
    {
      type: "prose",
      heading: "How to read the result",
      paragraphs: [
        "After you select Convert to PDF, wait until the status says Ready.",
        "Then select Download, or Download all when more than one PDF is ready.",
        "Open the file and confirm the words you needed are there.",
        "If images or table alignment matter, this output is the wrong tool for that document.",
        "A step-by-step explanation is on the guide How to Download a Word Document as a PDF, linked above the tool.",
      ],
    },
    {
      type: "prose",
      heading: "File handling",
      paragraphs: [
        "Conversion runs in the browser. The DOCX is not posted to a conversion API for this tool.",
        "Refreshing the page can discard the in-memory PDF, so download it before you leave.",
        "Read the Privacy Policy for how this site describes local processing. Conversion does not encrypt the file or remove hidden information.",
      ],
    },
    {
      type: "cta",
      heading: "Convert a DOCX file",
      text: "Select a DOCX file of 50 MB or less, choose Convert to PDF, then download the text PDF and check it.",
      buttonLabel: "Select a DOCX file",
    },
  ],
};

export default content;
