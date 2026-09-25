import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bracket" | "ghost";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variants = {
    default:
      "border border-line bg-surface/80 text-ink shadow-sm transition-all hover:border-line-focus",
    elevated:
      "border border-line bg-surface-elevated text-ink shadow-md transition-all hover:border-signal/50",
    bracket:
      "bracket-frame border border-line bg-surface/90 text-ink transition-all hover:border-line-focus",
    ghost:
      "border border-transparent bg-transparent text-ink hover:bg-surface/50",
  };

  return (
    <div
      className={cn("rounded-sm overflow-hidden", variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 sm:p-6 pb-2", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold tracking-tight text-ink",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-1 font-body text-xs sm:text-sm text-ink-muted leading-relaxed",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-5 sm:p-6 pt-2", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center border-t border-line/60 p-5 sm:p-6 pt-4 text-xs font-mono",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
