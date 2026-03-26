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
    <div className="page-shell py-12">
      <div className="mx-auto max-w-3xl surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Register</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Create your customer account</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
          Open a standard customer account to place everyday orders, track status changes, and manage your order history from one place.
        </p>
        <div className="mt-8">
          <RegisterForm mode="customer" />
        </div>
        <div className="mt-6 space-y-2 text-sm text-slate-600">
          <p>
            Already registered? <Link href="/login" className="font-semibold text-[var(--brand-dark)]">Log in here</Link>
          </p>
          <p>
            Need business pricing? <Link href="/wholesale/register" className="font-semibold text-[var(--brand-dark)]">Register as a wholesale customer</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

