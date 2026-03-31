import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]",
  secondary:
    "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
  ghost:
    "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
  accent:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]",
  destructive:
    "bg-[var(--danger)] text-white hover:brightness-95",
} as const;

const buttonSizes = {
  default: "h-9 px-3.5 text-[0.84rem]",
  sm: "h-8 px-3 text-[0.78rem]",
  lg: "h-10 px-4 text-sm",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition duration-150 disabled:cursor-not-allowed disabled:opacity-60",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
