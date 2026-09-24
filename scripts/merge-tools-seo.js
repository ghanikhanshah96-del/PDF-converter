const fs = require("fs");
const path = require("path");

const overlays = JSON.parse(
  fs.readFileSync(path.join(__dirname, "_seo-overlays.json"), "utf8"),
);
const toolsPath = path.join(__dirname, "..", "lib", "tools.ts");
let src = fs.readFileSync(toolsPath, "utf8");

function replaceStringField(block, field, value) {
  const patterns = [
    new RegExp(`${field}:\\s*"([^"\\\\]|\\\\.)*"`),
    new RegExp(`${field}:\\s*\`[\\s\\S]*?\``),
  ];
  for (const re of patterns) {
    if (re.test(block)) {
      return block.replace(re, `${field}: ${JSON.stringify(value)}`);
    }
  }
  console.warn("could not replace string field", field);
  return block;
}

function replaceArrayField(block, field, nextField, valueJson) {
  const re = new RegExp(
    `${field}:\\s*\\[[\\s\\S]*?\\],\\n(\\s*)${nextField}:`,
  );
  if (!re.test(block)) {
    console.warn("could not replace array field", field);
    return block;
  }
  return block.replace(re, `${field}: ${valueJson},\n$1${nextField}:`);
}

for (const [id, data] of Object.entries(overlays)) {
  const idToken = `id: "${id}"`;
  const start = src.indexOf(idToken);
  if (start < 0) {
    console.warn("missing", id);
    continue;
  }
  const objStart = src.lastIndexOf("{", start);
  let depth = 0;
  let objEnd = -1;
  for (let i = objStart; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) {
        objEnd = i;
        break;
      }
    }
  }
  let block = src.slice(objStart, objEnd + 1);

  // Prefer readable summaries from description first sentence
  const summary =
    data.description.split(/(?<=\.)\s+/)[0].slice(0, 140) || data.summary;

  const keywords = data.keywords.slice();
  // ensure primary-ish keyword present
  if (data.title && !keywords.length) {
    keywords.push(id.replace(/-/g, " "));
  }

  block = replaceStringField(block, "summary", summary);
  block = replaceStringField(block, "description", data.description);
  block = replaceStringField(block, "h1", data.h1);
  block = replaceStringField(block, "title", data.title);
  block = replaceStringField(block, "metaDescription", data.metaDescription);

  const howToJson = JSON.stringify(data.howTo, null, 6).replace(/\n/g, "\n    ");
  const faqsJson = JSON.stringify(data.faqs, null, 6).replace(/\n/g, "\n    ");
  const keywordsJson = JSON.stringify(keywords);

  block = replaceArrayField(block, "howTo", "faqs", howToJson);
  block = replaceArrayField(block, "faqs", "related", faqsJson);
  block = block.replace(/keywords:\s*\[[\s\S]*?\]/, `keywords: ${keywordsJson}`);

  src = src.slice(0, objStart) + block + src.slice(objEnd + 1);
  console.log(
    "updated",
    id,
    "faqs",
    data.faqs.length,
    "howTo",
    data.howTo.length,
  );
}

fs.writeFileSync(toolsPath, src);
console.log("done");
