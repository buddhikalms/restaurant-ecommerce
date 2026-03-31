import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-[0.66rem] font-medium uppercase tracking-[0.12em]",
        className,
      )}
    >
      {children}
    </span>
  );
}
