import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "signal";
  size?: "sm" | "md" | "lg" | "icon";
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
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-mono font-medium transition-all select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal-light disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

    const variants = {
      primary:
        "bg-ink text-paper hover:bg-signal hover:text-white shadow-sm",
      signal:
        "bg-signal text-white hover:bg-signal-hover shadow-sm shadow-signal/20",
      secondary:
        "bg-surface-elevated text-ink hover:bg-surface-highlight border border-line",
      outline:
        "border border-line text-ink hover:border-signal hover:text-signal bg-transparent",
      ghost:
        "text-ink-muted hover:text-ink hover:bg-surface-elevated/50 bg-transparent",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5 rounded-sm",
      md: "h-10 px-4 text-xs tracking-tight gap-2 rounded-sm",
      lg: "h-12 px-6 text-sm tracking-tight gap-2.5 rounded-sm",
      icon: "h-9 w-9 p-0 rounded-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {!isLoading && leftIcon}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
