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
    <div className="page-shell py-6 sm:py-8">
      <div className="mx-auto max-w-3xl grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-card rounded-lg p-5">
          <p className="section-label">Login</p>
          <h1 className="section-title mt-2">Sign in</h1>
          <p className="section-copy mt-2">Access your orders, account details, and wholesale pricing.</p>
          <div className="mt-4 space-y-2 text-[0.82rem] text-[var(--muted-foreground)]">
            <p>Need a customer account? <Link href="/register" className="warm-link">Register</Link></p>
            <p>Need trade pricing? <Link href="/wholesale/register" className="warm-link">Create a wholesale account</Link></p>
          </div>
        </div>
        <div className="surface-card rounded-lg p-5">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
