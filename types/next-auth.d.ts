import { DefaultSession } from "next-auth";

import { AppRole } from "@/lib/user-roles";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AppRole;
      businessName?: string | null;
    };
  }

  interface User {
    role: AppRole;
    businessName?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: AppRole;
    businessName?: string | null;
  }
}

