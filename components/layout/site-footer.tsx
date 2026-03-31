import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="page-shell py-8">
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">CeylonTaste</p>
            <p className="mt-2 max-w-sm text-[0.82rem] leading-6 text-[var(--muted-foreground)]">
              Minimal wholesale ordering for restaurants, cafes, and food service teams.
            </p>
          </div>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Browse
            </p>
            <div className="mt-2 flex flex-col gap-1.5 text-[0.82rem] text-[var(--muted-foreground)]">
              <Link href="/products" className="transition hover:text-[var(--foreground)]">Products</Link>
              <Link href="/about" className="transition hover:text-[var(--foreground)]">About</Link>
              <Link href="/contact" className="transition hover:text-[var(--foreground)]">Contact</Link>
              <Link href="/checkout" className="transition hover:text-[var(--foreground)]">Checkout</Link>
            </div>
          </div>
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              Account
            </p>
            <div className="mt-2 flex flex-col gap-1.5 text-[0.82rem] text-[var(--muted-foreground)]">
              <Link href="/login" className="transition hover:text-[var(--foreground)]">Login</Link>
              <Link href="/register" className="transition hover:text-[var(--foreground)]">Register</Link>
              <Link href="/wholesale/register" className="transition hover:text-[var(--foreground)]">Wholesale</Link>
              <Link href="/account/orders" className="transition hover:text-[var(--foreground)]">Orders</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
