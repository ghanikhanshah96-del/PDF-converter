import type { ToolPageContent } from "../types";

const content: ToolPageContent = {
  sections: [
    {
      type: "bullets",
      heading: "View PDF Files Online for Free",
      intro:
        "Open a PDF in your browser and scroll through every page without installing a reader. Viewing stays on your device.",
      items: [
        "Open multi-page PDFs quickly",
        "Smooth scrolling for long documents",
        "No account or desktop software required",
        "Useful after converting, merging, or rotating a file",
        "Works alongside our other free PDF tools",
      ],
    },
    {
      type: "steps",
      heading: "How to Use the Free PDF Viewer",
      steps: [
        "Select the PDF file you want to view.",
        "Wait a moment while pages open in the viewer.",
        "Scroll through the document at your own pace.",
        "Close the viewer when you are finished.",
      ],
    },
    {
      type: "bullets",
      heading: "What Is an Online PDF Viewer?",
      intro:
        "An online PDF viewer shows PDF pages in the browser so you can read a document without downloading a separate app.",
      items: [
        "Displays pages as a scrollable preview",
        "Helps you check a file after conversion",
        "Keeps processing in the browser for this step",
        "Supports common PDF documents within the size limit",
      ],
    },
    {
      type: "prose",
      heading: "Tips for a clearer preview",
      paragraphs: [
        "Text-based PDFs usually look sharp. Scanned pages appear as images and remain readable when the scan quality is good.",
        "After you download a PDF from another tool on this site, use View PDF on the result card for a full-page preview.",
        "Need to change the file? Try Edit PDF, Merge PDF, or Split PDF after you finish reading.",
      ],
    },
  ],
};

export default content;
