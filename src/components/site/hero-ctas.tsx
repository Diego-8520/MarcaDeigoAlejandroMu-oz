"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { useAudience } from "@/components/layout/audience-context";
import { buttonVariants } from "@/components/ui/button";

/** Llamadas a la acción del hero, priorizadas según la audiencia elegida. */
export function HeroCtas() {
  const { mode } = useAudience();

  const primary =
    mode === "recruiter"
      ? { href: "/cv", label: "Ver CV y credenciales" }
      : mode === "client"
        ? { href: "/contacto?motivo=servicio", label: "Cotizar un proyecto" }
        : { href: "/proyectos", label: "Ver proyectos y código" };

  const secondary =
    mode === "recruiter"
      ? { href: "/proyectos", label: "Código real" }
      : mode === "client"
        ? { href: "/servicios", label: "Servicios" }
        : { href: "/contacto", label: "Hablemos" };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={primary.href} className={buttonVariants({ variant: "signal", size: "lg" })}>
        <span>{primary.label}</span>
        <ArrowRight aria-hidden="true" size={16} className="transition-transform duration-500 ease-expo group-hover/btn:translate-x-1" />
      </Link>
      <Link href={secondary.href} className={buttonVariants({ variant: "outline", size: "lg" })}>
        {secondary.label}
      </Link>
      {mode !== "recruiter" && (
        <Link href="/cv" className="link-draw ml-2 inline-flex items-center gap-2 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted hover:text-ink">
          <FileText aria-hidden="true" size={14} />
          CV en PDF
        </Link>
      )}
    </div>
  );
}
