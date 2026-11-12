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
      "border border-line bg-surface text-ink transition-colors hover:border-line-focus",
    elevated:
      "border border-line bg-surface-elevated text-ink transition-colors hover:border-ink/40",
    bracket:
      "border-t-2 border-x border-b border-t-signal border-x-line border-b-line bg-surface text-ink transition-colors",
    ghost:
      "border border-transparent bg-transparent text-ink hover:bg-surface",
  };

  return (
    <div
      className={cn("overflow-hidden", variants[variant], className)}
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
        "font-display text-lg font-bold tracking-tight text-ink",
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
