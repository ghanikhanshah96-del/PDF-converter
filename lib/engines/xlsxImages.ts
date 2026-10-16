import JSZip from "jszip";

export type SheetPicture = {
  bytes: Uint8Array;
  width: number;
  height: number;
};

const EMU_PER_PIXEL = 9525;
const ROW_PX = 20;

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function anchor(image: SheetPicture, index: number, row: number) {
  const id = index + 2;
  return `<xdr:oneCellAnchor>
    <xdr:from>
      <xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff>
      <xdr:row>${row}</xdr:row><xdr:rowOff>0</xdr:rowOff>
    </xdr:from>
    <xdr:ext cx="${image.width * EMU_PER_PIXEL}" cy="${image.height * EMU_PER_PIXEL}"/>
    <xdr:pic>
      <xdr:nvPicPr>
        <xdr:cNvPr id="${id}" name="${escapeXml(`Picture ${index + 1}`)}"/>
        <xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr>
      </xdr:nvPicPr>
      <xdr:blipFill>
        <a:blip r:embed="rId${index + 1}"/>
        <a:stretch><a:fillRect/></a:stretch>
      </xdr:blipFill>
      <xdr:spPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="${image.width * EMU_PER_PIXEL}" cy="${image.height * EMU_PER_PIXEL}"/>
        </a:xfrm>
        <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
      </xdr:spPr>
    </xdr:pic>
    <xdr:clientData/>
  </xdr:oneCellAnchor>`;
}

export function rowsForPicture(image: SheetPicture) {
  return Math.ceil(image.height / ROW_PX) + 2;
}

export type SheetImageGroup = {
  sheetNumber: number;
  startRow: number;
  images: SheetPicture[];
};

/** Place pictures under each sheet's table, with enough rows that they do not stack on top of each other. */
export async function addSheetPictures(
  workbook: ArrayBuffer | Uint8Array,
  groups: SheetImageGroup[],
): Promise<ArrayBuffer> {
  const source =
    workbook instanceof ArrayBuffer
      ? workbook
      : (workbook.buffer.slice(
          workbook.byteOffset,
          workbook.byteOffset + workbook.byteLength,
        ) as ArrayBuffer);
  const pending = groups.filter((group) => group.images.length > 0);
  if (!pending.length) return source;

  const zip = await JSZip.loadAsync(source);
  let types = (await zip.file("[Content_Types].xml")?.async("string")) ?? "";
  if (!types) return source;
  if (!/Extension="jpeg"/i.test(types)) {
    types = types.replace(
      "</Types>",
      '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>',
    );
  }

  for (const group of pending) {
    const drawingName = `/xl/drawings/drawing${group.sheetNumber}.xml`;
    if (!types.includes(drawingName)) {
      types = types.replace(
        "</Types>",
        `<Override PartName="${drawingName}" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`,
      );
    }
    const sheetPath = `xl/worksheets/sheet${group.sheetNumber}.xml`;
    let sheet = await zip.file(sheetPath)?.async("string");
    if (!sheet) continue;
    if (!sheet.includes("xmlns:r=")) {
      sheet = sheet.replace(
        "<worksheet ",
        '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ',
      );
    }
    if (!sheet.includes("<drawing ")) {
      sheet = sheet.replace("</worksheet>", '<drawing r:id="rIdPictures"/></worksheet>');
    }
    zip.file(sheetPath, sheet);

    const relPath = `xl/worksheets/_rels/sheet${group.sheetNumber}.xml.rels`;
    const currentRels = await zip.file(relPath)?.async("string");
    const drawingRel =
      '<Relationship Id="rIdPictures" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing' +
      group.sheetNumber +
      '.xml"/>';
    zip.file(
      relPath,
      currentRels
        ? currentRels.includes("rIdPictures")
          ? currentRels
          : currentRels.replace("</Relationships>", `${drawingRel}</Relationships>`)
        : `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${drawingRel}</Relationships>`,
    );

    let row = group.startRow;
    const anchors: string[] = [];
    group.images.forEach((image, index) => {
      anchors.push(anchor(image, index, row));
      row += rowsForPicture(image);
    });
    const imageRels = group.images
      .map(
        (_, index) =>
          `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/sheet${group.sheetNumber}-picture-${index + 1}.jpeg"/>`,
      )
      .join("");
    zip.file(
      `xl/drawings/_rels/drawing${group.sheetNumber}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${imageRels}</Relationships>`,
    );
    zip.file(
      `xl/drawings/drawing${group.sheetNumber}.xml`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
${anchors.join("\n")}
</xdr:wsDr>`,
    );
    group.images.forEach((image, index) => {
      zip.file(`xl/media/sheet${group.sheetNumber}-picture-${index + 1}.jpeg`, image.bytes);
    });
  }

  zip.file("[Content_Types].xml", types);
  return zip.generateAsync({ type: "arraybuffer" });
}
