"use client";

import Link from "next/link";
import { ArrowRight, LogIn, Menu, ShoppingCart, UserRound, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

import { StoreSearchForm } from "@/components/layout/store-search-form";
import { useCart } from "@/components/providers/cart-provider";

const DESKTOP_BREAKPOINT_QUERY = "(min-width: 768px)";

type SiteHeaderMobileMenuProps = {
  dashboardPath: string;
  user:
    | {
        name?: string | null;
        role?: string | null;
      }
    | null;
};

export function SiteHeaderMobileMenu({ dashboardPath, user }: SiteHeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount } = useCart();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setIsOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/food", label: "Cloud Kitchen" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/checkout", label: "Checkout" },
    ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <div className="relative flex shrink-0 md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-controls="mobile-site-menu"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] shadow-[0_10px_26px_rgba(47,45,41,0.08)] transition hover:bg-[var(--surface-muted)]"
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {isOpen ? (
        <div id="mobile-site-menu" className="fixed inset-0 z-[60] bg-[rgba(15,10,8,0.55)] backdrop-blur-sm md:hidden">
          <div role="dialog" aria-modal="true" className="flex h-[100dvh] flex-col overflow-hidden bg-[linear-gradient(180deg,#1a120d_0%,#24160f_44%,#120b08_100%)] text-white">
            <div className="flex items-center justify-between border-b border-white/10 px-5 pb-4 pt-5">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#f3d6a7]">Quick navigation</p>
                <p className="mt-1 text-lg font-semibold text-white">Browse CeylonTaste</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/10 text-white transition hover:bg-white/16"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-6 pt-5">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/7 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-md">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/55">Search</p>
                <StoreSearchForm className="mt-3 h-11" placeholder="Search products or SKU" />
              </div>

              <nav className="mt-6 flex flex-col gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/7 px-4 py-4 text-base font-semibold text-white transition hover:bg-white/12"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4 text-white/50 transition group-hover:translate-x-0.5 group-hover:text-white/85" />
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/7 p-4 backdrop-blur-md">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#f3d6a7]">
                    {user ? "Account" : "Get started"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/72">
                    {user
                      ? user.name
                        ? `Signed in as ${user.name}.`
                        : "Signed in and ready to manage orders."
                      : "Log in to manage orders faster and keep wholesale access close."}
                  </p>

                  <div className="mt-4 flex flex-col gap-3">
                    {user ? (
                      <>
                        <Link
                          href={dashboardPath}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#1b120d] shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition hover:brightness-95"
                        >
                          <UserRound className="h-4 w-4" />
                          <span>Open dashboard</span>
                        </Link>
                        <Link
                          href="/cart"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex h-11 items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/14"
                        >
                          <span className="inline-flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Cart
                          </span>
                          <span className="inline-flex min-w-6 items-center justify-center rounded-md bg-white/14 px-2 py-1 text-[0.72rem] font-semibold text-white/85">
                            {itemCount}
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 text-sm font-medium text-white transition hover:bg-white/10"
                        >
                          Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--brand)_0%,var(--brand-dark)_100%)] px-4 text-sm font-semibold text-white shadow-[0_18px_38px_rgba(141,48,30,0.3)] transition hover:brightness-105"
                        >
                          <LogIn className="h-4 w-4" />
                          <span>Log in</span>
                        </Link>
                        <Link
                          href="/cart"
                          onClick={() => setIsOpen(false)}
                          className="inline-flex h-11 items-center justify-between rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/14"
                        >
                          <span className="inline-flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Cart
                          </span>
                          <span className="inline-flex min-w-6 items-center justify-center rounded-md bg-white/14 px-2 py-1 text-[0.72rem] font-semibold text-white/85">
                            {itemCount}
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
