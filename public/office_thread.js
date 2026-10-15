/* LibreOffice thread for in-browser DOCX to PDF. Loaded by the ZetaJS worker. */
import { ZetaHelperThread } from "/zeta/zetaHelper.js";

const zHT = new ZetaHelperThread();
const zetajs = zHT.zetajs;
const css = zHT.css;

let xModel;

function failureText(error) {
  try {
    const uno = zetajs.catchUnoException(error);
    if (uno && uno.Message) return String(uno.Message);
  } catch {
    /* use the original error below */
  }
  if (error && error.message) return String(error.message);
  return "The document engine could not convert this file.";
}

function closeModel() {
  try {
    if (
      xModel &&
      xModel.queryInterface(zetajs.type.interface(css.util.XCloseable))
    ) {
      xModel.close(false);
    }
  } catch (error) {
    console.warn("Could not close the converted document", error);
  }
  xModel = undefined;
}

function convertFile(message) {
  const from = message.from;
  const to = message.to;
  closeModel();
  xModel = zHT.desktop.loadComponentFromURL("file://" + from, "_blank", 0, [
    new css.beans.PropertyValue({ Name: "Hidden", Value: true }),
  ]);
  if (!xModel) {
    throw new Error("This DOCX could not be opened.");
  }
  xModel.storeToURL("file://" + to, [
    new css.beans.PropertyValue({ Name: "Overwrite", Value: true }),
    new css.beans.PropertyValue({ Name: "FilterName", Value: "writer_pdf_Export" }),
  ]);
  zetajs.mainPort.postMessage({
    cmd: "converted",
    id: message.id,
    from,
    to,
  });
  closeModel();
}

zHT.thrPort.onmessage = (event) => {
  const message = event.data || {};
  if (message.cmd !== "convert") return;
  try {
    convertFile(message);
  } catch (error) {
    closeModel();
    zetajs.mainPort.postMessage({
      cmd: "error",
      id: message.id,
      message: failureText(error),
    });
  }
};

zHT.thrPort.postMessage({ cmd: "start" });
