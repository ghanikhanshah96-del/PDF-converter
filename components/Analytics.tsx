"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getFirebaseClientApp } from "@/lib/firebase";

export function Analytics() {
  const pathname = usePathname() || "";
  // This route requires cross-origin isolation for its WASM document engine.
  const excluded = pathname.startsWith("/word-to-pdf-converter-free");

  useEffect(() => {
    if (excluded) return;
    let cancelled = false;
    void (async () => {
      const app = getFirebaseClientApp();
      const { getAnalytics, isSupported } = await import("firebase/analytics");
      if (await isSupported() && !cancelled) getAnalytics(app);
    })().catch((error: unknown) => {
      console.warn("Firebase Analytics could not initialize:", error);
    });
    return () => { cancelled = true; };
  }, [excluded]);

  return null;
}
