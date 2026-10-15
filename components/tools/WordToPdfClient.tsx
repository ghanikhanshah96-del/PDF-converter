"use client";

import { useEffect, useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { toPdfBlob } from "@/lib/blob";
import { basename } from "@/lib/download";
import {
  prepareWordEngine,
  wordEngineReady,
  wordToPdfWithEngine,
} from "@/lib/engines/zetaWordToPdf";
import { toolsById } from "@/lib/tools";

const tool = toolsById["word-to-pdf"];
const RELOAD_KEY = "word-pdf-engine-reload";

export function WordToPdfClient() {
  const [blocked, setBlocked] = useState<string | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<string | null>(null);

  useEffect(() => {
    if (window.crossOriginIsolated) {
      sessionStorage.removeItem(RELOAD_KEY);
      setEngineStatus("Preparing the document engine…");
      void prepareWordEngine((percent, label) => {
        setEngineStatus(label || `Preparing the document engine… ${percent}%`);
      })
        .then(() => setEngineStatus("Document engine ready. Conversion from here is much faster."))
        .catch((error: unknown) => {
          setEngineStatus(null);
          setEngineError(
            error instanceof Error
              ? error.message
              : "The document engine could not start on this computer.",
          );
        });
      return;
    }
    if (sessionStorage.getItem(RELOAD_KEY) !== "1") {
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.assign(
        window.location.pathname + window.location.search + window.location.hash,
      );
      return;
    }
    setBlocked(
      "Reload this page to start the document engine. If a reload does not fix it, the live site is missing the two security headers required for in-browser conversion.",
    );
  }, []);

  return (
    <>
      {blocked || engineError ? (
        <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800">
          {blocked || engineError}
        </p>
      ) : engineStatus ? (
        <p className="mb-4 rounded-xl bg-[var(--brand-soft)] px-3 py-2 text-sm leading-6 text-[var(--brand-deep)]">
          {engineStatus}
        </p>
      ) : null}
      <ToolWorkspace
        accept={tool.accept}
        multiple
        processMode="each"
        title="Drop Word (.docx) files"
        hint="Your file stays in this browser. The first visit downloads the engine once. Later conversions in this browser skip that download."
        processLabel="Convert to PDF"
        onProcess={async (files, onProgress) => {
          if (!wordEngineReady()) {
            throw new Error(
              blocked ||
                "Reload this page so the document engine can start, then convert the file again.",
            );
          }
          onProgress(5, "Starting the document engine…");
          const bytes = await wordToPdfWithEngine(files[0], onProgress);
          return {
            blob: toPdfBlob(bytes),
            filename: `${basename(files[0].name)}.pdf`,
          };
        }}
      />
    </>
  );
}
