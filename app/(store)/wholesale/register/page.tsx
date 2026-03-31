import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDashboardPathForRole } from "@/lib/user-roles";

export default async function WholesaleRegisterPage() {
  const user = await getCurrentUser();

  if (user?.role === "WHOLESALE_CUSTOMER" || user?.role === "ADMIN") {
    redirect(getDashboardPathForRole(user.role));
  }

  return (
    <div className="page-shell py-6 sm:py-8">
      <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="paper-panel rounded-lg p-5">
          <p className="section-label">Wholesale registration</p>
          <h1 className="section-title mt-2">Open a wholesale buyer account</h1>
          <p className="section-copy mt-3 max-w-md">
            Add your business, delivery, and invoicing details to unlock trade pricing and easier bulk ordering.
          </p>
          {user?.role === "CUSTOMER" ? (
            <p className="notice-warn mt-4">
              You are currently signed in with a retail account. Use a different email if you want a separate wholesale login.
            </p>
          ) : null}
          <div className="mt-4 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
            <p>
              Already registered? <Link href="/login" className="warm-link">Sign in</Link>
            </p>
            <p>
              Need a regular customer account? <Link href="/register" className="warm-link">Register here</Link>
            </p>
          </div>
        </section>

        <section className="surface-card rounded-lg p-5">
          <p className="section-label">Trade account setup</p>
          <h2 className="section-subtitle mt-2">Business details</h2>
          <div className="mt-4">
            <RegisterForm mode="wholesale" />
          </div>
        </section>
      </div>
    </div>
  );
}
