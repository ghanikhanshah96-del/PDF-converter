import JSZip from "jszip";

type SheetImage = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

const EMU_PER_PIXEL = 9525;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function anchor(image: SheetImage, index: number) {
  const maxWidth = 640;
  const fit = Math.min(1, maxWidth / Math.max(image.width, 1));
  const width = Math.max(1, Math.round(image.width * fit));
  const height = Math.max(1, Math.round(image.height * fit));
  const row = index * 28;
  const id = index + 2;

  return `<xdr:oneCellAnchor>
    <xdr:from>
      <xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff>
      <xdr:row>${row}</xdr:row><xdr:rowOff>0</xdr:rowOff>
    </xdr:from>
    <xdr:ext cx="${width * EMU_PER_PIXEL}" cy="${height * EMU_PER_PIXEL}"/>
    <xdr:pic>
      <xdr:nvPicPr>
        <xdr:cNvPr id="${id}" name="${escapeXml(`Page ${index + 1}`)}"/>
        <xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr>
      </xdr:nvPicPr>
      <xdr:blipFill>
        <a:blip r:embed="rId${index + 1}"/>
        <a:stretch><a:fillRect/></a:stretch>
      </xdr:blipFill>
      <xdr:spPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="${width * EMU_PER_PIXEL}" cy="${height * EMU_PER_PIXEL}"/>
        </a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      </xdr:spPr>
    </xdr:pic>
    <xdr:clientData/>
  </xdr:oneCellAnchor>`;
}

/** Add page pictures to a second worksheet so the spreadsheet shows the original pages. */
export async function addPageImages(
  workbook: ArrayBuffer | Uint8Array,
  images: SheetImage[],
): Promise<ArrayBuffer> {
  const source =
    workbook instanceof ArrayBuffer
      ? workbook
      : (workbook.buffer.slice(
          workbook.byteOffset,
          workbook.byteOffset + workbook.byteLength,
        ) as ArrayBuffer);
  if (!images.length) return source;

  const zip = await JSZip.loadAsync(source);
  const contentTypes = await zip.file("[Content_Types].xml")?.async("string");
  const workbookXml = await zip.file("xl/workbook.xml")?.async("string");
  const workbookRels = await zip.file("xl/_rels/workbook.xml.rels")?.async("string");
  if (!contentTypes || !workbookXml || !workbookRels) return source;

  let types = contentTypes;
  if (!/Extension="jpeg"/i.test(types)) {
    types = types.replace(
      "</Types>",
      '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>',
    );
  }
  if (!types.includes("/xl/worksheets/sheet2.xml")) {
    types = types.replace(
      "</Types>",
      '<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    );
  }
  if (!types.includes("/xl/drawings/drawing1.xml")) {
    types = types.replace(
      "</Types>",
      '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>',
    );
  }
  zip.file("[Content_Types].xml", types);

  if (!workbookXml.includes('name="Page images"')) {
    const sheets = workbookXml.includes("</sheets>")
      ? workbookXml.replace(
          "</sheets>",
          '<sheet name="Page images" sheetId="2" r:id="rIdPageImages"/></sheets>',
        )
      : workbookXml;
    zip.file("xl/workbook.xml", sheets);
  }

  if (!workbookRels.includes("rIdPageImages")) {
    zip.file(
      "xl/_rels/workbook.xml.rels",
      workbookRels.replace(
        "</Relationships>",
        '<Relationship Id="rIdPageImages" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/></Relationships>',
      ),
    );
  }

  zip.file(
    "xl/worksheets/sheet2.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData/>
  <drawing r:id="rId1"/>
</worksheet>`,
  );

  const relationships = images
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/page-${index + 1}.jpeg"/>`,
    )
    .join("");
  zip.file(
    "xl/worksheets/_rels/sheet2.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>`,
  );
  zip.file(
    "xl/drawings/_rels/drawing1.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationships}</Relationships>`,
  );
  zip.file(
    "xl/drawings/drawing1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
${images.map(anchor).join("\n")}
</xdr:wsDr>`,
  );

  images.forEach((image, index) => {
    zip.file(`xl/media/page-${index + 1}.jpeg`, image.bytes);
  });

  return zip.generateAsync({ type: "arraybuffer" });
}
