import { CartTable } from "@/components/store/cart-table";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getPricingModeForRole } from "@/lib/user-roles";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toCount(value: string | string[] | undefined) {
  const parsed = Number(toValue(value));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default async function CartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  const pricingMode = getPricingModeForRole(user?.role);
  const query = await searchParams;
  const reordered = toValue(query.reordered) === "1";
  const addedCount = toCount(query.added);
  const skippedCount = toCount(query.skipped);

  return (
    <div className="page-shell py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
          Cart
        </p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900 sm:text-5xl">
          {pricingMode === "wholesale"
            ? "Review your wholesale cart"
            : "Review your cart"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {pricingMode === "wholesale"
            ? "Adjust quantities, confirm product lines, and continue to your wholesale order submission."
            : "Adjust quantities, confirm product lines, and continue to checkout."}
        </p>
      </div>

      {reordered ? (
        <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          {addedCount > 0
            ? `${addedCount} item line${addedCount === 1 ? "" : "s"} were added from your previous order.`
            : "We checked your previous order against the current catalog."}{" "}
          {skippedCount > 0
            ? `${skippedCount} item line${skippedCount === 1 ? " was" : "s were"} skipped because it is no longer available in the same form.`
            : "All available items were added to your cart."}
        </div>
      ) : null}

      <div className="mt-8">
        <CartTable />
      </div>
    </div>
  );
}
