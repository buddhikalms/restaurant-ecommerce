import type { Metadata } from "next";

import "./globals.css";

import { auth } from "@/auth";
import { CartProvider } from "@/components/providers/cart-provider";
import { getPricingModeForRole } from "@/lib/user-roles";

export const metadata: Metadata = {
  title: "CeylonTaste",
  description: "Wholesale ordering platform for restaurants, cafes, and food service teams."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] font-sans text-slate-900 antialiased">
        <CartProvider pricingMode={getPricingModeForRole(session?.user?.role)}>{children}</CartProvider>
      </body>
    </html>
  );
}

