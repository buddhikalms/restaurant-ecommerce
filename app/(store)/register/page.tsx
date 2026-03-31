import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDashboardPathForRole } from "@/lib/user-roles";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDashboardPathForRole(user.role));
  }

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[0.88fr_1.12fr]">
        <section className="paper-panel rounded-lg p-5">
          <p className="section-label">Customer registration</p>
          <h1 className="section-title mt-2">Create a customer account</h1>
          <p className="section-copy mt-3 max-w-md">
            Set up a simple buying account for repeat ordering, saved details, and easier checkout.
          </p>
          <div className="mt-4 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
            <p>
              Already registered? <Link href="/login" className="warm-link">Sign in</Link>
            </p>
            <p>
              Need trade pricing? <Link href="/wholesale/register" className="warm-link">Create a wholesale account</Link>
            </p>
          </div>
        </section>

        <section className="surface-card rounded-lg p-5">
          <p className="section-label">Create account</p>
          <h2 className="section-subtitle mt-2">Your details</h2>
          <div className="mt-4">
            <RegisterForm mode="customer" />
          </div>
        </section>
      </div>
    </div>
  );
}
