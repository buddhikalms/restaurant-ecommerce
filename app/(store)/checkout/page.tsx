import { CheckoutForm } from "@/components/forms/checkout-form";
import { requireCustomerUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getAccountBasePathForRole, getPricingModeForRole } from "@/lib/user-roles";

export default async function CheckoutPage() {
  const sessionUser = await requireCustomerUser();
  const pricingMode = getPricingModeForRole(sessionUser.role);
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      phone: true,
      businessName: true
    }
  });

  return (
    <div className="page-shell py-12">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Checkout</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900 sm:text-5xl">
          {pricingMode === "wholesale" ? "Submit your wholesale order" : "Submit your order"}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {pricingMode === "wholesale"
            ? "Your account details are prefilled where possible. Inventory and wholesale minimum quantities are checked again before the order is saved."
            : "Your account details are prefilled where possible. Inventory and pricing are checked again before the order is saved."}
        </p>
      </div>
      <div className="mt-8">
        <CheckoutForm
          customerDefaults={{
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
            businessName: user?.businessName
          }}
          pricingMode={pricingMode}
          accountBasePath={getAccountBasePathForRole(sessionUser.role)}
        />
      </div>
    </div>
  );
}

