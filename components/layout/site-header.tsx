import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { SiteHeaderMobileMenu } from "@/components/layout/site-header-mobile-menu";
import { CartIndicator } from "@/components/store/cart-indicator";
import { getDashboardPathForRole } from "@/lib/user-roles";

export async function SiteHeader() {
  const session = await auth();
  const dashboardPath = getDashboardPathForRole(session?.user?.role);

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#fff8ec]/90 backdrop-blur-xl">
      <div className="page-shell py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-dark)] text-base font-bold text-white sm:h-11 sm:w-11 sm:text-lg">
              H
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-semibold text-slate-900 sm:text-lg">
                CeylonTaste
              </p>
              <p className="hidden truncate text-[10px] uppercase tracking-[0.16em] text-slate-500 sm:block sm:text-xs sm:tracking-[0.18em]">
                WHOLESALE & RETAIL
              </p>
            </div>
          </Link>

          <div className="flex md:hidden">
            <SiteHeaderMobileMenu
              dashboardPath={dashboardPath}
              user={session?.user ?? null}
            />
          </div>

          <div className="hidden md:flex md:items-center md:gap-6">
            <nav className="flex items-center justify-end gap-5 text-sm font-medium text-slate-600">
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
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(74,42,10,0.28)] transition hover:bg-[#653713]"
                  >
                    <LogIn className="h-4 w-4 text-white" />
                    <span className="text-white">Log in</span>
                  </Link>
                  <CartIndicator />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}



