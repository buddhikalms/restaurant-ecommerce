import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function MobileCartBar({
  itemCount,
  total,
  onOpen,
}: {
  itemCount: number;
  total: number;
  onOpen: () => void;
}) {
  if (!itemCount) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 xl:hidden">
      <div className="flex items-center justify-between rounded-[1.25rem] bg-[var(--foreground)] px-4 py-3 text-white shadow-[0_24px_48px_rgba(15,23,42,0.28)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/12">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-semibold">{itemCount} items in basket</p>
            <p className="text-[0.76rem] text-white/75">{formatCurrency(total)} total</p>
          </div>
        </div>
        <Button
          type="button"
          onClick={onOpen}
          className="h-10 rounded-full bg-white px-4 text-[var(--foreground)] hover:bg-white/90"
        >
          View cart
        </Button>
      </div>
    </div>
  );
}
