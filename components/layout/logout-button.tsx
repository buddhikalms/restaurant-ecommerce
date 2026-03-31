"use client";

import { signOut } from "next-auth/react";

import { Button, type ButtonProps } from "@/components/ui/button";

export function LogoutButton({
  className,
  size = "sm",
  variant = "secondary",
}: Pick<ButtonProps, "className" | "size" | "variant">) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
}
