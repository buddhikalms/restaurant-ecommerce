export type AppRole = "ADMIN" | "CUSTOMER" | "WHOLESALE_CUSTOMER";
export type PricingMode = "retail" | "wholesale";

export function isWholesaleRole(role?: string | null): role is "ADMIN" | "WHOLESALE_CUSTOMER" {
  return role === "ADMIN" || role === "WHOLESALE_CUSTOMER";
}

export function isRetailRole(role?: string | null): role is "CUSTOMER" {
  return role === "CUSTOMER";
}

export function isCustomerRole(role?: string | null): role is "CUSTOMER" | "WHOLESALE_CUSTOMER" {
  return role === "CUSTOMER" || role === "WHOLESALE_CUSTOMER";
}

export function getPricingModeForRole(role?: string | null): PricingMode {
  return isWholesaleRole(role) ? "wholesale" : "retail";
}

export function getDashboardPathForRole(role?: string | null) {
  if (role === "ADMIN") {
    return "/admin";
  }

  if (role === "WHOLESALE_CUSTOMER") {
    return "/wholesale/account";
  }

  return "/account";
}

export function getAccountBasePathForRole(role?: string | null) {
  return role === "WHOLESALE_CUSTOMER" ? "/wholesale/account" : "/account";
}

export function resolveCallbackUrlForRole(callbackUrl: string | undefined, role?: string | null) {
  const dashboardPath = getDashboardPathForRole(role);

  if (!callbackUrl) {
    return dashboardPath;
  }

  if (callbackUrl.startsWith("/admin")) {
    return role === "ADMIN" ? callbackUrl : dashboardPath;
  }

  if (callbackUrl.startsWith("/wholesale/account")) {
    return role === "WHOLESALE_CUSTOMER" ? callbackUrl : dashboardPath;
  }

  if (callbackUrl.startsWith("/account")) {
    return role === "CUSTOMER" ? callbackUrl : dashboardPath;
  }

  return callbackUrl;
}

