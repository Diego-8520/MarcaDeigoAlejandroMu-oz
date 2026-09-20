"use client";

import { trackEvent } from "@/lib/analytics/track";
import { Download } from "lucide-react";

export function CvDownloadLink({
  href,
  label = "descargar cv (pdf)",
  cvId,
  variant = "primary",
  className = "",
}: {
  href: string;
  label?: string;
  cvId?: string;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const handleClick = () => {
    trackEvent("cv_download", "/cv", {
      cvId,
      label,
    });
  };

  if (variant === "secondary") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        download
        onClick={handleClick}
        className={`inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-xs text-ink transition-colors hover:border-signal hover:text-signal ${className}`}
      >
        <Download className="h-3.5 w-3.5" />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      download
      onClick={handleClick}
      className={`inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-mono text-sm text-paper transition-colors hover:bg-signal ${className}`}
    >
      <Download className="h-4 w-4" />
      <span>{label}</span>
    </a>
  );
}
