"use server";

import { hash } from "bcryptjs";
import { Prisma, type Role } from "prisma-generated-client-v2";

import { ActionResponse } from "@/lib/actions/action-response";
import { prisma } from "@/lib/prisma";
import { customerRegisterSchema, wholesaleRegisterSchema } from "@/lib/validations/auth";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

async function registerUserAction(
  input: unknown,
  options: {
    role: Role;
    schema: typeof customerRegisterSchema | typeof wholesaleRegisterSchema;
  }
): Promise<ActionResponse<{ email: string; password: string }>> {
  const parsed = options.schema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        businessName: normalizeOptionalText(parsed.data.businessName),
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.phone,
        passwordHash,
        role: options.role
      }
    });

    return {
      success: true,
      data: {
        email: user.email,
        password: parsed.data.password
      },
      message: "Account created successfully."
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "An account with that email already exists."
      };
    }

    return {
      success: false,
      error: "Unable to create your account right now. Please try again."
    };
  }
}

export async function registerCustomerAction(
  input: unknown
): Promise<ActionResponse<{ email: string; password: string }>> {
  return registerUserAction(input, {
    role: "CUSTOMER",
    schema: customerRegisterSchema
  });
}

export async function registerWholesaleCustomerAction(
  input: unknown
): Promise<ActionResponse<{ email: string; password: string }>> {
  return registerUserAction(input, {
    role: "WHOLESALE_CUSTOMER",
    schema: wholesaleRegisterSchema
  });
}

