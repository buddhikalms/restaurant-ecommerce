import { CartTable } from "@/components/store/cart-table";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getPricingModeForRole } from "@/lib/user-roles";

export default async function CartPage() {
  const user = await getCurrentUser();
  const pricingMode = getPricingModeForRole(user?.role);

  return (
    <div className="page-shell py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Cart</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900 sm:text-5xl">
          {pricingMode === "wholesale" ? "Review your wholesale cart" : "Review your cart"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {pricingMode === "wholesale"
            ? "Adjust quantities, confirm product lines, and continue to your wholesale order submission."
            : "Adjust quantities, confirm product lines, and continue to checkout."}
        </p>
      </div>
      <div className="mt-8">
        <CartTable />
      </div>
    </div>
  );
}

