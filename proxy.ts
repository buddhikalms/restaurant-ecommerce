import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getDashboardPathForRole } from "@/lib/user-roles";

function redirectToLogin(request: Parameters<Parameters<typeof auth>[0]>[0]) {
  const loginUrl = new URL("/login", request.nextUrl);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const role = request.auth?.user?.role;
  const isLoggedIn = Boolean(request.auth?.user);

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return redirectToLogin(request);
    }

    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.nextUrl));
    }
  }

  if (pathname.startsWith("/wholesale/account")) {
    if (!isLoggedIn) {
      return redirectToLogin(request);
    }

    if (role !== "WHOLESALE_CUSTOMER") {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.nextUrl));
    }
  }

  if (pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      return redirectToLogin(request);
    }

    if (role !== "CUSTOMER") {
      return NextResponse.redirect(new URL(getDashboardPathForRole(role), request.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/wholesale/account/:path*"]
};

