import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "signal";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const BASE =
  "group/btn relative inline-flex items-center justify-center overflow-hidden font-mono font-medium uppercase tracking-[0.06em] select-none transition-[color,background-color,border-color,transform] duration-300 ease-expo focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-signal disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:bg-signal hover:text-signal-ink",
  signal: "bg-signal text-signal-ink hover:bg-ink hover:text-paper",
  secondary:
    "border border-line bg-surface-elevated text-ink hover:border-ink hover:bg-surface-highlight",
  outline: "border border-line-focus bg-transparent text-ink hover:border-signal hover:text-signal",
  ghost: "bg-transparent text-ink-muted hover:bg-surface-elevated hover:text-ink",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-[11px]",
  md: "h-10 gap-2 px-4 text-[11px]",
  lg: "h-14 gap-3 px-7 text-xs",
  icon: "h-9 w-9 p-0",
};

/** Clases del botón para aplicarlas a un `<Link>` o `<a>` sin anidar elementos interactivos. */
export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
      {!isLoading && leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  ),
);
Button.displayName = "Button";
