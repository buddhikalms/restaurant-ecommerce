import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-[0.82rem] text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--brand)] focus:ring-2 focus:ring-[rgba(184,107,87,0.12)]",
        className,
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";
