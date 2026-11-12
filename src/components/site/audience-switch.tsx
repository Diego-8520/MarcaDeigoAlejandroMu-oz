"use client";

import { useAudience, type AudienceMode } from "@/components/layout/audience-context";
import { cn } from "@/lib/utils";

const OPTIONS: { mode: Exclude<AudienceMode, "all">; label: string; hint: string }[] = [
  { mode: "recruiter", label: "Empresa", hint: "Resalta código, experiencia y CV" },
  { mode: "client", label: "Cliente", hint: "Resalta servicios, entregables y cotización" },
];

/**
 * Interruptor tipográfico de audiencia. Pulsar la opción activa vuelve al modo general.
 * Cambiar la audiencia cambia el acento del sitio entero.
 */
export function AudienceSwitch({ className, size = "sm" }: { className?: string; size?: "sm" | "lg" }) {
  const { mode, setMode } = useAudience();

  return (
    <div role="group" aria-label="¿Qué buscas en esta visita?" className={cn("flex items-center font-mono uppercase", className)}>
      <span aria-hidden="true" className="text-ink-subtle">
        [
      </span>
      {OPTIONS.map((opt, i) => {
        const active = mode === opt.mode;
        return (
          <span key={opt.mode} className="flex items-center">
            {i > 0 && (
              <span aria-hidden="true" className="px-1 text-ink-subtle">
                /
              </span>
            )}
            <button
              type="button"
              aria-pressed={active}
              title={opt.hint}
              onClick={() => setMode(active ? "all" : opt.mode)}
              className={cn(
                "tap-area px-1.5 py-1 tracking-[0.08em] transition-colors duration-300",
                size === "lg" ? "text-sm" : "text-[11px]",
                active ? "bg-signal text-signal-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {opt.label}
            </button>
          </span>
        );
      })}
      <span aria-hidden="true" className="text-ink-subtle">
        ]
      </span>
    </div>
  );
}
