import { CheckoutForm } from "@/components/forms/checkout-form";
import { requireCustomerUser } from "@/lib/auth-helpers";
import { getCheckoutCustomerDefaults } from "@/lib/data/account";
import { getAccountBasePathForRole, getPricingModeForRole } from "@/lib/user-roles";

export default async function CheckoutPage() {
  const sessionUser = await requireCustomerUser();
  const pricingMode = getPricingModeForRole(sessionUser.role);
  const customerDefaults = await getCheckoutCustomerDefaults(sessionUser.id);

  return (
    <div className="page-shell py-6 sm:py-8">
      <section className="surface-card rounded-xl p-5">
        <p className="section-label">Checkout</p>
        <h1 className="section-title mt-2">
          {pricingMode === "wholesale" ? "Submit your wholesale order" : "Submit your order"}
        </h1>
        <p className="section-copy mt-2">
          Review delivery details and place your order.
        </p>
      </section>
      <div className="mt-4">
        <CheckoutForm
          customerDefaults={customerDefaults}
          pricingMode={pricingMode}
          accountBasePath={getAccountBasePathForRole(sessionUser.role)}
        />
      </div>
    </div>
  );
}
