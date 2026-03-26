"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminShell({
  userName,
  children
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const currentPath = usePathname();

  return (
    <div className="min-h-screen bg-[#f5efe1]">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-6">
        <aside className="surface-card rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <Link href="/admin" className="block">
            <p className="font-heading text-2xl font-semibold text-slate-900">Admin Console</p>
            <p className="mt-2 text-sm text-slate-500">Signed in as {userName}</p>
          </Link>

          <nav className="mt-8 flex flex-col gap-2">
            {ADMIN_NAV_ITEMS.map((item) => {
              const active = currentPath === item.href || currentPath.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active
                      ? "bg-[var(--brand)] text-white"
                      : "text-slate-700 hover:bg-white hover:text-slate-900"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
