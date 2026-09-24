const fs = require("fs");
const path = require("path");

const md = fs.readFileSync(
  path.join(__dirname, "..", "best free pdf converter content.md"),
  "utf8",
);

const tools = [
  { id: "pdf-to-word", start: "# pdf to word converter free", end: "# word to pdf converter free" },
  { id: "word-to-pdf", start: "# word to pdf converter free", end: "# merge pdf online free" },
  { id: "merge-pdf", start: "# merge pdf online free", end: "# split pdf online free" },
  { id: "split-pdf", start: "# split pdf online free", end: "# compress pdf free" },
  { id: "compress-pdf", start: "# compress pdf free", end: "# pdf to jpg converter free" },
  { id: "pdf-to-jpg", start: "# pdf to jpg converter free", end: "# jpg to pdf converter free" },
  { id: "jpg-to-pdf", start: "# jpg to pdf converter free", end: "# edit pdf online free" },
  { id: "edit-pdf", start: "# edit pdf online free", end: "# pdf password remover" },
  { id: "pdf-password-remover", start: "# pdf password remover", end: "# sign pdf online free" },
  { id: "sign-pdf", start: "# sign pdf online free", end: "# excel to pdf converter" },
  { id: "excel-to-pdf", start: "# excel to pdf converter", end: "# pdf to excel converter" },
  { id: "pdf-to-excel", start: "# pdf to excel converter", end: "# rotate pdf online" },
  { id: "rotate-pdf", start: "# rotate pdf online", end: "# unlock pdf online" },
  { id: "unlock-pdf", start: "# unlock pdf online", end: null },
];

function slice(text, start, end) {
  const i = text.indexOf(start);
  if (i < 0) return "";
  const j = end ? text.indexOf(end, i + 1) : text.length;
  return text.slice(i, j < 0 ? text.length : j);
}

function clean(s) {
  return s
    .replace(/\*\*/g, "")
    .replace(/\\/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function privacySafe(text) {
  return text
    .replace(/upload your file to (our|a) server/gi, "select your file in the browser")
    .replace(/uploaded to (our|a) server/gi, "processed in your browser")
    .replace(/we (store|receive|keep) your (files|documents)/gi, "files stay on your device")
    .replace(/\bUpload your file to the\b/gi, "Select your file in the")
    .replace(/\bupload your file to the\b/gi, "select your file in the")
    .replace(/\bUpload your PDF file to the\b/gi, "Select your PDF file in the")
    .replace(/\bupload your PDF file to the\b/gi, "select your PDF file in the")
    .replace(/\bUpload your\b/g, "Select your")
    .replace(/\bupload your\b/g, "select your")
    .replace(/\bUpload the\b/g, "Select the")
    .replace(/\bupload the\b/g, "select the")
    .replace(/\bSelect your ([^.]+) to the converter\b/gi, "Select your $1 in the converter")
    .replace(/\bselect your ([^.]+) to the converter\b/gi, "select your $1 in the converter")
    .replace(/\bSelect your file, complete the action\b/gi, "select your file, complete the action");
}

const out = {};

for (const t of tools) {
  const block = slice(md, t.start, t.end);

  const titleMatch = block.match(/\*\*SEO Title:\*\*\s*\n\s*([^\n]+)/);
  const metaMatch = block.match(/\*\*Meta Description:\*\*\s*\n\s*([^\n]+)/);
  const h1Match = block.match(/^# \*\*([^*]+)\*\*/m);
  const primaryMatch = block.match(/Primary Keyword:\s*\n\s*`([^`]+)`/i);
  const secondary = [...block.matchAll(/\* `([^`]+)`/g)].map((m) => m[1]);

  // Intro: first paragraphs after H1 before next ##
  let description = "";
  const afterH1 = block.match(/^# \*\*[^*]+\*\*\s*\n+([\s\S]*?)(?=\n## )/m);
  if (afterH1) {
    description = privacySafe(
      clean(
        afterH1[1]
          .split(/\n\n+/)
          .map((p) => clean(p))
          .filter((p) => p && !p.startsWith("Whether you need") === false || true)
          .slice(0, 1)
          .join(" "),
      ),
    );
    // Prefer first substantial paragraph
    const paras = afterH1[1]
      .split(/\n\n+/)
      .map((p) => privacySafe(clean(p)))
      .filter((p) => p.length > 40);
    description = paras[0] || description;
  }

  // How-to numbered steps near top (first ordered list of 3-4 steps)
  let howTo = [];
  const stepBlock = block.match(/(?:## \*\*How to[^*]*\*\*[\s\S]*?)((?:\d+\.\s+[^\n]+\n?)+)/i);
  if (stepBlock) {
    howTo = stepBlock[1]
      .split(/\n/)
      .map((l) => privacySafe(clean(l.replace(/^\d+\.\s*/, ""))))
      .filter(Boolean)
      .slice(0, 4);
  }
  if (howTo.length < 3) {
    const alt = [...block.matchAll(/### \*\*(?:Step )?\d[\s\S]*?\*\*\s*\n+([^\n#]+)/g)]
      .map((m) => privacySafe(clean(m[1])))
      .filter(Boolean)
      .slice(0, 4);
    if (alt.length >= 3) howTo = alt;
  }

  const faqs = [];
  const faqIdx = block.search(/## \*\*[^*]*FAQ/i);
  if (faqIdx >= 0) {
    const faqBlock = block.slice(faqIdx);
    const parts = faqBlock.split(/\n### \*\*/).slice(1);
    for (const part of parts) {
      const nl = part.indexOf("\n");
      if (nl < 0) continue;
      const q = clean(part.slice(0, nl).replace(/\*\*/g, ""));
      let rest = part.slice(nl + 1);
      const nextSec = rest.search(/\n## /);
      if (nextSec >= 0) rest = rest.slice(0, nextSec);
      const a = privacySafe(clean(rest));
      if (q && a.length > 15 && !/convert your|combine your|separate your|reduce your/i.test(q)) {
        faqs.push({ question: q, answer: a });
      }
    }
  }

  // Long-form sections: ## headings until FAQ / final CTA
  const sections = [];
  const bodyStart = block.indexOf("\n## ");
  const bodyEnd = faqIdx >= 0 ? faqIdx : block.length;
  const body = bodyStart >= 0 ? block.slice(bodyStart, bodyEnd) : "";
  const sectionParts = body.split(/\n## \*\*/).slice(1);

  for (const part of sectionParts) {
    const headingEnd = part.indexOf("**");
    if (headingEnd < 0) continue;
    const heading = clean(part.slice(0, headingEnd));
    if (/FAQ|SEO Setup|Convert Your|Combine Your|Separate Your|Reduce Your|Sign Your|Edit Your|Unlock Your|Rotate Your|Create Your|Manage Your/i.test(heading)) {
      continue;
    }
    const content = part.slice(headingEnd + 2).trim();

    // cards: ### items
    const cardParts = content.split(/\n### \*\*/).slice(1);
    if (cardParts.length >= 2) {
      const introParas = content
        .split(/\n### \*\*/)[0]
        .split(/\n\n+/)
        .map((p) => privacySafe(clean(p)))
        .filter((p) => p.length > 20);
      const items = cardParts.map((c) => {
        const hEnd = c.indexOf("**");
        const title = clean(c.slice(0, hEnd));
        const text = privacySafe(clean(c.slice(hEnd + 2).split(/\n## |\n### /)[0]));
        return { title, text };
      }).filter((i) => i.title && i.text);
      if (items.length) {
        sections.push({
          type: "cards",
          heading,
          intro: introParas[0],
          items,
        });
        continue;
      }
    }

    // bullets
    const bullets = [...content.matchAll(/^\* (.+)$/gm)].map((m) => privacySafe(clean(m[1])));
    if (bullets.length >= 3) {
      const intro = privacySafe(
        clean(content.split(/\n\*/)[0].split(/\n\n+/).filter(Boolean)[0] || ""),
      );
      sections.push({
        type: "bullets",
        heading,
        intro: intro || undefined,
        items: bullets,
      });
      continue;
    }

    // steps
    const steps = [...content.matchAll(/^\d+\.\s+(.+)$/gm)].map((m) =>
      privacySafe(clean(m[1])),
    );
    if (steps.length >= 3) {
      sections.push({ type: "steps", heading, steps });
      continue;
    }

    const paragraphs = content
      .split(/\n\n+/)
      .map((p) => privacySafe(clean(p)))
      .filter((p) => p.length > 30 && !p.startsWith("###"));
    if (paragraphs.length) {
      sections.push({ type: "prose", heading, paragraphs: paragraphs.slice(0, 4) });
    }
  }

  // Final CTA from last ## before end of block after FAQs
  let cta = null;
  const afterFaq = faqIdx >= 0 ? block.slice(faqIdx) : "";
  const ctaMatch = afterFaq.match(
    /## \*\*((?:Convert|Combine|Separate|Reduce|Sign|Edit|Unlock|Rotate|Create|Manage)[^*]+)\*\*\s*\n+([\s\S]+?)(?=\n# |\n*$)/i,
  );
  if (ctaMatch) {
    cta = {
      type: "cta",
      heading: clean(ctaMatch[1]),
      text: privacySafe(clean(ctaMatch[2].split("\n\n")[0])),
      buttonLabel: "Try this tool now",
    };
  }

  out[t.id] = {
    title: titleMatch ? clean(titleMatch[1]) : null,
    metaDescription: metaMatch ? clean(metaMatch[1]) : null,
    h1: h1Match ? clean(h1Match[1]) : null,
    primary: primaryMatch ? clean(primaryMatch[1]) : null,
    secondary,
    description,
    howTo,
    faqs,
    sections: cta ? [...sections, cta] : sections,
  };
}

fs.writeFileSync(
  path.join(__dirname, "_seo-extract.json"),
  JSON.stringify(out, null, 2),
);

for (const [id, data] of Object.entries(out)) {
  console.log(
    `${id}: title=${!!data.title} faqs=${data.faqs.length} sections=${data.sections.length} howTo=${data.howTo.length}`,
  );
}
