import JSZip from "jszip";

const EXCEL_COLORS = [
  "#5B9BD5",
  "#ED7D31",
  "#A5A5A5",
  "#FFC000",
  "#4472C4",
  "#70AD47",
  "#264478",
  "#9E480E",
  "#636363",
  "#997300",
];

type ChartKind = "pie" | "doughnut" | "col" | "bar" | "line";

type ChartSeries = { name: string; values: number[]; color: string };

type ParsedChart = {
  kind: ChartKind;
  stacked: boolean;
  title: string;
  categories: string[];
  series: ChartSeries[];
  showLegend: boolean;
  palette: string[];
};

function attr(source: string, name: string) {
  return new RegExp(`${name}="([^"]*)"`).exec(source)?.[1] ?? "";
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function parseRels(xml: string) {
  const map = new Map<string, string>();
  for (const match of xml.matchAll(/<Relationship\b([^>]*)\/?>/g)) {
    const id = attr(match[1], "Id");
    const target = attr(match[1], "Target");
    if (id && target) map.set(id, target);
  }
  return map;
}

function resolvePart(baseDir: string, target: string) {
  if (target.startsWith("/")) return target.replace(/^\/+/, "");
  const parts = baseDir.split("/").filter(Boolean);
  for (const segment of target.split("/")) {
    if (segment === "..") parts.pop();
    else if (segment && segment !== ".") parts.push(segment);
  }
  return parts.join("/");
}

function valuesIn(block: string) {
  return [...block.matchAll(/<c:v>([\s\S]*?)<\/c:v>/g)].map((match) =>
    decodeXml(match[1].trim()),
  );
}

function parseTheme(xml: string) {
  const theme: Record<string, string> = {
    dk1: "#000000",
    lt1: "#FFFFFF",
    dk2: "#44546A",
    lt2: "#E7E6E6",
    accent1: "#5B9BD5",
    accent2: "#ED7D31",
    accent3: "#A5A5A5",
    accent4: "#FFC000",
    accent5: "#4472C4",
    accent6: "#70AD47",
  };
  for (const name of Object.keys(theme)) {
    const block = new RegExp(`<a:${name}>([\\s\\S]*?)</a:${name}>`).exec(xml)?.[1] ?? "";
    const color =
      /srgbClr[^>]*val="([0-9A-Fa-f]{6})"/.exec(block)?.[1] ||
      /lastClr="([0-9A-Fa-f]{6})"/.exec(block)?.[1];
    if (color) theme[name] = `#${color}`;
  }
  return theme;
}

function applyLum(hex: string, lumMod: number, lumOff: number) {
  const n = parseInt(hex.slice(1), 16);
  const channels = [n >> 16, (n >> 8) & 255, n & 255].map((channel) => {
    const next = Math.round(channel * lumMod + 255 * lumOff);
    return Math.max(0, Math.min(255, next));
  });
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function colorFrom(block: string, theme: Record<string, string>, fallback: string) {
  const srgb = /<a:srgbClr\b[^>]*val="([0-9A-Fa-f]{6})"/.exec(block)?.[1];
  if (srgb) return `#${srgb}`;
  const scheme = /<a:(?:schemeClr|sysClr)\b[^>]*val="([^"]+)"/.exec(block)?.[1];
  if (scheme && theme[scheme]) {
    const lumMod = Number(/<a:lumMod\b[^>]*val="(\d+)"/.exec(block)?.[1] ?? 100000) / 100000;
    const lumOff = Number(/<a:lumOff\b[^>]*val="(\d+)"/.exec(block)?.[1] ?? 0) / 100000;
    return applyLum(theme[scheme], lumMod, lumOff);
  }
  return fallback;
}

function textValues(block: string) {
  const cached = valuesIn(block);
  if (cached.length) return cached;
  return [...block.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)].map((match) =>
    decodeXml(match[1].trim()),
  );
}

function paletteFromColors(xml: string, theme: Record<string, string>) {
  const style = xml.match(/<cs:colorStyle\b[^>]*>([\s\S]*?)<\/cs:colorStyle>/)?.[1] ?? "";
  const head = style.split(/<cs:variation\b/)[0] ?? "";
  const colors: string[] = [];
  for (const match of head.matchAll(/<a:schemeClr\b[^>]*val="([^"]+)"/g)) {
    if (theme[match[1]]) colors.push(theme[match[1]]);
  }
  for (const match of head.matchAll(/<a:srgbClr\b[^>]*val="([0-9A-Fa-f]{6})"/g)) {
    colors.push(`#${match[1]}`);
  }
  return colors.length ? colors : EXCEL_COLORS;
}

function plotBlock(xml: string) {
  const tags = [
    "barChart",
    "bar3DChart",
    "lineChart",
    "line3DChart",
    "areaChart",
    "pieChart",
    "pie3DChart",
    "doughnutChart",
    "ofPieChart",
  ];
  for (const tag of tags) {
    const match = new RegExp(`<c:${tag}\\b[\\s\\S]*?</c:${tag}>`).exec(xml);
    if (match) return { tag, xml: match[0] };
  }
  return null;
}

function parseChart(
  xml: string,
  theme: Record<string, string>,
  palette: string[],
): ParsedChart | null {
  const plot = plotBlock(xml);
  if (!plot) return null;

  const kind: ChartKind =
    plot.tag === "pieChart" || plot.tag === "pie3DChart" || plot.tag === "ofPieChart"
      ? "pie"
      : plot.tag === "doughnutChart"
        ? "doughnut"
        : plot.tag === "lineChart" || plot.tag === "line3DChart" || plot.tag === "areaChart"
          ? "line"
          : /<c:barDir\b[^>]*val="bar"/.test(plot.xml)
            ? "bar"
            : "col";

  const seriesXml = [...plot.xml.matchAll(/<c:ser>([\s\S]*?)<\/c:ser>/g)].map(
    (match) => match[1],
  );
  if (!seriesXml.length) return null;

  const categories = valuesIn(
    seriesXml[0].match(/<c:cat>([\s\S]*?)<\/c:cat>/)?.[1] ?? "",
  );
  const series: ChartSeries[] = seriesXml.map((block, index) => {
    const raw = valuesIn(block.match(/<c:val>([\s\S]*?)<\/c:val>/)?.[1] ?? "");
    const count = Math.max(categories.length, raw.length);
    const values = Array.from({ length: count }, (_, point) => {
      const value = Number(raw[point]);
      return Number.isFinite(value) ? value : 0;
    });
    const shape = block
      .replace(/<c:dPt>[\s\S]*?<\/c:dPt>/g, "")
      .replace(/<c:dLbls>[\s\S]*?<\/c:dLbls>/g, "")
      .replace(/<c:txPr>[\s\S]*?<\/c:txPr>/g, "");
    const fill = shape.match(/<a:solidFill>([\s\S]*?)<\/a:solidFill>/)?.[1] ?? "";
    return {
      name:
        textValues(block.match(/<c:tx>([\s\S]*?)<\/c:tx>/)?.[1] ?? "")[0] ||
        `Series ${index + 1}`,
      values,
      color: colorFrom(fill, theme, palette[index % palette.length] || EXCEL_COLORS[index % EXCEL_COLORS.length]),
    };
  });

  if (!series.some((item) => item.values.some((value) => value !== 0))) return null;

  if (!categories.length) {
    categories.push(
      ...series[0].values.map((_, index) => `Item ${index + 1}`),
    );
  }

  const titleBlock = xml.match(/<c:title>([\s\S]*?)<\/c:title>/)?.[1] ?? "";
  const title = /<c:autoTitleDeleted\b[^>]*val="1"/.test(xml)
    ? ""
    : textValues(titleBlock)[0] || "";
  const legend = xml.match(/<c:legend\b[^>]*>([\s\S]*?)<\/c:legend>/)?.[1] ?? "";
  const showLegend = !legend || !/<c:delete\b[^>]*val="1"/.test(legend);

  return {
    kind,
    stacked: /<c:grouping\b[^>]*val="stacked"|<c:grouping\b[^>]*val="percentStacked"/.test(plot.xml),
    title,
    categories,
    series,
    showLegend,
    palette,
  };
}

function emuToPx(emu: number) {
  if (!emu) return 0;
  return Math.max(1, Math.round((emu / 914400) * 96));
}

function formatTick(value: number) {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100);
}

function niceAxis(maxValue: number) {
  if (maxValue <= 0) return { max: 1, step: 1 };
  const raw = maxValue / 7;
  const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
  const residual = raw / magnitude;
  const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  const step = nice * magnitude;
  return { step, max: Math.ceil((maxValue * 1.001) / step) * step };
}

function drawChart(chart: ParsedChart, widthPx: number, heightPx: number) {
  const width = Math.max(480, widthPx || 640);
  const height = Math.max(300, heightPx || 360);
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#BFBFBF";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  ctx.font = "12px Calibri, Carlito, sans-serif";
  ctx.fillStyle = "#595959";
  ctx.textBaseline = "middle";

  if (chart.kind === "pie" || chart.kind === "doughnut") drawPie(ctx, chart, width, height);
  else drawCartesian(ctx, chart, width, height);

  return canvas.toDataURL("image/png");
}

function drawPie(ctx: CanvasRenderingContext2D, chart: ParsedChart, width: number, height: number) {
  const series = chart.series[0];
  const total = series.values.reduce((sum, value) => sum + value, 0) || 1;
  const title = chart.title.trim();
  const top = title ? 28 : 12;
  if (title) {
    ctx.font = "700 15px Calibri, Carlito, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#2F5496";
    ctx.fillText(title, width / 2, 16, width - 24);
    ctx.font = "12px Calibri, Carlito, sans-serif";
  }

  const legendWidth = chart.showLegend ? Math.min(230, width * 0.36) : 16;
  const cx = (width - legendWidth) / 2;
  const cy = top + (height - top) / 2;
  const radius = Math.max(64, Math.min(cx - 20, (height - top) / 2 - 12));
  let angle = -Math.PI / 2;

  series.values.forEach((value, index) => {
    const sweep = (value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = chart.palette[index % chart.palette.length];
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    angle += sweep;
  });

  if (chart.kind === "doughnut") {
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(cx, cy, radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  if (!chart.showLegend) return;
  chart.categories.forEach((label, index) => {
    const row = top + index * 20;
    const pct = Math.round((series.values[index] / total) * 1000) / 10;
    ctx.fillStyle = chart.palette[index % chart.palette.length];
    ctx.fillRect(width - legendWidth + 8, row, 10, 10);
    ctx.fillStyle = "#595959";
    ctx.textAlign = "left";
    ctx.fillText(`${label}  ${pct}%`, width - legendWidth + 22, row + 5, legendWidth - 28);
  });
}

function drawBottomLegend(
  ctx: CanvasRenderingContext2D,
  chart: ParsedChart,
  x: number,
  y: number,
  width: number,
) {
  ctx.font = "11px Calibri, Carlito, sans-serif";
  const items = chart.series.map((series) => ({
    color: series.color,
    label: series.name,
    width: ctx.measureText(series.name).width + 18,
  }));
  const total = items.reduce((sum, item) => sum + item.width, 0) + (items.length - 1) * 14;
  let cursor = x + Math.max(0, (width - total) / 2);
  items.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(cursor, y, 10, 10);
    ctx.fillStyle = "#595959";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(item.label, cursor + 14, y + 5);
    cursor += item.width + 14;
  });
}

function drawCartesian(
  ctx: CanvasRenderingContext2D,
  chart: ParsedChart,
  width: number,
  height: number,
) {
  const horizontal = chart.kind === "bar";
  const counts = chart.series.map((series) => series.values.length);
  const count = Math.max(chart.categories.length, ...counts, 1);
  const maxValue = chart.stacked
    ? Math.max(
        ...Array.from({ length: count }, (_, index) =>
          chart.series.reduce((sum, series) => sum + Math.max(0, series.values[index] || 0), 0),
        ),
        1,
      )
    : Math.max(...chart.series.flatMap((series) => series.values), 1);
  const axis = niceAxis(maxValue);
  const ticks: number[] = [];
  for (let value = 0; value <= axis.max + axis.step / 2; value += axis.step) ticks.push(value);

  ctx.font = "11px Calibri, Carlito, sans-serif";
  const tickWidth = Math.max(...ticks.map((tick) => ctx.measureText(formatTick(tick)).width));
  const title = chart.title.trim();
  const titleH = title ? 26 : 12;
  const legendH = chart.showLegend ? 26 : 8;
  const categoryH = horizontal ? 8 : 22;
  const plotX = horizontal ? 16 + Math.min(120, width * 0.22) : 14 + tickWidth;
  const plotY = titleH;
  const plotW = width - plotX - 16;
  const plotH = height - plotY - categoryH - legendH - 8;

  if (title) {
    ctx.font = "700 14px Calibri, Carlito, sans-serif";
    ctx.fillStyle = "#595959";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, width / 2, 14, width - 20);
  }

  ctx.font = "11px Calibri, Carlito, sans-serif";
  ctx.strokeStyle = "#D0D0D0";
  ctx.lineWidth = 1;
  ticks.forEach((tick) => {
    if (horizontal) {
      const x = plotX + (tick / axis.max) * plotW;
      ctx.beginPath();
      ctx.moveTo(x, plotY);
      ctx.lineTo(x, plotY + plotH);
      ctx.stroke();
      ctx.fillStyle = "#595959";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(formatTick(tick), x, plotY + plotH + 4);
    } else {
      const y = plotY + plotH - (tick / axis.max) * plotH;
      ctx.beginPath();
      ctx.moveTo(plotX, y);
      ctx.lineTo(plotX + plotW, y);
      ctx.stroke();
      ctx.fillStyle = "#595959";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(formatTick(tick), plotX - 6, y);
    }
  });

  ctx.strokeStyle = "#BFBFBF";
  ctx.strokeRect(plotX + 0.5, plotY + 0.5, plotW, plotH);

  const slot = (horizontal ? plotH : plotW) / count;
  const seriesCount = Math.max(1, chart.series.length);
  const cluster = slot * 0.72;
  const barSize = chart.stacked ? cluster : cluster / seriesCount;

  for (let index = 0; index < count; index += 1) {
    const label = chart.categories[index] || "";
    if (horizontal) {
      const y = plotY + index * slot + (slot - cluster) / 2;
      ctx.fillStyle = "#595959";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(label, plotX - 6, y + cluster / 2, plotX - 10);
    } else {
      ctx.fillStyle = "#595959";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(label, plotX + index * slot + slot / 2, plotY + plotH + 4, slot - 2);
    }

    if (chart.kind === "line") continue;
    let stacked = 0;
    chart.series.forEach((series, seriesIndex) => {
      const value = Math.max(0, series.values[index] || 0);
      const span = (value / axis.max) * (horizontal ? plotW : plotH);
      ctx.fillStyle = series.color;
      if (horizontal) {
        const y = plotY + index * slot + (slot - cluster) / 2 + (chart.stacked ? 0 : seriesIndex * barSize);
        const x = plotX + (chart.stacked ? (stacked / axis.max) * plotW : 0);
        ctx.fillRect(x, y + 1, span, Math.max(1, barSize - 2));
      } else {
        const x = plotX + index * slot + (slot - cluster) / 2 + (chart.stacked ? 0 : seriesIndex * barSize);
        const y = plotY + plotH - (chart.stacked ? (stacked / axis.max) * plotH : 0) - span;
        ctx.fillRect(x + 1, y, Math.max(1, barSize - 2), span);
      }
      if (chart.stacked) stacked += value;
    });
  }

  if (chart.kind === "line") {
    chart.series.forEach((series) => {
      ctx.beginPath();
      ctx.strokeStyle = series.color;
      ctx.lineWidth = 2;
      series.values.forEach((value, index) => {
        const x = plotX + index * slot + slot / 2;
        const y = plotY + plotH - (Math.max(0, value) / axis.max) * plotH;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      series.values.forEach((value, index) => {
        const x = plotX + index * slot + slot / 2;
        const y = plotY + plotH - (Math.max(0, value) / axis.max) * plotH;
        ctx.fillStyle = series.color;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    });
  }

  if (chart.showLegend) drawBottomLegend(ctx, chart, plotX, height - legendH + 4, plotW);
}

function imageAlreadyShown(host: HTMLElement, dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  const needle = dataUrl.slice(comma + 1, comma + 96);
  return [...host.querySelectorAll("img")].some((img) => {
    const src = img.getAttribute("src") || "";
    return src.includes(needle);
  });
}

function insertFigure(
  host: HTMLElement,
  src: string,
  alt: string,
  widthPx: number,
  heightPx = 0,
) {
  const figure = document.createElement("figure");
  figure.style.margin = "12px auto";
  figure.style.textAlign = "center";
  const image = document.createElement("img");
  image.src = src;
  image.alt = alt || "Picture";
  image.style.display = "inline-block";
  image.style.maxWidth = "100%";
  if (widthPx) {
    image.style.width = `${widthPx}px`;
    image.style.maxWidth = "none";
  }
  if (heightPx) image.style.height = `${heightPx}px`;
  else image.style.height = "auto";
  figure.appendChild(image);

  const article =
    (host.querySelector("section.docx article") as HTMLElement | null) ||
    (host.querySelector("section.docx") as HTMLElement | null);
  if (!article) {
    host.appendChild(figure);
    return;
  }
  if (heightPx > 500) {
    const paragraphs = article.querySelectorAll("p");
    const anchor = paragraphs[1] || null;
    if (anchor) article.insertBefore(figure, anchor);
    else article.insertBefore(figure, article.firstChild);
    return;
  }
  const table = article.querySelector("table");
  if (table) article.insertBefore(figure, table);
  else article.appendChild(figure);
}

async function partToDataUrl(zip: JSZip, path: string) {
  const file = zip.file(path);
  if (!file) return "";
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const mime =
    ext === "png"
      ? "image/png"
      : ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "gif"
          ? "image/gif"
          : ext === "webp"
            ? "image/webp"
            : ext === "bmp"
              ? "image/bmp"
              : "";
  if (!mime) return "";
  const base64 = await file.async("base64");
  return `data:${mime};base64,${base64}`;
}

async function imagesFromPart(zip: JSZip, partPath: string) {
  const xml = await zip.file(partPath)?.async("string");
  if (!xml) return [];
  const relPath = partPath.replace(/^(.*)\/([^/]+)$/, "$1/_rels/$2.rels");
  const rels = parseRels((await zip.file(relPath)?.async("string")) ?? "");
  const baseDir = partPath.includes("/") ? partPath.slice(0, partPath.lastIndexOf("/")) : "";
  const ids = [
    ...xml.matchAll(/<(?:v:imagedata|a:blip)\b[^>]*(?:r:id|r:embed)="([^"]+)"/g),
  ].map((match) => match[1]);
  const urls: string[] = [];
  for (const id of ids) {
    const target = rels.get(id);
    if (!target) continue;
    const url = await partToDataUrl(zip, resolvePart(baseDir, target));
    if (url) urls.push(url);
  }
  return urls;
}

async function imageByRel(
  zip: JSZip,
  rels: Map<string, string>,
  id: string,
  baseDir: string,
) {
  const target = rels.get(id);
  if (!target) return "";
  return partToDataUrl(zip, resolvePart(baseDir, target));
}

/** Header or body pictures that sit behind the text (Word watermarks). */
async function findWatermark(
  zip: JSZip,
  documentXml: string,
  rels: Map<string, string>,
) {
  const parts = [
    "word/document.xml",
    ...Object.keys(zip.files).filter((name) => /^word\/header\d+\.xml$/.test(name)),
  ];

  for (const part of parts) {
    const xml =
      part === "word/document.xml"
        ? documentXml
        : ((await zip.file(part)?.async("string")) ?? "");
    const relPath = part.replace(/^(.*)\/([^/]+)$/, "$1/_rels/$2.rels");
    const partRels =
      part === "word/document.xml"
        ? rels
        : parseRels((await zip.file(relPath)?.async("string")) ?? "");

    for (const shape of xml.matchAll(/<v:shape\b([^>]*)>([\s\S]*?)<\/v:shape>/g)) {
      if (!/watermark/i.test(shape[1] + shape[2])) continue;
      const id = /r:id="([^"]+)"/.exec(shape[2])?.[1];
      if (!id) continue;
      const url = await imageByRel(zip, partRels, id, "word");
      if (url) return url;
    }

    for (const anchor of xml.matchAll(/<wp:anchor\b([^>]*)>([\s\S]*?)<\/wp:anchor>/g)) {
      if (!/behindDoc="1"|behindDoc="true"/.test(anchor[1])) continue;
      const id = /r:embed="([^"]+)"/.exec(anchor[2])?.[1];
      if (!id) continue;
      const url = await imageByRel(zip, partRels, id, "word");
      if (url) return url;
    }
  }

  return "";
}

function liftPageContent(section: HTMLElement) {
  section.style.position = "relative";
  section.style.overflow = "visible";
  const article = section.querySelector("article");
  if (article instanceof HTMLElement) {
    article.style.position = "relative";
    article.style.zIndex = "1";
    article.style.background = "transparent";
  }
}

function paintBackground(host: HTMLElement, url: string) {
  host.querySelectorAll("section.docx").forEach((node) => {
    const section = node as HTMLElement;
    liftPageContent(section);
    const image = document.createElement("img");
    image.src = url;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.style.position = "absolute";
    image.style.inset = "0";
    image.style.width = "100%";
    image.style.height = "100%";
    image.style.objectFit = "cover";
    image.style.pointerEvents = "none";
    image.style.zIndex = "0";
    section.insertBefore(image, section.firstChild);
  });
}

function paintWatermark(host: HTMLElement, url: string) {
  host.querySelectorAll("section.docx").forEach((node) => {
    const section = node as HTMLElement;
    liftPageContent(section);
    const image = document.createElement("img");
    image.src = url;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.style.position = "absolute";
    image.style.left = "50%";
    image.style.top = "50%";
    image.style.transform = "translate(-50%, -50%)";
    image.style.width = "70%";
    image.style.height = "auto";
    image.style.opacity = "0.4";
    image.style.pointerEvents = "none";
    image.style.zIndex = "0";
    section.insertBefore(image, section.firstChild);
  });
}

function paintTextWatermark(host: HTMLElement, text: string) {
  host.querySelectorAll("section.docx").forEach((node) => {
    const section = node as HTMLElement;
    liftPageContent(section);
    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");
    layer.textContent = text;
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.display = "flex";
    layer.style.alignItems = "center";
    layer.style.justifyContent = "center";
    layer.style.font = "700 72px Calibri, Carlito, sans-serif";
    layer.style.letterSpacing = "0.08em";
    layer.style.color = "rgba(160, 160, 160, 0.45)";
    layer.style.transform = "rotate(-40deg)";
    layer.style.pointerEvents = "none";
    layer.style.zIndex = "0";
    layer.style.whiteSpace = "nowrap";
    section.insertBefore(layer, section.firstChild);
  });
}

async function ensureEmbeddedPictures(
  zip: JSZip,
  documentXml: string,
  rels: Map<string, string>,
  host: HTMLElement,
) {
  for (const match of documentXml.matchAll(/<w:drawing>([\s\S]*?)<\/w:drawing>/g)) {
    const block = match[1];
    if (/<c:chart\b/.test(block)) continue;
    const id = /r:embed="([^"]+)"/.exec(block)?.[1];
    if (!id) continue;
    const url = await imageByRel(zip, rels, id, "word");
    if (!url || imageAlreadyShown(host, url)) continue;
    const width = emuToPx(Number(/<wp:extent\b[^>]*cx="(\d+)"/.exec(block)?.[1] ?? 0));
    const height = emuToPx(Number(/<wp:extent\b[^>]*cy="(\d+)"/.exec(block)?.[1] ?? 0));
    insertFigure(host, url, "Picture", width, height);
  }
}

/**
 * docx-preview skips Office charts, page backgrounds, and header watermarks.
 * Draw those from the Word package so they appear in the PDF.
 */
export async function enrichRenderedDocx(buffer: ArrayBuffer, host: HTMLElement) {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")?.async("string");
  const relsXml = await zip.file("word/_rels/document.xml.rels")?.async("string");
  if (!documentXml || !relsXml) return;

  const rels = parseRels(relsXml);
  const theme = parseTheme((await zip.file("word/theme/theme1.xml")?.async("string")) ?? "");
  const picturesBeforeCharts = host.querySelectorAll("img").length;

  for (const match of documentXml.matchAll(/<w:drawing>([\s\S]*?)<\/w:drawing>/g)) {
    const block = match[1];
    const chartId = /<c:chart\b[^>]*r:id="([^"]+)"/.exec(block)?.[1];
    if (!chartId) continue;
    const target = rels.get(chartId);
    if (!target) continue;
    const chartPath = resolvePart("word", target);
    const chartXml = await zip.file(chartPath)?.async("string");
    if (!chartXml) continue;
    const chartDir = chartPath.includes("/") ? chartPath.slice(0, chartPath.lastIndexOf("/")) : "";
    const chartRels = parseRels(
      (await zip.file(`${chartDir}/_rels/${chartPath.split("/").pop()}.rels`)?.async("string")) ?? "",
    );
    let palette = EXCEL_COLORS;
    for (const relTarget of chartRels.values()) {
      if (!/color/i.test(relTarget)) continue;
      const colorsXml = await zip.file(resolvePart(chartDir, relTarget))?.async("string");
      if (colorsXml) palette = paletteFromColors(colorsXml, theme);
    }
    const chart = parseChart(chartXml, theme, palette);
    if (!chart) continue;
    const width = emuToPx(Number(/cx="(\d+)"/.exec(block)?.[1] ?? 0));
    const height = emuToPx(Number(/cy="(\d+)"/.exec(block)?.[1] ?? 0));
    const src = drawChart(chart, width, height);
    if (src) insertFigure(host, src, chart.title || "Chart", width);
  }

  const backgroundBlock =
    documentXml.match(/<w:background\b[\s\S]*?<\/w:background>/)?.[0] ??
    documentXml.match(/<w:background\b[^>]*\/?>/)?.[0] ??
    "";
  const backgroundId = /r:id="([^"]+)"/.exec(backgroundBlock)?.[1];
  if (backgroundId && rels.get(backgroundId)) {
    const url = await partToDataUrl(zip, resolvePart("word", rels.get(backgroundId)!));
    if (url) paintBackground(host, url);
  }

  const watermarkUrl = await findWatermark(zip, documentXml, rels);
  if (watermarkUrl) paintWatermark(host, watermarkUrl);

  const headerNames = Object.keys(zip.files).filter((name) =>
    /^word\/header\d+\.xml$/.test(name),
  );
  for (const name of ["word/document.xml", ...headerNames]) {
    const xml =
      name === "word/document.xml"
        ? documentXml
        : ((await zip.file(name)?.async("string")) ?? "");
    const text = /<v:textpath\b[^>]*string="([^"]+)"/i.exec(xml)?.[1];
    if (text && /watermark/i.test(xml)) {
      paintTextWatermark(host, decodeXml(text));
      break;
    }
  }

  await ensureEmbeddedPictures(zip, documentXml, rels, host);

  if (picturesBeforeCharts === 0 && host.querySelectorAll("img").length === 0) {
    const bodyImages = await imagesFromPart(zip, "word/document.xml");
    bodyImages.forEach((url, index) => {
      if (!imageAlreadyShown(host, url)) insertFigure(host, url, `Image ${index + 1}`, 0);
    });
  }
}
