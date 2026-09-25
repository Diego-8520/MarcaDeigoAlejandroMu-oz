import { cn } from "@/lib/utils";

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
    <section
      id={id}
      className={cn("mx-auto max-w-4xl px-5 py-16 sm:py-20 lg:px-12", className)}
    >
      {children}
    </section>
  );
}

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
        "inline-flex items-center rounded-sm border border-line bg-surface/70 px-2 py-0.5 font-mono text-[11px] text-ink-muted select-none transition-colors hover:border-line-focus hover:text-ink",
        className
      )}
    >
      {children}
    </span>
  );
}
