import { cn } from "@/lib/utils";

/** Bloque de página con el contenedor editorial (1600px + gutter fluido). */
export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("container-x py-20 sm:py-28 lg:py-36", className)}>
      {children}
    </section>
  );
}

/** Etiqueta mono para tecnologías y metadatos. */
export function Tag({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-line px-2 py-0.5 font-mono text-[11px] text-ink-muted select-none transition-colors hover:border-line-focus hover:text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
