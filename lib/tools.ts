export type ToolId =
  | "pdf-to-word"
  | "word-to-pdf"
  | "merge-pdf"
  | "split-pdf"
  | "compress-pdf"
  | "pdf-to-jpg"
  | "jpg-to-pdf"
  | "edit-pdf"
  | "pdf-password-remover"
  | "sign-pdf"
  | "excel-to-pdf"
  | "pdf-to-excel"
  | "rotate-pdf"
  | "unlock-pdf";

export type ToolCategory =
  | "convert"
  | "organize"
  | "optimize"
  | "edit"
  | "secure";

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolDefinition {
  id: ToolId;
  slug: string;
  href: string;
  name: string;
  shortName: string;
  category: ToolCategory;
  summary: string;
  description: string;
  h1: string;
  title: string;
  metaDescription: string;
  howTo: string[];
  faqs: ToolFaq[];
  related: ToolId[];
  accept: string;
  multiple: boolean;
  keywords: string[];
}

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  convert: "Convert",
  organize: "Organize",
  optimize: "Optimize",
  edit: "Edit & Sign",
  secure: "Secure",
};

export const tools: ToolDefinition[] = [
  {
    id: "pdf-to-word",
    slug: "pdf-to-word",
    href: "/pdf-to-word",
    name: "PDF to Word",
    shortName: "PDF → Word",
    category: "convert",
    summary: "Convert your PDF files into editable Word documents quickly with our free PDF to Word Converter.",
    description: "Convert your PDF files into editable Word documents quickly with our free PDF to Word Converter. Select your PDF, convert it into a DOCX file, and download a document that you can edit in Microsoft Word, Google Docs, or other word processors.",
    h1: "Free PDF to Word Converter Online",
    title: "Free PDF to Word Converter Online | Convert PDF to DOCX",
    metaDescription: "Convert PDF to Word online for free. Turn PDF files into editable DOCX documents quickly with our simple PDF converter tool.",
    howTo: [
          "Select the PDF file you want to convert from your device.",
          "Start the conversion process and allow the tool to transform your PDF into a Word document.",
          "Once complete, download the DOCX file and open it in your preferred editor."
    ],
    faqs: [
          {
                "question": "How do I convert PDF to Word for free?",
                "answer": "Select your PDF file in the converter, start the conversion, and download the resulting Word document."
          },
          {
                "question": "Can I convert PDF to Word online?",
                "answer": "Yes. An online PDF to Word converter allows you to convert files directly through your browser without installing software."
          },
          {
                "question": "What format will I get after conversion?",
                "answer": "Most PDF to Word converters create a DOCX file, which can be opened with Microsoft Word, Google Docs, and other compatible programs."
          },
          {
                "question": "Can I edit the converted Word document?",
                "answer": "Yes. After conversion, the Word file can be edited like a normal document."
          },
          {
                "question": "Does converting PDF to Word keep the original formatting?",
                "answer": "Many elements such as text and headings can be preserved, but complex layouts, images, and tables may require additional adjustments."
          },
          {
                "question": "Can I convert scanned PDFs into Word files?",
                "answer": "Scanned PDFs contain images instead of selectable text. They may require OCR technology to extract editable text."
          },
          {
                "question": "Is this PDF to Word converter free?",
                "answer": "Yes, you can use this tool to convert PDF files into Word documents without paying for conversion software."
          },
          {
                "question": "Can I use this converter on mobile?",
                "answer": "Yes. The tool works through a modern web browser on mobile devices, tablets, and computers."
          }
    ],
    related: ["word-to-pdf","pdf-to-excel","pdf-to-jpg"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["pdf to word converter online","pdf to word converter free download","convert pdf to word free","free online pdf to word converter","pdf to docx converter free"],
  },
  {
    id: "word-to-pdf",
    slug: "word-to-pdf",
    href: "/word-to-pdf",
    name: "Word to PDF",
    shortName: "Word → PDF",
    category: "convert",
    summary: "Convert your Word documents into PDF files quickly with our free Word to PDF Converter.",
    description: "Convert your Word documents into PDF files quickly with our free Word to PDF Converter. Select your DOC or DOCX file, convert it into a PDF, and download a document that is easy to share, print, and open on any device.",
    h1: "Free Word to PDF Converter Online",
    title: "Free Word to PDF Converter Online | Convert DOCX to PDF",
    metaDescription: "Convert Word documents to PDF online for free. Turn DOC or DOCX files into professional PDF documents quickly with our easy converter.",
    howTo: [
          "Choose the DOC or DOCX document you want to convert.",
          "Start the conversion process and let the tool create your PDF file.",
          "Download the final PDF and use it for sharing, printing, or storage."
    ],
    faqs: [
          {
                "question": "How do I convert Word to PDF for free?",
                "answer": "Select your Word document, start the conversion process, and download your PDF file."
          },
          {
                "question": "Can I convert DOCX to PDF online?",
                "answer": "Yes. A Word to PDF converter can convert DOCX files into PDF documents directly through your browser."
          },
          {
                "question": "Is this Word to PDF converter free?",
                "answer": "Yes. You can convert Word documents into PDF format without paying for desktop conversion software."
          },
          {
                "question": "Will my formatting stay the same after conversion?",
                "answer": "Most text, headings, images, and basic formatting are preserved, but complex layouts may require checking after conversion."
          },
          {
                "question": "Can I convert Word files on mobile?",
                "answer": "Yes. Online Word to PDF converters work through modern mobile browsers."
          },
          {
                "question": "What is the difference between DOC and DOCX?",
                "answer": "DOC is an older Microsoft Word format, while DOCX is the newer format used by modern versions of Word."
          },
          {
                "question": "Why should I convert Word to PDF?",
                "answer": "PDF keeps your document layout consistent and makes sharing easier across different devices."
          },
          {
                "question": "Can I edit a PDF after converting Word to PDF?",
                "answer": "PDF files are mainly designed for viewing and sharing. If you need to make changes, you can convert the PDF back into Word format or use a PDF editor."
          }
    ],
    related: ["pdf-to-word","excel-to-pdf","merge-pdf"],
    accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx",
    multiple: false,
    keywords: ["word to pdf converter online","convert word to pdf free","free online word to pdf converter","docx to pdf converter free","convert doc to pdf online"],
  },
  {
    id: "merge-pdf",
    slug: "merge-pdf",
    href: "/merge-pdf",
    name: "Merge PDF",
    shortName: "Merge",
    category: "organize",
    summary: "Combine multiple PDF files into one document with our free Merge PDF Online tool.",
    description: "Combine multiple PDF files into one document with our free Merge PDF Online tool. Select your PDF files, arrange them in the required order, merge them together, and download a single combined PDF.",
    h1: "Free Merge PDF Online Tool",
    title: "Free Merge PDF Online Tool | Combine PDF Files Easily",
    metaDescription: "Merge PDF files online for free. Combine multiple PDF documents into one file quickly with our simple and easy PDF merger tool.",
    howTo: [
          "Select the PDF files you want to combine.",
          "Arrange the files in your preferred order.",
          "Start the merging process.",
          "Download your combined PDF file."
    ],
    faqs: [
          {
                "question": "How do I merge PDF files for free?",
                "answer": "Select your PDF documents, arrange them in the correct order, merge the files, and download the final combined PDF."
          },
          {
                "question": "Can I merge multiple PDF files into one?",
                "answer": "Yes. A PDF merger allows you to combine multiple PDF documents into a single file."
          },
          {
                "question": "Is this merge PDF tool free?",
                "answer": "Yes. You can use the tool to combine PDF files without purchasing desktop software."
          },
          {
                "question": "Does merging PDFs change the original files?",
                "answer": "No. The original PDF files remain unchanged. The tool creates a new combined PDF document."
          },
          {
                "question": "Can I merge PDFs online without software?",
                "answer": "Yes. Online PDF merger tools work directly through a browser without requiring installation."
          },
          {
                "question": "Can I merge PDFs on my phone?",
                "answer": "Yes. The tool can be accessed through mobile browsers on smartphones and tablets."
          },
          {
                "question": "How many PDF files can I combine?",
                "answer": "The number of files you can merge depends on the tool limits and the size of your documents."
          },
          {
                "question": "Will my PDF quality decrease after merging?",
                "answer": "A proper PDF merger combines documents without reducing the quality of text or images."
          }
    ],
    related: ["split-pdf","compress-pdf","rotate-pdf"],
    accept: "application/pdf,.pdf",
    multiple: true,
    keywords: ["merge pdf files free online","combine pdf files online","pdf merger online free","merge multiple pdf files","combine pdf documents into one"],
  },
  {
    id: "split-pdf",
    slug: "split-pdf",
    href: "/split-pdf",
    name: "Split PDF",
    shortName: "Split",
    category: "organize",
    summary: "Split PDF files quickly with our free Split PDF Online tool.",
    description: "Split PDF files quickly with our free Split PDF Online tool. Separate pages, extract specific sections, or divide a large PDF document into smaller files without complicated software.",
    h1: "Free Split PDF Online Tool",
    title: "Free Split PDF Online Tool | Extract PDF Pages Easily",
    metaDescription: "Split PDF files online for free. Extract pages, divide documents, and create separate PDF files quickly with our simple PDF splitter tool.",
    howTo: [
          "Select your PDF file.",
          "Select the pages or sections you want to separate.",
          "Start the splitting process.",
          "Download your new PDF files."
    ],
    faqs: [
          {
                "question": "How do I split a PDF file for free?",
                "answer": "Select your PDF, select the pages you want to separate, start the splitting process, and download the new PDF files."
          },
          {
                "question": "Can I split a PDF online without software?",
                "answer": "Yes. An online PDF splitter works directly through your browser without requiring installation."
          },
          {
                "question": "Can I split PDF documents into separate pages?",
                "answer": "Yes. You can divide a PDF into individual pages or selected page ranges depending on the tool options."
          },
          {
                "question": "Is this split PDF tool free?",
                "answer": "Yes. You can use this tool to separate PDF files without purchasing additional software."
          },
          {
                "question": "Will splitting a PDF change the original file?",
                "answer": "No. The original PDF remains unchanged. The tool creates new files from the selected pages."
          },
          {
                "question": "Can I extract only certain pages from a PDF?",
                "answer": "Yes. You can choose specific pages or page ranges and save them as a separate PDF."
          },
          {
                "question": "Can I split PDF files on my phone?",
                "answer": "Yes. The tool can be accessed through a mobile browser on smartphones and tablets."
          },
          {
                "question": "Does splitting a PDF reduce quality?",
                "answer": "No. Splitting normally keeps the original page quality, including text and images."
          }
    ],
    related: ["merge-pdf","rotate-pdf","compress-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["split pdf documents online free","split pdf files online","pdf splitter online free","extract pages from pdf online","separate pdf pages free"],
  },
  {
    id: "compress-pdf",
    slug: "compress-pdf",
    href: "/compress-pdf",
    name: "Compress PDF",
    shortName: "Compress",
    category: "optimize",
    summary: "Reduce the size of your PDF files quickly with our free Compress PDF tool.",
    description: "Reduce the size of your PDF files quickly with our free Compress PDF tool. Select your document, compress the file, and download a smaller PDF that is easier to share, upload, and store.",
    h1: "Free Compress PDF Online Tool",
    title: "Free Compress PDF Tool Online | Reduce PDF File Size",
    metaDescription: "Compress PDF files online for free. Reduce PDF size quickly while keeping your document quality with our simple PDF compressor tool.",
    howTo: [
          "Select your PDF document.",
          "Start the compression process.",
          "Wait while the file size is reduced.",
          "Download your smaller PDF file."
    ],
    faqs: [
          {
                "question": "How do I compress a PDF file for free?",
                "answer": "Select your PDF document, start the compression process, and download the smaller version of your file."
          },
          {
                "question": "Can I compress PDF files online?",
                "answer": "Yes. An online PDF compressor allows you to reduce file size directly from your browser."
          },
          {
                "question": "Is this PDF compressor free?",
                "answer": "Yes. You can compress PDF files without purchasing additional software."
          },
          {
                "question": "Will compressing a PDF reduce quality?",
                "answer": "Compression may slightly affect some elements, especially large images. A good compressor balances smaller file size with document quality."
          },
          {
                "question": "Why is my PDF file so large?",
                "answer": "PDF files can become large because of high-resolution images, scanned pages, graphics, and embedded content."
          },
          {
                "question": "Can I compress PDF files on my phone?",
                "answer": "Yes. You can use an online PDF compressor from mobile devices with a modern browser."
          },
          {
                "question": "Does PDF compression change the original file?",
                "answer": "No. Compression creates a smaller version while your original PDF remains unchanged."
          },
          {
                "question": "What is the best way to reduce PDF size?",
                "answer": "Using a PDF compression tool is one of the easiest ways to reduce file size while keeping the document usable."
          }
    ],
    related: ["merge-pdf","pdf-to-jpg","jpg-to-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["compress pdf document free","compress pdf online free","reduce pdf file size free","pdf compressor online","shrink pdf size online"],
  },
  {
    id: "pdf-to-jpg",
    slug: "pdf-to-jpg",
    href: "/pdf-to-jpg",
    name: "PDF to JPG",
    shortName: "PDF → JPG",
    category: "convert",
    summary: "Convert your PDF files into JPG images quickly with our free PDF to JPG Converter.",
    description: "Convert your PDF files into JPG images quickly with our free PDF to JPG Converter. Select your PDF document, convert each page into a JPG image, and download your images for sharing, editing, or online use.",
    h1: "Free PDF to JPG Converter Online",
    title: "Free PDF to JPG Converter Online | Convert PDF to Image",
    metaDescription: "Convert PDF to JPG online for free. Turn PDF pages into high-quality JPG images quickly with our simple PDF image converter tool.",
    howTo: [
          "Select your PDF file.",
          "Start the conversion process.",
          "Wait while your PDF pages are converted into images.",
          "Download your JPG files."
    ],
    faqs: [
          {
                "question": "How do I convert PDF to JPG for free?",
                "answer": "Select your PDF file, start the conversion process, and download the JPG images created from your document pages."
          },
          {
                "question": "Can I convert PDF pages into JPG images?",
                "answer": "Yes. A PDF to JPG converter can turn individual PDF pages into separate JPG image files."
          },
          {
                "question": "Is this PDF to JPG converter free?",
                "answer": "Yes. You can convert PDF files into JPG images without purchasing additional software."
          },
          {
                "question": "Can I convert PDF to JPG online?",
                "answer": "Yes. Online PDF converters allow you to change PDF files into JPG images directly through your browser."
          },
          {
                "question": "What is the difference between PDF and JPG?",
                "answer": "PDF is mainly used for documents, while JPG is an image format commonly used for photos, graphics, and visual content."
          },
          {
                "question": "Will my PDF formatting stay the same after conversion?",
                "answer": "The converter keeps the page appearance as an image, but the result is no longer an editable PDF document."
          },
          {
                "question": "Can I convert a multi-page PDF into JPG files?",
                "answer": "Yes. Multi-page PDFs can be converted into separate JPG images for each page."
          },
          {
                "question": "Can I use JPG images after conversion?",
                "answer": "Yes. JPG files can be used in websites, presentations, documents, social media, and other image-supported platforms."
          }
    ],
    related: ["jpg-to-pdf","compress-pdf","pdf-to-word"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["pdf to jpg converter free online","convert pdf to jpg online","pdf to jpeg converter free","convert pdf pages to images","pdf to image converter online"],
  },
  {
    id: "jpg-to-pdf",
    slug: "jpg-to-pdf",
    href: "/jpg-to-pdf",
    name: "JPG to PDF",
    shortName: "JPG → PDF",
    category: "convert",
    summary: "Convert your JPG images into PDF files quickly with our free JPG to PDF Converter.",
    description: "Convert your JPG images into PDF files quickly with our free JPG to PDF Converter. Select your images, arrange them in the right order, convert them into a single PDF document, and download your file instantly.",
    h1: "Free JPG to PDF Converter Online",
    title: "Free JPG to PDF Converter Online | Convert Images to PDF",
    metaDescription: "Convert JPG images to PDF online for free. Combine photos into one PDF file quickly with our simple JPG to PDF converter tool.",
    howTo: [
          "Select your JPG or JPEG images.",
          "Arrange images in your preferred order.",
          "Start the conversion process.",
          "Download your new PDF file."
    ],
    faqs: [
          {
                "question": "How do I convert JPG to PDF for free?",
                "answer": "Select your JPG images, arrange them, convert them into a PDF file, and download the result."
          },
          {
                "question": "Can I convert multiple JPG images into one PDF?",
                "answer": "Yes. You can combine multiple JPG files and create a single PDF document."
          },
          {
                "question": "Is this JPG to PDF converter free?",
                "answer": "Yes. You can convert JPG images into PDF files without purchasing additional software."
          },
          {
                "question": "Can I convert JPEG images to PDF?",
                "answer": "Yes. JPEG and JPG are the same image format, and both can be converted into PDF documents."
          },
          {
                "question": "Why should I convert JPG images into PDF?",
                "answer": "PDF format makes images easier to share, print, organize, and submit as official documents."
          },
          {
                "question": "Can I convert JPG to PDF online?",
                "answer": "Yes. Online converters allow you to create PDF files directly from your browser."
          },
          {
                "question": "Will my images stay in the same order?",
                "answer": "Most tools allow you to arrange images before conversion so the PDF pages appear in your preferred sequence."
          },
          {
                "question": "Can I use this tool on my phone?",
                "answer": "Yes. The converter works on smartphones, tablets, and desktop devices."
          }
    ],
    related: ["pdf-to-jpg","merge-pdf","compress-pdf"],
    accept: "image/jpeg,image/jpg,image/png,image/webp,.jpg,.jpeg,.png,.webp",
    multiple: true,
    keywords: ["jpg to pdf converter online free","convert jpg to pdf free","jpg images to pdf converter","convert multiple jpg to pdf","image to pdf converter online","jpeg to pdf converter free"],
  },
  {
    id: "edit-pdf",
    slug: "edit-pdf",
    href: "/edit-pdf",
    name: "Edit PDF",
    shortName: "Edit",
    category: "edit",
    summary: "Edit your PDF files quickly with our free Edit PDF Online tool.",
    description: "Edit your PDF files quickly with our free Edit PDF Online tool. Add text, images, annotations, and make changes to your PDF documents directly from your browser.",
    h1: "Free Edit PDF Online Tool",
    title: "Free Edit PDF Online Tool | Edit PDF Files Easily",
    metaDescription: "Edit PDF files online for free. Add text, images, annotations, and make changes to your documents with our easy PDF editor tool.",
    howTo: [
          "Select your PDF document.",
          "Open the file in the PDF editor.",
          "Make the required changes.",
          "Save and download your edited PDF."
    ],
    faqs: [
          {
                "question": "How can I edit a PDF online for free?",
                "answer": "Select your PDF file, use the editing tools to make changes, then save and download your updated document."
          },
          {
                "question": "Can I edit a PDF without downloading software?",
                "answer": "Yes. Online PDF editors allow you to modify PDF files directly from your browser."
          },
          {
                "question": "Is this PDF editor free?",
                "answer": "Yes. You can use the tool to make basic PDF edits without purchasing expensive software."
          },
          {
                "question": "Can I add text to a PDF online?",
                "answer": "Yes. A PDF editor can help you insert new text into your document."
          },
          {
                "question": "Can I add images to a PDF?",
                "answer": "Yes. Many PDF editors allow users to insert images and other visual elements."
          },
          {
                "question": "Can I edit PDF files on my phone?",
                "answer": "Yes. Online PDF editors work on mobile browsers, allowing you to edit documents from smartphones and tablets."
          },
          {
                "question": "Will editing a PDF change the original file?",
                "answer": "The original file remains unchanged unless you overwrite it. It is recommended to keep a backup copy."
          },
          {
                "question": "What is the difference between a PDF reader and PDF editor?",
                "answer": "A PDF reader is mainly used for viewing files, while a PDF editor allows you to make changes to the document."
          }
    ],
    related: ["sign-pdf","rotate-pdf","merge-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["online pdf editor free","free pdf editor online","edit pdf file online","edit pdf document free","pdf editor without download","add text to pdf online free"],
  },
  {
    id: "pdf-password-remover",
    slug: "pdf-password-remover",
    href: "/pdf-password-remover",
    name: "PDF Password Remover",
    shortName: "Remove Password",
    category: "secure",
    summary: "Remove password protection from your PDF files quickly with our free PDF Password Remover tool.",
    description: "Remove password protection from your PDF files quickly with our free PDF Password Remover tool. Select your protected PDF, enter the required password, and create an unlocked version that is easier to open, share, and manage.",
    h1: "Free PDF Password Remover Online",
    title: "Free PDF Password Remover Online | Unlock PDF Files",
    metaDescription: "Remove password from PDF files online for free. Unlock protected PDF documents and create an accessible version quickly with our tool.",
    howTo: [
          "Select your password-protected PDF file.",
          "Enter the current password if required.",
          "Start the password removal process.",
          "Download your unlocked PDF file."
    ],
    faqs: [
          {
                "question": "How to remove password from PDF?",
                "answer": "Select your protected PDF, enter the existing password, and use the tool to create an unlocked PDF version."
          },
          {
                "question": "How do I remove a password from a PDF?",
                "answer": "You can remove a PDF password by using a PDF password remover tool with the correct password or authorization."
          },
          {
                "question": "Can I remove password protection from a PDF for free?",
                "answer": "Yes. A free PDF password remover can help unlock your own PDF documents without paid software."
          },
          {
                "question": "Can I unlock a password-protected PDF online?",
                "answer": "Yes. Online PDF unlock tools allow users to remove protection through a web browser."
          },
          {
                "question": "Is it legal to remove a PDF password?",
                "answer": "You should only remove passwords from PDF files that you own or have permission to access."
          },
          {
                "question": "Does removing a PDF password delete the document content?",
                "answer": "No. Removing protection does not delete the PDF content. The document pages and information remain available."
          },
          {
                "question": "Can I remove PDF restrictions on my phone?",
                "answer": "Yes. Online PDF tools can be accessed from mobile browsers."
          },
          {
                "question": "Will the original PDF remain protected?",
                "answer": "The original file remains unchanged unless you replace it. It is recommended to keep a backup copy."
          }
    ],
    related: ["unlock-pdf","sign-pdf","compress-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["how to remove password from pdf","how do i remove a password from a pdf","remove password from pdf","unlock password protected pdf","pdf unlock tool online","remove pdf security free"],
  },
  {
    id: "sign-pdf",
    slug: "sign-pdf",
    href: "/sign-pdf",
    name: "Sign PDF",
    shortName: "Sign",
    category: "edit",
    summary: "Add your signature to PDF documents quickly with our free Sign PDF Online tool.",
    description: "Add your signature to PDF documents quickly with our free Sign PDF Online tool. Select your PDF file, create your signature, place it on the document, and download your signed PDF in just a few steps.",
    h1: "Sign PDF Online Free",
    title: "Sign PDF Online Free | Add Electronic Signature to PDF",
    metaDescription: "Sign PDF files online for free. Add your electronic signature, initials, or date to PDF documents quickly without printing or scanning.",
    howTo: [
          "Select your PDF document.",
          "Create your signature by typing, drawing, or uploading an image.",
          "Place your signature in the correct location.",
          "Download your signed PDF file."
    ],
    faqs: [
          {
                "question": "How do I sign a PDF online?",
                "answer": "Select your PDF, create your signature, place it on the document, and download the signed file."
          },
          {
                "question": "Can I sign a PDF for free?",
                "answer": "Yes. You can add a signature to PDF documents using a free online PDF signer."
          },
          {
                "question": "How can I add a signature to a PDF?",
                "answer": "You can add a signature by drawing it, typing your name, or uploading a signature image."
          },
          {
                "question": "Can I sign a PDF without printing?",
                "answer": "Yes. Online PDF signing allows you to complete documents digitally without printing or scanning."
          },
          {
                "question": "Can I sign a PDF on my phone?",
                "answer": "Yes. You can sign PDFs using a smartphone or tablet browser."
          },
          {
                "question": "What is an electronic signature PDF?",
                "answer": "An electronic signature PDF is a document that contains a digital representation of a person's signature."
          },
          {
                "question": "Can I add multiple signatures to a PDF?",
                "answer": "Many PDF signing tools allow users to add multiple signatures, initials, or text fields."
          },
          {
                "question": "Is a signed PDF editable?",
                "answer": "A signed PDF can still have different editing options depending on how the signature was applied and document restrictions."
          }
    ],
    related: ["edit-pdf","unlock-pdf","merge-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["sign pdf online","add signature to pdf online free","electronic signature pdf","esign pdf online free","free pdf signer online","how to sign a pdf document","create digital signature for pdf"],
  },
  {
    id: "excel-to-pdf",
    slug: "excel-to-pdf",
    href: "/excel-to-pdf",
    name: "Excel to PDF",
    shortName: "Excel → PDF",
    category: "convert",
    summary: "Convert your Excel spreadsheets into PDF files quickly with our free Excel to PDF Converter.",
    description: "Convert your Excel spreadsheets into PDF files quickly with our free Excel to PDF Converter. Select your XLS or XLSX file, convert it into a PDF document, and download a file that is easy to share, print, and view on any device.",
    h1: "Free Excel to PDF Converter Online",
    title: "Free Excel to PDF Converter Online | Convert XLSX to PDF",
    metaDescription: "Convert Excel files to PDF online for free. Turn XLS and XLSX spreadsheets into professional PDF documents while keeping your formatting.",
    howTo: [
          "Select your Excel file.",
          "Start the conversion process.",
          "Wait while your spreadsheet is converted.",
          "Download your PDF document."
    ],
    faqs: [
          {
                "question": "How do I convert Excel to PDF for free?",
                "answer": "Select your Excel spreadsheet, start the conversion process, and download your converted PDF file."
          },
          {
                "question": "Can I convert XLSX to PDF online?",
                "answer": "Yes. An XLSX to PDF converter can transform Excel workbook files into PDF documents."
          },
          {
                "question": "Is this Excel to PDF converter free?",
                "answer": "Yes. You can convert Excel spreadsheets into PDF files without purchasing additional software."
          },
          {
                "question": "Will my Excel formatting stay the same after conversion?",
                "answer": "Most formatting elements are preserved, but complex spreadsheets should be reviewed after conversion."
          },
          {
                "question": "Can I convert Excel files on my phone?",
                "answer": "Yes. Online Excel converters work through mobile browsers on smartphones and tablets."
          },
          {
                "question": "Why should I convert Excel to PDF?",
                "answer": "PDF format makes spreadsheets easier to share, print, and view consistently across devices."
          },
          {
                "question": "What Excel formats can be converted?",
                "answer": "Most converters support common formats such as XLS and XLSX files."
          },
          {
                "question": "Can I edit a PDF after converting Excel to PDF?",
                "answer": "PDF files are mainly designed for sharing and viewing. For major changes, edit the original Excel file or use a PDF editor."
          }
    ],
    related: ["pdf-to-excel","word-to-pdf","jpg-to-pdf"],
    accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx",
    multiple: false,
    keywords: ["excel to pdf converter online","convert excel to pdf free","xlsx to pdf converter","convert excel spreadsheet to pdf","excel file to pdf converter","free excel to pdf converter online"],
  },
  {
    id: "pdf-to-excel",
    slug: "pdf-to-excel",
    href: "/pdf-to-excel",
    name: "PDF to Excel",
    shortName: "PDF → Excel",
    category: "convert",
    summary: "Convert your PDF files into editable Excel spreadsheets with our free PDF to Excel Converter.",
    description: "Convert your PDF files into editable Excel spreadsheets with our free PDF to Excel Converter. Select your PDF document, extract tables and data, and download an XLSX file that you can edit, analyze, and organize.",
    h1: "Free PDF to Excel Converter Online",
    title: "Free PDF to Excel Converter Online | Convert PDF to XLSX",
    metaDescription: "Convert PDF to Excel online for free. Extract tables and data from PDF files into editable XLSX spreadsheets quickly with our tool.",
    howTo: [
          "Select your PDF file.",
          "Start the conversion process.",
          "Wait while the PDF data is extracted.",
          "Download your Excel file."
    ],
    faqs: [
          {
                "question": "How do I convert PDF to Excel?",
                "answer": "Select your PDF file, start the conversion process, and download the converted Excel spreadsheet."
          },
          {
                "question": "Can I convert PDF to Excel for free?",
                "answer": "Yes. You can convert PDF documents into Excel files without purchasing additional software."
          },
          {
                "question": "How to convert PDF to Excel?",
                "answer": "To convert PDF to Excel, select the document, process the file, and download the resulting XLSX spreadsheet."
          },
          {
                "question": "Can I convert PDF tables into Excel?",
                "answer": "Yes. PDF table conversion helps move rows and columns from PDF documents into editable Excel files."
          },
          {
                "question": "What format will I get after conversion?",
                "answer": "Most PDF to Excel converters create XLSX files compatible with Microsoft Excel and other spreadsheet programs."
          },
          {
                "question": "Can I convert scanned PDF to Excel?",
                "answer": "Scanned PDFs may require OCR technology to extract editable data."
          },
          {
                "question": "Is PDF to Excel conversion accurate?",
                "answer": "Accuracy depends on the original PDF structure, table complexity, and document quality."
          },
          {
                "question": "Can I edit the converted Excel file?",
                "answer": "Yes. After conversion, you can edit, filter, sort, and analyze the spreadsheet data."
          }
    ],
    related: ["excel-to-pdf","pdf-to-word","pdf-to-jpg"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["pdf to excel converter online","convert pdf to excel free","pdf to xlsx converter","how to convert pdf to excel","convert pdf table to excel","pdf to spreadsheet converter","extract data from pdf to excel"],
  },
  {
    id: "rotate-pdf",
    slug: "rotate-pdf",
    href: "/rotate-pdf",
    name: "Rotate PDF",
    shortName: "Rotate",
    category: "organize",
    summary: "Fix your PDF page orientation quickly with our free Rotate PDF Online tool.",
    description: "Fix your PDF page orientation quickly with our free Rotate PDF Online tool. Rotate individual pages or an entire PDF document in the correct direction without installing any software.",
    h1: "Rotate PDF Online Free",
    title: "Rotate PDF Online Free | Change PDF Page Orientation",
    metaDescription: "Rotate PDF pages online for free. Turn, flip, and fix PDF page orientation quickly with our simple PDF rotation tool.",
    howTo: [
          "Select your PDF file.",
          "Select the pages you want to rotate.",
          "Choose the rotation direction.",
          "Save and download your updated PDF."
    ],
    faqs: [
          {
                "question": "How do I rotate a PDF online?",
                "answer": "Select your PDF, choose the pages, select the rotation direction, and download the updated file."
          },
          {
                "question": "Can I rotate PDF pages for free?",
                "answer": "Yes. You can rotate PDF documents using a free online PDF rotation tool."
          },
          {
                "question": "Can I rotate only one page in a PDF?",
                "answer": "Yes. Many PDF rotation tools allow you to select specific pages instead of rotating the entire document."
          },
          {
                "question": "How do I rotate a PDF document online?",
                "answer": "Select your PDF file, select the required rotation angle, and save the modified document."
          },
          {
                "question": "Can I rotate a PDF on my phone?",
                "answer": "Yes. You can rotate PDF files using a mobile browser without installing additional software."
          },
          {
                "question": "Will rotating a PDF change the content?",
                "answer": "No. Rotation changes the page direction but does not edit the text or images inside the PDF."
          },
          {
                "question": "Can I rotate multiple PDF pages at once?",
                "answer": "Yes. You can rotate multiple pages together to save time."
          },
          {
                "question": "Why are my PDF pages sideways?",
                "answer": "PDF pages may appear sideways because of incorrect scanning, document creation settings, or page orientation issues."
          }
    ],
    related: ["split-pdf","merge-pdf","edit-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["rotate pdf document online","rotate pdf pages online free","rotate PDF file free","change PDF page orientation online","turn PDF pages clockwise","PDF page rotator online","rotate PDF pages and save"],
  },
  {
    id: "unlock-pdf",
    slug: "unlock-pdf",
    href: "/unlock-pdf",
    name: "Unlock PDF",
    shortName: "Unlock",
    category: "secure",
    summary: "Unlock your PDF files quickly with our free Unlock PDF Online tool.",
    description: "Unlock your PDF files quickly with our free Unlock PDF Online tool. Remove restrictions from your PDF documents and make them easier to access, edit, copy, or share when you have the required permission.",
    h1: "Unlock PDF Online Free",
    title: "Unlock PDF Online Free | Remove PDF Restrictions Easily",
    metaDescription: "Unlock PDF files online for free. Remove PDF restrictions and access your documents easily with our simple PDF unlock tool.",
    howTo: [
          "Select your locked PDF file.",
          "Start the unlocking process.",
          "Wait while restrictions are removed.",
          "Download your unlocked PDF document."
    ],
    faqs: [
          {
                "question": "How do I unlock a PDF online?",
                "answer": "Select your PDF file, start the unlocking process, and download the document after restrictions are removed."
          },
          {
                "question": "Can I unlock a PDF for free?",
                "answer": "Yes. You can unlock PDF documents online without purchasing additional software."
          },
          {
                "question": "What does unlocking a PDF do?",
                "answer": "Unlocking removes certain restrictions that limit actions such as editing, copying, or printing."
          },
          {
                "question": "Can I unlock a password protected PDF?",
                "answer": "If you have the correct authorization or password, you can remove protection from your own PDF document."
          },
          {
                "question": "Is an unlocked PDF editable?",
                "answer": "If editing restrictions were removed, the document may become easier to modify with a PDF editor."
          },
          {
                "question": "Can I unlock PDF documents on my phone?",
                "answer": "Yes. Online PDF unlock tools work on smartphones and tablets."
          },
          {
                "question": "Does unlocking PDF reduce quality?",
                "answer": "No. Unlocking changes document permissions but does not reduce the quality of text or images."
          },
          {
                "question": "What is the difference between locked and unlocked PDF?",
                "answer": "A locked PDF has security restrictions, while an unlocked PDF allows authorized users to access more document features."
          }
    ],
    related: ["pdf-password-remover","sign-pdf","edit-pdf"],
    accept: "application/pdf,.pdf",
    multiple: false,
    keywords: ["unlock pdf document online","unlock password protected pdf","remove pdf restrictions online","pdf unlocker online free","unlock secured pdf file","open locked pdf online"],
  },
];

export const toolsById: Record<ToolId, ToolDefinition> = Object.fromEntries(
  tools.map((t) => [t.id, t]),
) as Record<ToolId, ToolDefinition>;

export const toolsBySlug: Record<string, ToolDefinition> = Object.fromEntries(
  tools.map((t) => [t.slug, t]),
);

export function getTool(idOrSlug: string): ToolDefinition | undefined {
  return toolsById[idOrSlug as ToolId] ?? toolsBySlug[idOrSlug];
}

export function getRelatedTools(tool: ToolDefinition): ToolDefinition[] {
  return tool.related.map((id) => toolsById[id]).filter(Boolean);
}
