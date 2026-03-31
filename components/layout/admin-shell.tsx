"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  ChartColumn,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { LogoutButton } from "@/components/layout/logout-button";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV_ICONS = {
  "/admin": LayoutDashboard,
  "/admin/orders": ShoppingCart,
  "/admin/products": Package,
  "/admin/customers": Users,
  "/admin/analytics": ChartColumn,
  "/admin/settings": Settings,
} as const;

function isNavItemActive(currentPath: string, href: string) {
  if (href === "/admin") {
    return currentPath === href;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

function getPageLabel(currentPath: string) {
  return (
    ADMIN_NAV_ITEMS.find((item) => isNavItemActive(currentPath, item.href))
      ?.label ?? "Admin"
  );
}

function getSearchConfig(currentPath: string) {
  if (currentPath.startsWith("/admin/products")) {
    return {
      path: "/admin/products",
      placeholder: "Search products or SKU",
      searchable: true,
    };
  }

  if (currentPath.startsWith("/admin/customers")) {
    return {
      path: "/admin/customers",
      placeholder: "Search customer, business, or email",
      searchable: true,
    };
  }

  if (currentPath.startsWith("/admin/orders")) {
    return {
      path: "/admin/orders",
      placeholder: "Search order number, customer, or business",
      searchable: true,
    };
  }

  return {
    path: "/admin/orders",
    placeholder: "Search orders, products, or customers",
    searchable: false,
  };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminShell({
  userName,
  userEmail,
  children,
}: {
  userName: string;
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  const currentPath = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const pageLabel = getPageLabel(currentPath);
  const searchConfig = getSearchConfig(currentPath);
  const currentQuery = searchParams.get("q") ?? "";
  const closeMobileNav = () => setIsMobileNavOpen(false);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextValue = String(formData.get("q") ?? "").trim();
    const nextParams = new URLSearchParams(searchParams.toString());

    if (nextValue) {
      nextParams.set("q", nextValue);
    } else {
      nextParams.delete("q");
    }

    nextParams.delete("page");
    closeMobileNav();

    if (!searchConfig.searchable) {
      router.push(
        nextValue
          ? `${searchConfig.path}?q=${encodeURIComponent(nextValue)}`
          : searchConfig.path,
      );
      return;
    }

    const nextQueryString = nextParams.toString();
    router.push(
      nextQueryString
        ? `${searchConfig.path}?${nextQueryString}`
        : searchConfig.path,
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--admin-sidebar-border)] px-4 py-4">
        <Link href="/admin" className="min-w-0" onClick={closeMobileNav}>
          <p className="truncate text-sm font-semibold tracking-[0.04em] text-white">
            {isSidebarCollapsed ? "CT" : "CeylonTaste Admin"}
          </p>
          {!isSidebarCollapsed ? (
            <p className="mt-1 truncate text-[0.72rem] text-white">
              Wholesale operations hub
            </p>
          ) : null}
        </Link>
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed((current) => !current)}
          className="hidden h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-sidebar-border)] bg-white/5 text-white transition hover:bg-white/10 lg:inline-flex"
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isSidebarCollapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.href];
          const active = isNavItemActive(currentPath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileNav}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.82rem] font-medium transition",
                active
                  ? "bg-white/14 text-white ring-1 ring-inset ring-white/10"
                  : "text-white hover:bg-white/8 hover:text-white",
                isSidebarCollapsed && "justify-center px-2",
              )}
              title={item.label}
            >
              <Icon className="h-4 w-4 shrink-0 text-white" />
              {!isSidebarCollapsed ? (
                <span className="text-white">{item.label}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--admin-sidebar-border)] px-3 py-4">
        <div className="rounded-xl bg-white/5 px-3 py-3 text-[0.76rem] text-white">
          {!isSidebarCollapsed ? (
            <>
              <p className="font-medium text-white">{userName}</p>
              <p className="mt-1 truncate text-white">
                {userEmail ?? "admin@ceylontaste"}
              </p>
            </>
          ) : (
            <p className="text-center font-medium text-white">
              {getInitials(userName)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-theme min-h-screen bg-[var(--admin-bg)] text-[var(--admin-foreground)]">
      <div className="flex min-h-screen">
        <aside
          className={cn(
            "hidden border-r border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar)] transition-[width] duration-200 lg:block",
            isSidebarCollapsed ? "w-[84px]" : "w-[248px]",
          )}
        >
          {sidebar}
        </aside>

        {isMobileNavOpen ? (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <button
              type="button"
              className="flex-1 bg-slate-950/40"
              aria-label="Close navigation"
              onClick={closeMobileNav}
            />
            <aside className="w-[270px] border-l border-[var(--admin-sidebar-border)] bg-[var(--admin-sidebar)] shadow-2xl">
              <div className="flex items-center justify-end px-3 py-3">
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--admin-sidebar-border)] bg-white/5 text-white"
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {sidebar}
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[color:rgba(244,241,234,0.92)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="admin-icon-button lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>

              <div className="min-w-0 shrink-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted-foreground)]">
                  {pageLabel}
                </p>
                <p className="truncate text-[0.82rem] text-[var(--admin-foreground)]">
                  Daily wholesale admin workflow
                </p>
              </div>

              <form
                key={`desktop-${currentPath}-${currentQuery}`}
                className="hidden min-w-[280px] flex-1 sm:block"
                onSubmit={handleSearchSubmit}
              >
                <div className="flex h-9 items-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3">
                  <Search className="h-4 w-4 text-[var(--admin-muted-foreground)]" />
                  <input
                    name="q"
                    defaultValue={currentQuery}
                    placeholder={searchConfig.placeholder}
                    className="h-full w-full border-0 bg-transparent px-2 text-[0.82rem] text-[var(--admin-foreground)] outline-none placeholder:text-[var(--admin-muted-foreground)]"
                  />
                </div>
              </form>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  className="admin-icon-button relative"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--admin-accent)]" />
                </button>

                <details className="group relative">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2.5 py-1.5 text-left transition hover:bg-[var(--admin-surface-muted)]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--admin-sidebar)] text-[0.76rem] font-semibold text-white">
                      {getInitials(userName)}
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[0.78rem] font-medium text-[var(--admin-foreground)]">
                        {userName}
                      </p>
                      <p className="text-[0.7rem] text-[var(--admin-muted-foreground)]">
                        Administrator
                      </p>
                    </div>
                    <ChevronDown className="hidden h-4 w-4 text-[var(--admin-muted-foreground)] sm:block" />
                  </summary>
                  <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2 shadow-lg shadow-slate-950/5">
                    <div className="border-b border-[var(--admin-border)] px-2.5 pb-2 pt-1">
                      <p className="text-[0.8rem] font-medium text-[var(--admin-foreground)]">
                        {userName}
                      </p>
                      <p className="mt-0.5 text-[0.74rem] text-[var(--admin-muted-foreground)]">
                        {userEmail ?? "admin@ceylontaste"}
                      </p>
                    </div>
                    <div className="space-y-1 px-1 py-2">
                      <Link
                        href="/admin/settings"
                        onClick={closeMobileNav}
                        className="flex items-center rounded-lg px-2.5 py-2 text-[0.8rem] text-[var(--admin-foreground)] transition hover:bg-[var(--admin-surface-muted)]"
                      >
                        Account settings
                      </Link>
                      <LogoutButton
                        className="w-full justify-start"
                        variant="ghost"
                      />
                    </div>
                  </div>
                </details>
              </div>
            </div>

            <form
              key={`mobile-${currentPath}-${currentQuery}`}
              className="border-t border-[var(--admin-border)] px-4 py-3 sm:hidden"
              onSubmit={handleSearchSubmit}
            >
              <div className="flex h-9 items-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3">
                <Search className="h-4 w-4 text-[var(--admin-muted-foreground)]" />
                <input
                  name="q"
                  defaultValue={currentQuery}
                  placeholder={searchConfig.placeholder}
                  className="h-full w-full border-0 bg-transparent px-2 text-[0.82rem] text-[var(--admin-foreground)] outline-none placeholder:text-[var(--admin-muted-foreground)]"
                />
              </div>
            </form>
          </header>

          <main className="flex-1 px-4 py-4 lg:px-6 lg:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
