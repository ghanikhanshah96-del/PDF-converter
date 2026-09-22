"use client";

import { useState } from "react";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { basename } from "@/lib/download";
import { toPdfBlob } from "@/lib/blob";
import { toolsById } from "@/lib/tools";
import type { RotateAngle } from "@/lib/engines/rotate";

const tool = toolsById["rotate-pdf"];

export function RotatePdfClient() {
  const [angle, setAngle] = useState<RotateAngle>(90);

  return (
    <ToolWorkspace
      accept={tool.accept}
      title="Drop a PDF to rotate"
      processLabel="Rotate PDF"
      options={
        <fieldset className="flex flex-wrap gap-4 text-sm">
          <legend className="mb-1 w-full font-medium">Rotation</legend>
          {([90, 180, 270] as RotateAngle[]).map((a) => (
            <label key={a} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="rotate-angle"
                checked={angle === a}
                onChange={() => setAngle(a)}
              />
              {a}°
            </label>
          ))}
        </fieldset>
      }
      onProcess={async (files, onProgress) => {
        onProgress(20, "Loading pdf-lib…");
        const { rotatePdf } = await import("@/lib/engines/rotate");
        onProgress(55, "Rotating pages…");
        const bytes = await rotatePdf(files[0], angle);
        return {
          blob: toPdfBlob(bytes),
          filename: `${basename(files[0].name)}-rotated.pdf`,
        };
      }}
    />
  );
}
