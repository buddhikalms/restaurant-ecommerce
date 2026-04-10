"use client";

import { Button } from "@/components/ui/button";

export default function FoodMenuError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="rounded-[1.8rem] border border-[var(--border)] bg-white p-8 text-center shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--brand-dark)]">
        Menu error
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
        We could not load the kitchen storefront
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-[0.88rem] leading-7 text-[var(--muted-foreground)]">
        Something interrupted the ordering experience while preparing the menu, category tabs, or basket data.
      </p>
      <Button type="button" onClick={reset} className="mt-6 h-11 rounded-full px-5">
        Try again
      </Button>
    </div>
  );
}
