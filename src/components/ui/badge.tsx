import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "tech" | "live" | "open-source" | "produccion" | "en-desarrollo" | "signal";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "tech",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em] px-2 py-0.5 transition-colors select-none";

  const variants = {
    tech: "border border-line text-ink-muted",
    live: "border border-emerald/40 text-emerald",
    produccion: "bg-signal text-signal-ink",
    "open-source": "border border-line-focus text-ink",
    "en-desarrollo": "border border-amber/40 text-amber",
    signal: "border border-signal/60 text-signal",
  };

  const hasPulse = variant === "live" || variant === "en-desarrollo";
  const pulseColor = variant === "live" ? "bg-emerald" : "bg-amber";

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {(dot || hasPulse) && (
        <span className="relative flex h-1.5 w-1.5 flex-none">
          {hasPulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                pulseColor
              )}
            />
          )}
          <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", pulseColor)} />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
