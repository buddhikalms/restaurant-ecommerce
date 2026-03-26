import Link from "next/link";
import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/forms/register-form";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getDashboardPathForRole } from "@/lib/user-roles";

export default async function WholesaleRegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(getDashboardPathForRole(user.role));
  }

  return (
    <div className="page-shell py-12">
      <div className="mx-auto max-w-3xl surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Wholesale Registration</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Create your wholesale buyer account</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          Register your business to unlock wholesale pricing, business-specific order history, and minimum quantity rules for bulk purchasing.
        </p>
        <div className="mt-8">
          <RegisterForm mode="wholesale" />
        </div>
        <div className="mt-6 space-y-2 text-sm text-slate-600">
          <p>
            Already registered? <Link href="/login" className="font-semibold text-[var(--brand-dark)]">Log in here</Link>
          </p>
          <p>
            Shopping as a regular customer? <Link href="/register" className="font-semibold text-[var(--brand-dark)]">Create a customer account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

