import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

/**
 * Llamadas a la acción del hero. Una sola versión para todo visitante:
 * evidencia (proyectos y código), conversación directa y CV a un clic.
 */
export function HeroCtas() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/proyectos" className={buttonVariants({ variant: "signal", size: "lg" })}>
        <span>Ver proyectos y código</span>
        <ArrowRight aria-hidden="true" size={16} className="transition-transform duration-500 ease-expo group-hover/btn:translate-x-1" />
      </Link>
      <Link href="/contacto" className={buttonVariants({ variant: "outline", size: "lg" })}>
        Hablemos
      </Link>
      <Link href="/cv" className="link-draw tap ml-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-muted hover:text-ink">
        <FileText aria-hidden="true" size={14} />
        CV en PDF
      </Link>
    </div>
  );
}
