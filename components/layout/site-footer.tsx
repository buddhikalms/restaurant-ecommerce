import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/70 bg-[#2c2419] text-[#f8f0df]">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="font-heading text-2xl font-semibold">
            Harvest Wholesale
          </p>
          <p className="mt-4 max-w-md text-sm leading-6 text-[#d4c4a6]">
            Flexible retail and wholesale ordering for homes, restaurants,
            cafes, hotel kitchens, and catering teams that need dependable stock
            visibility and cleaner buying workflows.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f5d7a3]">
            Browse
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#d4c4a6]">
            <Link href="/about">About us</Link>
            <Link href="/products">All products</Link>
            <Link href="/cart">Cart</Link>
            <Link href="/checkout">Checkout</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f5d7a3]">
            Accounts
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#d4c4a6]">
            <Link href="/login">Login</Link>
            <Link href="/register">Customer registration</Link>
            <Link href="/wholesale/register">Wholesale registration</Link>
            <Link href="/account/orders">Retail order history</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
