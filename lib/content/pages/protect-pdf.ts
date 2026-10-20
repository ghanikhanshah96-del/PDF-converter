import type { ToolPageContent } from "../types";

const content: ToolPageContent = {
  sections: [
    {
      type: "bullets",
      heading: "Password Protect PDF Files Online for Free",
      intro:
        "Add a password to your PDF before you share it. The lock is applied in your browser, and only people with the password can open the file.",
      items: [
        "Set an open password on your PDF",
        "Keep processing on your device",
        "Download a protected copy instantly",
        "Share files more safely by email or chat",
        "Remove the password later with our Password Remover",
      ],
    },
    {
      type: "steps",
      heading: "How to Protect a PDF Online",
      steps: [
        "Select the PDF file you want to protect.",
        "Enter a new password and confirm it.",
        "Start the protection process.",
        "Download your password-protected PDF.",
      ],
    },
    {
      type: "bullets",
      heading: "What Is a Protect PDF Tool?",
      intro:
        "A protect PDF tool encrypts a document with a password so it cannot be opened without that password.",
      items: [
        "Locks the file when someone tries to open it",
        "Leaves your original file unchanged on your device",
        "Works in the browser without installing software",
        "Uses a password you choose and control",
      ],
    },
    {
      type: "cards",
      heading: "Protect PDF vs Remove PDF Password",
      items: [
        {
          title: "Protect PDF",
          text: "Add a password so the file asks for it every time it is opened.",
        },
        {
          title: "PDF Password Remover",
          text: "Create an unlocked copy when you already know the password and no longer need the lock.",
        },
      ],
    },
    {
      type: "prose",
      heading: "Tips for safer sharing",
      paragraphs: [
        "Use a strong password you do not reuse elsewhere, and send the password through a different channel than the file when you can.",
        "Keep an unlocked backup of important documents. If you forget the password, we cannot recover it for you.",
        "Need to open a locked file you own? Use PDF Password Remover with the correct password.",
      ],
    },
  ],
};

export default content;
