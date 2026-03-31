import * as React from "react";

import { cn } from "@/lib/utils";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="admin-scrollbar w-full overflow-x-auto">
      <table
        ref={ref}
        className={cn("min-w-full border-collapse text-left text-[0.8rem]", className)}
        {...props}
      />
    </div>
  );
});

Table.displayName = "Table";

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        "bg-[var(--surface-muted)] text-[0.67rem] uppercase tracking-[0.16em] text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-b-0", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-[var(--border)] transition hover:bg-[var(--surface-muted)]/80",
        className,
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn("px-3 py-2.5 font-medium first:pl-4 last:pr-4", className)}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-3 py-3 align-middle first:pl-4 last:pr-4", className)}
      {...props}
    />
  );
}

export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={cn("px-4 py-3 text-left text-[0.78rem] text-[var(--muted-foreground)]", className)}
      {...props}
    />
  );
}
