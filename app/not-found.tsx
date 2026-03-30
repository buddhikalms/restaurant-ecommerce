import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <span className="rounded-full bg-white/80 px-4 py-1 text-sm font-medium text-[var(--brand-dark)] shadow-sm">
        Page not found
      </span>
      <h1 className="mt-6 font-heading text-4xl font-semibold text-slate-900 sm:text-5xl">
        This service aisle is empty.
      </h1>
      <p className="mt-4 max-w-xl text-base text-slate-600">
        The page you requested does not exist or may have moved. Head back to
        the storefront to continue browsing.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-[var(--brand-dark)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-dark)]"
      >
        Return home
      </Link>
    </div>
  );
}
