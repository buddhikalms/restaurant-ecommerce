import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getDashboardPathForRole, isCustomerRole, isRetailRole, isWholesaleRole } from "@/lib/user-roles";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect(getDashboardPathForRole(user.role));
  }

  return user;
}

export async function requireCustomerUser() {
  const user = await requireUser();

  if (!isCustomerRole(user.role)) {
    redirect(getDashboardPathForRole(user.role));
  }

  return user;
}

export async function requireRetailUser() {
  const user = await requireUser();

  if (!isRetailRole(user.role)) {
    redirect(getDashboardPathForRole(user.role));
  }

  return user;
}

export async function requireWholesaleUser() {
  const user = await requireUser();

  if (!isWholesaleRole(user.role) || user.role === "ADMIN") {
    redirect(getDashboardPathForRole(user.role));
  }

  return user;
}

