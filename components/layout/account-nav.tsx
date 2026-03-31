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
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active =
          currentPath === item.href || currentPath.startsWith(`${item.href}/`);

        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-lg px-3 text-[0.78rem] font-medium transition",
                active
                  ? "bg-[var(--brand)] text-white"
                  : "border border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]",
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
