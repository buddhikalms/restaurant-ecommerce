import Link from "next/link";

import { getButtonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <Card className="rounded-xl border-[var(--border)] shadow-none">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
        <p className="max-w-xl text-[0.84rem] leading-6 text-[var(--muted-foreground)]">
          {description}
        </p>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className={getButtonClassName({
              className: "mt-1",
            })}
          >
            {actionLabel}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
