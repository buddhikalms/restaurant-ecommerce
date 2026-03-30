import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { type AppRole } from "@/lib/user-roles";
import { loginSchema } from "@/lib/validations/auth";

type AuthLoggerError = Error & {
  type?: string;
  cause?: Record<string, unknown> & { err?: Error };
};

const red = "\x1b[31m";
const reset = "\x1b[0m";

function isRecoverableJwtSessionError(error: AuthLoggerError) {
  return (
    error.type === "JWTSessionError" &&
    error.cause?.err instanceof Error &&
    error.cause.err.name === "JWEInvalid" &&
    error.cause.err.message === "Invalid Compact JWE"
  );
}

function logAuthError(error: Error) {
  const authError = error as AuthLoggerError;

  if (isRecoverableJwtSessionError(authError)) {
    return;
  }

  const name = authError.type ?? authError.name;

  console.error(`${red}[auth][error]${reset} ${name}: ${authError.message}`);

  if (authError.cause?.err instanceof Error) {
    const { err, ...details } = authError.cause;
    console.error(`${red}[auth][cause]${reset}:`, err.stack);

    if (Object.keys(details).length > 0) {
      console.error(`${red}[auth][details]${reset}:`, JSON.stringify(details, null, 2));
    }

    return;
  }

  if (authError.stack) {
    console.error(authError.stack.replace(/.*/, "").substring(1));
  }
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt"
  },
  logger: {
    error: logAuthError
  },
  pages: {
    signIn: "/login"
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() }
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await compare(parsed.data.password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as AppRole,
          businessName: user.businessName
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role as AppRole;
        token.businessName = typeof user.businessName === "string" ? user.businessName : null;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub && token.role) {
        session.user.id = token.sub;
        session.user.role = token.role as AppRole;
        session.user.businessName = typeof token.businessName === "string" ? token.businessName : null;
      }

      return session;
    }
  }
});

