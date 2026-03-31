import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";

import { auth } from "@/auth";
import { LogoutButton } from "@/components/layout/logout-button";
import { SiteHeaderMobileMenu } from "@/components/layout/site-header-mobile-menu";
import { StoreSearchForm } from "@/components/layout/store-search-form";
import { CartIndicator } from "@/components/store/cart-indicator";
import { getDashboardPathForRole } from "@/lib/user-roles";

export async function SiteHeader() {
  const session = await auth();
  const dashboardPath = getDashboardPathForRole(session?.user?.role);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[rgba(250,247,242,0.96)] backdrop-blur-sm">
      <div className="page-shell">
        <div className="flex h-14 items-center justify-between gap-3 md:h-16 md:grid md:grid-cols-[auto_1fr_auto] md:gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--brand)] text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-white">
              CT
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--foreground)]">CeylonTaste</p>
              <p className="hidden truncate text-[0.68rem] text-[var(--muted-foreground)] md:block">
                Wholesale food supply
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-4 md:flex">
            <nav className="flex items-center gap-1 text-[0.82rem] text-[var(--muted-foreground)]">
              {[
                { href: "/products", label: "Products" },
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/checkout", label: "Checkout" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2.5 py-1.5 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                >
                  {item.label}
                </Link>
              ))}
              {session?.user ? (
                <Link
                  href={dashboardPath}
                  className="rounded-md px-2.5 py-1.5 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                >
                  Dashboard
                </Link>
              ) : null}
              {session?.user?.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="rounded-md px-2.5 py-1.5 transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                >
                  Admin
                </Link>
              ) : null}
            </nav>
            <StoreSearchForm className="max-w-sm flex-1" />
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <CartIndicator />
            {session?.user ? (
              <>
                <Link
                  href={dashboardPath}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-[0.82rem] text-[var(--foreground)] transition hover:bg-[var(--surface-muted)]"
                >
                  <UserRound className="h-3.5 w-3.5" />
                  <span>{session.user.name}</span>
                </Link>
                <LogoutButton />
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--brand)] px-3 text-[0.82rem] font-medium text-white transition hover:bg-[var(--brand-dark)]"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Log in</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <CartIndicator compact />
            <SiteHeaderMobileMenu
              dashboardPath={dashboardPath}
              user={session?.user ?? null}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
