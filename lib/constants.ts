export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export const ACCOUNT_NAV_ITEMS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
] as const;

export const PRODUCT_PAGE_SIZE = 9;
export const ADMIN_PAGE_SIZE = 10;
