import { prepareDocxLayout } from "@/lib/engines/docxLayoutFixes";

const MAX_BYTES = 50 * 1024 * 1024;
const ENGINE_TIMEOUT_MS = 3 * 60 * 1000;
const CONVERT_TIMEOUT_MS = 2 * 60 * 1000;
const ENGINE_STAMP = "zetaoffice_latest-2025-05-13";
const ENGINE_DB = "word-pdf-engine";

type Progress = (percent: number, label?: string) => void;

type FsApi = {
  mkdir: (path: string) => void;
  writeFile: (path: string, data: Uint8Array) => void;
  readFile: (path: string) => Uint8Array;
  unlink: (path: string) => void;
};

type EnginePort = {
  postMessage: (data: unknown) => void;
  onmessage: ((event: MessageEvent) => void) | null;
};

type ZetaEngine = {
  FS: FsApi;
  thrPort: EnginePort;
  Module: {
    locateFile: (path: string, prefix?: string) => string;
    wasmBinary?: ArrayBuffer;
    getPreloadedPackage?: (name: string, size: number) => ArrayBuffer;
  };
  start: (onReady: () => void) => void;
};

type ConvertResult = {
  cmd?: string;
  id?: number;
  from?: string;
  to?: string;
  message?: string;
};

type PendingJob = {
  id: number;
  resolve: (bytes: Uint8Array) => void;
  reject: (error: Error) => void;
  timer: number;
};

let bootPromise: Promise<ZetaEngine> | null = null;
let chain: Promise<unknown> = Promise.resolve();
let jobId = 0;
let pending: PendingJob | null = null;
const progressListeners = new Set<Progress>();

function emit(percent: number, label?: string) {
  for (const listener of progressListeners) listener(percent, label);
}

function fail(message: string): Error {
  return new Error(message);
}

export function wordEngineReady(): boolean {
  return typeof window !== "undefined" && window.crossOriginIsolated === true;
}

function isolationMessage(): string {
  return "The document engine could not start because this page was not opened with the required browser security headers. Reload the Word to PDF page. If it still fails, redeploy the site so Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy are sent on this page.";
}

function downloadFailedMessage(): string {
  return "This computer could not unpack the document engine. Reload the page. If it still fails, clear Chrome’s cached files and try again in Chrome or Edge.";
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((total, part) => total + part.byteLength, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
}

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  if (!(bytes[0] === 0x1f && bytes[1] === 0x8b)) return bytes;
  if (typeof DecompressionStream !== "function") {
    throw fail("This browser cannot unpack the document engine. Use the latest Chrome, Edge, or Firefox.");
  }
  const source = new Blob([asArrayBuffer(bytes)])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(source).arrayBuffer());
}

async function loadEngineFile(
  url: string,
  label: string,
  onProgress?: Progress,
): Promise<Uint8Array> {
  const response = await fetch(url);
  if (!response.ok) {
    throw fail(
      "The document engine is not available on this site yet. Deploy the site again, then reload this page.",
    );
  }
  const reader = response.body?.getReader();
  if (!reader) throw fail("This browser could not download the document engine.");
  const total = Number(response.headers.get("content-length") || 0);
  const parts: Uint8Array[] = [];
  let received = 0;
  for (;;) {
    const chunk = await reader.read();
    if (chunk.done) break;
    parts.push(chunk.value);
    received += chunk.value.byteLength;
    if (total > 0) {
      onProgress?.(8 + Math.round((received / total) * 24), label);
    }
  }
  return gunzip(concatBytes(parts));
}

function asArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function openEngineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ENGINE_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("files")) {
        request.result.createObjectStore("files");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCachedEngine(): Promise<{ wasm: Uint8Array; data: Uint8Array } | null> {
  try {
    const db = await openEngineDb();
    const record = await new Promise<
      { stamp?: string; wasm?: ArrayBuffer; data?: ArrayBuffer } | undefined
    >((resolve, reject) => {
      const request = db.transaction("files").objectStore("files").get("engine");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (!record || record.stamp !== ENGINE_STAMP || !record.wasm || !record.data) return null;
    const wasm = new Uint8Array(record.wasm);
    if (wasm[0] !== 0x00 || wasm[1] !== 0x61 || wasm[2] !== 0x73 || wasm[3] !== 0x6d) return null;
    return { wasm, data: new Uint8Array(record.data) };
  } catch {
    return null;
  }
}

async function storeCachedEngine(wasm: Uint8Array, data: Uint8Array): Promise<void> {
  try {
    const db = await openEngineDb();
    await new Promise<void>((resolve, reject) => {
      const request = db
        .transaction("files", "readwrite")
        .objectStore("files")
        .put(
          { stamp: ENGINE_STAMP, wasm: asArrayBuffer(wasm), data: asArrayBuffer(data) },
          "engine",
        );
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    db.close();
  } catch {
    /* A full disk should not block conversion. */
  }
}

function watchEngineDownload(
  reject: (error: Error) => void,
  timer: number,
): () => void {
  const failDownload = (text: string) => {
    if (!/wasm|aborted|decoding/i.test(text)) return;
    window.clearTimeout(timer);
    cleanup();
    reject(fail(downloadFailedMessage()));
  };
  const onError = (event: ErrorEvent) => failDownload(String(event.message || ""));
  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason as { message?: string } | undefined;
    const text = String(reason?.message || event.reason || "");
    if (!/wasm|aborted|decoding/i.test(text)) return;
    event.preventDefault();
    failDownload(text);
  };
  const cleanup = () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return cleanup;
}

function ensureCanvas(): void {
  let canvas = document.getElementById("qtcanvas");
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.id = "qtcanvas";
  canvas.setAttribute("width", "64");
  canvas.setAttribute("height", "64");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;left:0;top:0;width:64px;height:64px;opacity:0;pointer-events:none;z-index:-1;";
  document.body.appendChild(canvas);
}

function loadHelper(): Promise<{
  ZetaHelperMain: new (
    threadJs: string,
    options: { threadJsType: string; wasmPkg: string; blockPageScroll: boolean },
  ) => ZetaEngine;
}> {
  const importer = new Function(
    "url",
    "return import(url)",
  ) as (url: string) => Promise<{
    ZetaHelperMain: new (
      threadJs: string,
      options: { threadJsType: string; wasmPkg: string; blockPageScroll: boolean },
    ) => ZetaEngine;
  }>;
  return importer("/zeta/zetaHelper.js");
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(fail(message)), ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error instanceof Error ? error : fail(String(error)));
      },
    );
  });
}

function attachDispatcher(engine: ZetaEngine): void {
  engine.thrPort.onmessage = (event: MessageEvent<ConvertResult>) => {
    const data = event.data || {};
    if (!pending || data.id !== pending.id) return;
    const job = pending;
    pending = null;
    window.clearTimeout(job.timer);
    if (data.cmd === "converted" && data.to) {
      try {
        const raw = engine.FS.readFile(data.to);
        const bytes = new Uint8Array(raw.byteLength);
        bytes.set(raw);
        try {
          if (data.from) engine.FS.unlink(data.from);
        } catch {
          /* temporary input is already gone */
        }
        try {
          engine.FS.unlink(data.to);
        } catch {
          /* temporary output is already gone */
        }
        if (bytes.byteLength < 5 || bytes[0] !== 0x25 || bytes[1] !== 0x50) {
          job.reject(fail("The document engine did not produce a PDF. Try the file again."));
          return;
        }
        job.resolve(bytes);
      } catch (error) {
        job.reject(
          error instanceof Error
            ? error
            : fail("The converted PDF could not be read back."),
        );
      }
      return;
    }
    if (data.cmd === "error") {
      job.reject(fail(data.message || "This Word file could not be converted."));
      return;
    }
    job.reject(fail("The document engine returned an unexpected result."));
  };
}

async function bootEngine(): Promise<ZetaEngine> {
  if (!wordEngineReady()) throw fail(isolationMessage());
  ensureCanvas();
  emit(4, "Checking this browser for a saved document engine…");
  const cached = await readCachedEngine();
  let wasm: Uint8Array;
  let data: Uint8Array;
  if (cached) {
    emit(30, "Opening the saved document engine…");
    wasm = cached.wasm;
    data = cached.data;
  } else {
    emit(8, "Downloading the document engine. The first time this is about 85 MB.");
    wasm = await loadEngineFile("/engine/soffice.wasm.gz", "Downloading the document engine…", emit);
    if (wasm[0] !== 0x00 || wasm[1] !== 0x61 || wasm[2] !== 0x73 || wasm[3] !== 0x6d) {
      throw fail(downloadFailedMessage());
    }
    data = await loadEngineFile(
      "/engine/soffice.data.gz",
      "Downloading document fonts and images…",
      emit,
    );
    emit(36, "Saving the engine in this browser so the next conversion is faster…");
    void storeCachedEngine(wasm, data);
  }
  const { ZetaHelperMain } = await loadHelper();
  const engine = new ZetaHelperMain("/office_thread.js", {
    threadJsType: "module",
    wasmPkg: "url:/engine/",
    blockPageScroll: false,
  });
  engine.Module.wasmBinary = asArrayBuffer(wasm);
  engine.Module.getPreloadedPackage = () => asArrayBuffer(data);

  emit(45, "Starting the document engine. This is the slow step, then conversion itself is quick.");
  await new Promise((resolve) => window.setTimeout(resolve, 40));

  const ready = new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(
        fail(
          "The document engine took too long to download. Check your connection and try again.",
        ),
      );
    }, ENGINE_TIMEOUT_MS);
    const stopWatching = watchEngineDownload(reject, timer);

    engine.start(() => {
      engine.thrPort.onmessage = (event: MessageEvent<ConvertResult>) => {
        if (event.data?.cmd !== "start") return;
        window.clearTimeout(timer);
        stopWatching();
        attachDispatcher(engine);
        resolve();
      };
    });

    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="/engine/soffice.js"]',
    );
    if (script) {
      script.onerror = () => {
        window.clearTimeout(timer);
        reject(
          fail(
            "The document engine could not be downloaded. Check your connection and try again.",
          ),
        );
      };
    }
  });

  await ready;
  emit(100, "Document engine ready.");
  return engine;
}

export function prepareWordEngine(onProgress?: Progress): Promise<void> {
  if (onProgress) progressListeners.add(onProgress);
  if (!bootPromise) {
    bootPromise = bootEngine().catch((error) => {
      bootPromise = null;
      throw error;
    });
  }
  return bootPromise.then(
    () => {
      if (onProgress) progressListeners.delete(onProgress);
    },
    (error) => {
      if (onProgress) progressListeners.delete(onProgress);
      throw error;
    },
  );
}

async function assertDocx(file: File): Promise<void> {
  const name = file.name.toLowerCase();
  if (!name.endsWith(".docx")) {
    throw fail("Choose a .docx file. Older .doc files need to be saved as DOCX first.");
  }
  if (file.size <= 0) throw fail("This file is empty.");
  if (file.size > MAX_BYTES) throw fail("This file is larger than 50 MB.");
  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  const zip =
    header.length === 4 &&
    header[0] === 0x50 &&
    header[1] === 0x4b &&
    (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
  if (!zip) throw fail("This file is not a valid DOCX document.");
}

function rememberTmp(fs: FsApi): void {
  try {
    fs.mkdir("/tmp");
  } catch {
    /* /tmp already exists */
  }
}

async function convertOne(file: File, onProgress?: Progress): Promise<Uint8Array> {
  await assertDocx(file);
  if (!wordEngineReady()) throw fail(isolationMessage());
  if (!bootPromise) await prepareWordEngine(onProgress);
  const enginePromise = bootPromise;
  if (!enginePromise) throw fail("The document engine did not start. Try again.");
  const engine = await enginePromise;
  onProgress?.(55, "Converting text, fonts, headers, images, and watermarks…");
  const id = ++jobId;
  const from = `/tmp/input-${id}.docx`;
  const to = `/tmp/output-${id}.pdf`;
  const bytes = await prepareDocxLayout(new Uint8Array(await file.arrayBuffer()));
  rememberTmp(engine.FS);
  engine.FS.writeFile(from, bytes);

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      if (pending?.id === id) pending = null;
      try {
        engine.FS.unlink(from);
      } catch {
        /* input may already be removed */
      }
      reject(fail("Conversion took too long. Try a smaller document."));
    }, CONVERT_TIMEOUT_MS);
    pending = { id, resolve, reject, timer };
    engine.thrPort.postMessage({ cmd: "convert", id, from, to });
  });
}

export function wordToPdfWithEngine(file: File, onProgress?: Progress): Promise<Uint8Array> {
  const run = chain.then(() => convertOne(file, onProgress));
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return withTimeout(
    run,
    ENGINE_TIMEOUT_MS + CONVERT_TIMEOUT_MS,
    "Conversion took too long. Check your connection and try again.",
  );
}
