import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel = "Back",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-2">
        {backHref ? (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1 text-[0.76rem] font-medium text-[var(--admin-muted-foreground)] transition hover:text-[var(--admin-foreground)]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        ) : null}
        {eyebrow ? <p className="admin-kicker">{eyebrow}</p> : null}
        <h1 className="admin-title">{title}</h1>
        {description ? <p className="admin-copy max-w-3xl">{description}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
