import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/login-form";
import { getCurrentUser } from "@/lib/auth-helpers";
import { resolveCallbackUrlForRole } from "@/lib/user-roles";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function toValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  const params = await searchParams;
  const callbackUrl = toValue(params.callbackUrl) || "/account";

  if (user) {
    redirect(resolveCallbackUrlForRole(callbackUrl, user.role));
  }

  return (
    <div className="page-shell py-12">
      <div className="mx-auto max-w-xl surface-card rounded-[2.5rem] border border-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">Login</p>
        <h1 className="mt-3 font-heading text-4xl font-semibold text-slate-900">Welcome back</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Sign in to place orders, review your customer dashboard, or access your wholesale buyer workspace.
        </p>
        <div className="mt-8">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
        <div className="mt-6 space-y-2 text-sm text-slate-600">
          <p>
            Need a standard customer account? <Link href="/register" className="font-semibold text-[var(--brand-dark)]">Register here</Link>
          </p>
          <p>
            Need wholesale pricing? <Link href="/wholesale/register" className="font-semibold text-[var(--brand-dark)]">Create a wholesale account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
