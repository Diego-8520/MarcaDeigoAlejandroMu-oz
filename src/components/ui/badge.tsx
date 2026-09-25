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
    "inline-flex items-center gap-1.5 font-mono text-[11px] rounded-sm px-2 py-0.5 transition-colors select-none";

  const variants = {
    tech: "border border-line/80 bg-surface/60 text-ink-muted",
    live: "border border-emerald/40 bg-emerald-dim text-emerald font-medium",
    produccion: "border border-signal/40 bg-signal-dim text-signal-light font-medium",
    "open-source": "border border-line text-ink-muted bg-surface-elevated/40",
    "en-desarrollo": "border border-amber/40 bg-amber-dim text-amber font-medium",
    signal: "border border-signal/50 bg-signal-dim text-signal-light font-medium",
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
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
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
