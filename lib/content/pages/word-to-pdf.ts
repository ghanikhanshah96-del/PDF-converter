import type { ToolPageContent } from "../types";

const content: ToolPageContent = {
  sections: [
    {
      type: "bullets",
      heading: "What this Word to PDF tool does",
      intro:
        "BestFreePDFConverter.com converts a DOCX file with a document engine so the PDF keeps the Word charts, colors, text, and pages.",
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
        "The PDF is printed from the Word file, including its charts and page layout.",
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
          title: "Charts and pictures",
          text: "Charts, images, headers, and footers are printed with the page instead of being redrawn.",
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
