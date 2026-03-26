import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { CartIndicator } from "@/components/store/cart-indicator";
import { getDashboardPathForRole } from "@/lib/user-roles";

export async function SiteHeader() {
  const session = await auth();
  const dashboardPath = getDashboardPathForRole(session?.user?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#fff8ec]/90 backdrop-blur-xl">
      <div className="page-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-lg font-bold text-white">
            H
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-slate-900">
              Harvest Wholesale
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Restaurant Supply
            </p>
          </div>
        </Link>

        <div className="flex flex-col gap-4 md:items-end lg:flex-row lg:items-center lg:gap-6">
          <nav className="hidden items-center justify-end gap-5 text-sm font-medium text-slate-600 md:flex">
            <Link
              href="/"
              className="transition hover:text-[var(--brand-dark)]"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="transition hover:text-[var(--brand-dark)]"
            >
              About
            </Link>
            <Link
              href="/products"
              className="transition hover:text-[var(--brand-dark)]"
            >
              Products
            </Link>
            <Link
              href="/checkout"
              className="transition hover:text-[var(--brand-dark)]"
            >
              Checkout
            </Link>
            {session?.user ? (
              <Link
                href={dashboardPath}
                className="transition hover:text-[var(--brand-dark)]"
              >
                Dashboard
              </Link>
            ) : null}
            {session?.user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="transition hover:text-[var(--brand-dark)]"
              >
                Admin
              </Link>
            ) : null}
          </nav>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {session?.user ? (
              <>
                <Link
                  href={dashboardPath}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--brand)]/20 bg-[#fff5e3] px-5 text-sm font-semibold text-[var(--brand-dark)] shadow-[0_10px_26px_rgba(155,95,25,0.14)] transition hover:border-[var(--brand)]/40 hover:bg-white hover:shadow-[0_14px_32px_rgba(155,95,25,0.18)]"
                >
                  <UserRound className="h-4 w-4" />
                  <span>{session.user.name}</span>
                </Link>
                <CartIndicator />
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#4a2a0a] px-5 text-sm font-semibold text-[#fff4df] shadow-[0_14px_34px_rgba(74,42,10,0.28)] transition hover:bg-[#653713]"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Log in</span>
                </Link>
                <CartIndicator />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
