"use client";

import { Download } from "lucide-react";
import { sendGTMEvent } from "@next/third-parties/google";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Enlace de descarga del CV. Envía `cv_download` al dataLayer para que GTM lo
 * reenvíe a GA4 (el disparador se configura en el contenedor).
 * `hero` es la versión tipográfica gigante de la página /cv.
 */
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
  variant?: "primary" | "secondary" | "hero";
  className?: string;
}) {
  const handleClick = () => {
    sendGTMEvent({ event: "cv_download", cv_id: cvId, cv_label: label });
  };

  if (variant === "hero") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        download
        onClick={handleClick}
        className={cn("group flex items-end justify-between gap-6 border-b-2 border-ink pb-4 hover:border-signal", className)}
      >
        <span className="display text-[clamp(2.2rem,7vw,7rem)] text-ink transition-colors group-hover:text-signal">{label}</span>
        <Download
          aria-hidden="true"
          strokeWidth={1.25}
          className="h-10 w-10 flex-none text-ink transition-transform duration-500 ease-expo group-hover:translate-y-1 group-hover:text-signal sm:h-16 sm:w-16"
        />
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
      className={buttonVariants({ variant: variant === "secondary" ? "outline" : "primary", size: variant === "secondary" ? "sm" : "lg", className })}
    >
      <Download aria-hidden="true" className="h-3.5 w-3.5" />
      <span>{label}</span>
    </a>
  );
}
