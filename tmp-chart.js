const fs = require("fs");
const JSZip = require("jszip");

(async () => {
  const z = await JSZip.loadAsync(
    fs.readFileSync("C:/Users/stellix/Downloads/clustered-column-result.docx"),
  );
  console.log(Object.keys(z.files).filter((n) => n.startsWith("word/")).join("\n"));
  const xml = await z.file("word/charts/chart1.xml").async("string");
  const tag = (xml.match(/<c:(barChart|bar3DChart|lineChart|pieChart|pie3DChart)/) || [])[1];
  const dir = (xml.match(/<c:barDir[^>]*>/) || [])[0];
  const grouping = (xml.match(/<c:grouping[^>]*>/) || [])[0];
  const legend = (xml.match(/<c:legendPos[^>]*>/) || [])[0];
  const auto = (xml.match(/<c:autoTitleDeleted[^>]*>/) || [])[0];
  const title = (xml.match(/<c:title>([\s\S]*?)<\/c:title>/) || [])[1] || "";
  console.log({ tag, dir, grouping, legend, auto, titleText: /<c:v>|<a:t/.test(title) });
  const sers = [...xml.matchAll(/<c:ser>([\s\S]*?)<\/c:ser>/g)].map((m) => m[1]);
  console.log("series", sers.length);
  sers.forEach((s, i) => {
    const name = (s.match(/<c:tx>[\s\S]*?<c:v>([^<]*)<\/c:v>/) || [])[1];
    const cats = [
      ...(
        (s.match(/<c:cat>([\s\S]*?)<\/c:cat>/) || [])[1] || ""
      ).matchAll(/<c:v>([^<]*)<\/c:v>/g),
    ].map((m) => m[1]);
    const nums = [
      ...((s.match(/<c:val>([\s\S]*?)<\/c:val>/) || [])[1] || "").matchAll(
        /<c:v>([^<]*)<\/c:v>/g,
      ),
    ].map((m) => m[1]);
    const shape = s
      .replace(/<c:dPt>[\s\S]*?<\/c:dPt>/g, "")
      .replace(/<c:dLbls>[\s\S]*?<\/c:dLbls>/g, "")
      .replace(/<c:txPr>[\s\S]*?<\/c:txPr>/g, "");
    const fill = ((shape.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/) || [])[1] || "").replace(
      /\s+/g,
      " ",
    );
    console.log(i, name, cats.join("|"), nums.join(","), fill.slice(0, 160));
  });
  const colors = z.file("word/charts/colors1.xml");
  if (colors) console.log("COLORS", (await colors.async("string")).slice(0, 500));
  const theme = await z.file("word/theme/theme1.xml").async("string");
  for (const m of theme.matchAll(/<a:(accent\d)>([\s\S]*?)<\/a:\1>/g)) {
    console.log(m[1], ((m[2].match(/val="([0-9A-Fa-f]{6})"/) || [])[1]));
  }
})();
