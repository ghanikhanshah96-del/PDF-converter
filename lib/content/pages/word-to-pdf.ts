import type { ToolPageContent } from "../types";

const content: ToolPageContent = {
  sections: [
    {
      type: "bullets",
      heading: "What this Word to PDF tool does",
      intro:
        "BestFreePDFConverter.com reads a DOCX file in your browser and builds a PDF that keeps the document layout, including pictures, watermarks, and background images.",
      items: [
        "DOCX files only. Legacy DOC files are not accepted.",
        "Up to 50 MB per file and 20 files in one visit.",
        "Each file becomes its own PDF. Files are not merged.",
        "Headings, tables, pictures, and page size from the Word file are kept.",
        "The original DOCX file is not rewritten.",
      ],
    },
    {
      type: "cards",
      heading: "What the PDF keeps",
      intro:
        "The PDF is built in your browser from the Word pages, including pictures and watermarks.",
      items: [
        {
          title: "Headings",
          text: "Heading sizes and styles stay on the page instead of becoming plain lines.",
        },
        {
          title: "Tables",
          text: "Table rows, columns, and borders are kept in the PDF.",
        },
        {
          title: "Pictures and watermarks",
          text: "Images, background pictures, watermarks, headers, and footers from the DOCX are included with the page.",
        },
        {
          title: "Page layout",
          text: "The Word page size and arrangement are used for the PDF pages.",
        },
      ],
    },
    {
      type: "prose",
      heading: "How to read the result",
      paragraphs: [
        "After you select Convert to PDF, wait until the status says Ready.",
        "Then select Download, or Download all when more than one PDF is ready.",
        "Open the PDF and check the headings, tables, and pictures.",
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
      text: "Select a DOCX file of 50 MB or less, choose Convert to PDF, then download the PDF and check the layout.",
      buttonLabel: "Select a DOCX file",
    },
  ],
};

export default content;
