"use client";

import { trackEvent } from "@/lib/analytics/track";

export function CvDownloadLink() {
  return (
    <a
      href="#"
      onClick={() => trackEvent("cv_download")}
      className="mt-6 inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal"
    >
      descargar cv (pdf)
    </a>
  );
}
