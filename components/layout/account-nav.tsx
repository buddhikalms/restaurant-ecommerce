"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function AccountNav({
  mode = "customer",
}: {
  mode?: "customer" | "wholesale";
}) {
  const currentPath = usePathname();
  const basePath = mode === "wholesale" ? "/wholesale/account" : "/account";
  const items = [
    { href: basePath, label: mode === "wholesale" ? "Dashboard" : "Overview" },
    { href: `${basePath}/orders`, label: "Orders" },
    { href: `${basePath}/settings`, label: "Settings" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => {
        const active =
          currentPath === item.href || currentPath.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition",
                active
                  ? "bg-[var(--brand-dark)] text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
