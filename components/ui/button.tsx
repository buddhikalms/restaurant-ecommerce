import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "bg-[var(--brand-dark)] text-[#fff8ec] shadow-[0_12px_26px_rgba(85,50,13,0.22)] hover:bg-[var(--brand-dark)]",
  secondary:
    "bg-[#fff7ea] text-[var(--brand-dark)] ring-1 ring-[#e7d1af] hover:bg-white",
  ghost: "bg-transparent text-[var(--brand-dark)] hover:bg-[#f6ead7]",
  destructive: "bg-rose-700 text-white hover:bg-rose-800",
} as const;

const buttonSizes = {
  default: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
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
