import * as React from "react";

import { cn } from "@/lib/utils";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition duration-150 disabled:cursor-not-allowed disabled:opacity-60";

const buttonVariants = {
  default:
    "border-transparent bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]",
  secondary:
    "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
  ghost:
    "border-transparent bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
  accent:
    "border-transparent bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)]",
  destructive:
    "border-[rgba(179,86,72,0.16)] bg-[rgba(179,86,72,0.08)] text-[var(--danger)] hover:bg-[rgba(179,86,72,0.12)]",
} as const;

const buttonSizes = {
  default: "h-9 px-3.5 text-[0.82rem]",
  sm: "h-8 px-3 text-[0.76rem]",
  lg: "h-10 px-4 text-[0.86rem]",
  icon: "h-8 w-8 p-0",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function getButtonClassName({
  className,
  variant = "default",
  size = "default",
}: {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={getButtonClassName({ className, variant, size })}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
