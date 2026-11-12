import type { ReactNode } from "react";
import { Reveal, SplitReveal } from "@/components/motion/reveal";

export interface PageNote {
  label: string;
  value: ReactNode;
}

/**
 * Cabecera editorial de página: índice de sección, titular display a todo
 * el ancho y, debajo, notas al margen + entradilla + acciones.
 */
export function PageHeader({
  index,
  eyebrow,
  title,
  lede,
  notes,
  actions,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  notes?: PageNote[];
  actions?: ReactNode;
}) {
  return (
    <header className="container-x pb-16 pt-[calc(var(--header-h)+3.5rem)] sm:pb-24 sm:pt-[calc(var(--header-h)+6rem)]">
      <Reveal immediate className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em]">
        <span className="text-signal">{index}</span>
        <span aria-hidden="true" className="h-px w-10 bg-line-focus" />
        <span className="text-ink-muted">{eyebrow}</span>
      </Reveal>

      <SplitReveal as="h1" immediate className="display display-lg mt-8 text-ink sm:mt-10">
        {title}
      </SplitReveal>

      {(lede || notes || actions) && (
        <div className="mt-12 grid grid-cols-1 gap-10 border-t border-line pt-8 sm:mt-16 lg:grid-cols-12 lg:gap-6">
          {notes && notes.length > 0 && (
            <Reveal immediate delay={0.3} as="dl" stagger className="grid grid-cols-2 gap-x-6 gap-y-5 font-mono text-xs lg:col-span-4 lg:grid-cols-1">
              {notes.map((note) => (
                <div key={note.label}>
                  <dt className="eyebrow">{note.label}</dt>
                  <dd className="mt-1 text-ink">{note.value}</dd>
                </div>
              ))}
            </Reveal>
          )}
          <Reveal immediate delay={0.4} className={notes && notes.length > 0 ? "lg:col-span-8" : "lg:col-span-8 lg:col-start-5"}>
            {lede && <div className="lede">{lede}</div>}
            {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
          </Reveal>
        </div>
      )}
    </header>
  );
}

/** Encabezado de sección dentro de una página: índice + titular revelado. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  aside,
  id,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  aside?: ReactNode;
  id?: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.08em] lg:col-span-3 lg:items-start">
        <span className="text-signal">{index}</span>
        <span className="text-ink-muted">{eyebrow}</span>
      </div>
      <div className="lg:col-span-9">
        <SplitReveal id={id} className="display display-md text-ink">
          {title}
        </SplitReveal>
        {aside && <div className="mt-6">{aside}</div>}
      </div>
    </div>
  );
}
