"use client";

import Link from "next/link";
import { LogIn, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { CartIndicator } from "@/components/store/cart-indicator";

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

export function SiteHeaderMobileMenu({
  dashboardPath,
  user,
}: SiteHeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

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
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/products", label: "Products" },
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
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/72 text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur-xl transition hover:border-[var(--brand)]/35 hover:bg-white/82"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {isOpen ? (
        <div
          id="mobile-site-menu"
          className="fixed inset-0 z-[60] flex min-h-screen flex-col overflow-hidden bg-[rgba(28,20,12,0.12)] backdrop-blur-[56px] md:hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,248,232,0.46),transparent_34%),radial-gradient(circle_at_top_right,rgba(215,178,109,0.14),transparent_28%),linear-gradient(180deg,rgba(255,251,244,0.28)_0%,rgba(244,232,209,0.14)_100%)]" />

          <div className="relative flex items-center justify-between border-b border-white/40 bg-white/10 px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-[40px] sm:px-6">
            <div>
              <p className="font-heading text-lg font-semibold text-slate-900">
                Menu
              </p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-600">
                Browse CeylonTaste
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/62 text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.12)] backdrop-blur-[28px] transition hover:border-[var(--brand)]/35 hover:bg-white/82"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex-1 overflow-y-auto px-4 pb-8 pt-6 sm:px-6">
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="rounded-[1.6rem] border border-white/45 bg-white/24 px-5 py-4 text-base font-semibold text-slate-700 shadow-[0_14px_40px_rgba(15,23,42,0.08)] backdrop-blur-[34px] transition hover:border-[var(--brand)]/25 hover:bg-white/54 hover:text-[var(--brand-dark)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-8 border-t border-white/32 pt-6">
              <div className="flex flex-col gap-3">
                {user ? (
                  <>
                    <Link
                      href={dashboardPath}
                      onClick={() => setIsOpen(false)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--brand)]/20 bg-[#fff5e3]/92 px-5 text-sm font-semibold text-[var(--brand-dark)] shadow-[0_10px_26px_rgba(155,95,25,0.14)] transition hover:border-[var(--brand)]/40 hover:bg-white"
                    >
                      <UserRound className="h-4 w-4" />
                      <span>{user.name || "Dashboard"}</span>
                    </Link>
                    <div onClick={() => setIsOpen(false)}>
                      <CartIndicator />
                    </div>
                    <div onClick={() => setIsOpen(false)}>
                      <LogoutButton />
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--brand-dark)] px-5 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(74,42,10,0.28)] transition hover:bg-[#653713]"
                    >
                      <LogIn className="h-4 w-4 text-white" />
                      <span className="text-white">Log in</span>
                    </Link>
                    <div onClick={() => setIsOpen(false)}>
                      <CartIndicator />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

