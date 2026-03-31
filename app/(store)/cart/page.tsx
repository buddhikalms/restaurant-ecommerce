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
    <div className="page-shell py-6 sm:py-8">
      <section className="surface-card rounded-xl p-5">
        <p className="section-label">Cart</p>
        <h1 className="section-title mt-2">
          {pricingMode === "wholesale" ? "Review your wholesale basket" : "Review your basket"}
        </h1>
        <p className="section-copy mt-2">
          Adjust quantities and continue to checkout.
        </p>
      </section>

      {reordered ? (
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[0.84rem] leading-6 text-[var(--muted-foreground)]">
          {addedCount > 0
            ? `${addedCount} item line${addedCount === 1 ? "" : "s"} were added from your previous order.`
            : "We checked your previous order against the current catalog."}{" "}
          {skippedCount > 0
            ? `${skippedCount} item line${skippedCount === 1 ? " was" : "s were"} skipped because it is no longer available in the same form.`
            : "All available items were added to your cart."}
        </div>
      ) : null}

      <div className="mt-4">
        <CartTable />
      </div>
    </div>
  );
}
