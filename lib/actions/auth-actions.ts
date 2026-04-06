"use server";

import { hash } from "bcryptjs";
import { Prisma } from "@/generated/prisma";

import { ActionResponse } from "@/lib/actions/action-response";
import { prisma } from "@/lib/prisma";
import { customerRegisterSchema, wholesaleRegisterSchema } from "@/lib/validations/auth";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function buildAccountCreationError(error: unknown): ActionResponse<{ email: string; password: string }> {
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

export async function registerCustomerAction(
  input: unknown
): Promise<ActionResponse<{ email: string; password: string }>> {
  const parsed = customerRegisterSchema.safeParse(input);

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
        role: "CUSTOMER"
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
    return buildAccountCreationError(error);
  }
}

export async function registerWholesaleCustomerAction(
  input: unknown
): Promise<ActionResponse<{ email: string; password: string }>> {
  const parsed = wholesaleRegisterSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please correct the highlighted fields and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();
  const passwordHash = await hash(parsed.data.password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name: fullName,
        businessName: normalizeOptionalText(parsed.data.tradingName),
        email: parsed.data.email.toLowerCase(),
        phone: parsed.data.mobileNumber,
        passwordHash,
        role: "WHOLESALE_CUSTOMER",
        wholesaleProfile: {
          create: {
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            mobileNumber: parsed.data.mobileNumber,
            telephoneNumber: parsed.data.telephoneNumber,
            tradingName: normalizeOptionalText(parsed.data.tradingName),
            deliveryAddressLine1: parsed.data.deliveryAddressLine1,
            deliveryAddressLine2: normalizeOptionalText(parsed.data.deliveryAddressLine2),
            deliveryAddressLine3: normalizeOptionalText(parsed.data.deliveryAddressLine3),
            deliveryTown: parsed.data.deliveryTown,
            deliveryPostcode: parsed.data.deliveryPostcode,
            differentInvoiceAddress: parsed.data.differentInvoiceAddress,
            invoiceAddressLine1: parsed.data.differentInvoiceAddress
              ? normalizeOptionalText(parsed.data.invoiceAddressLine1)
              : null,
            invoiceAddressLine2: parsed.data.differentInvoiceAddress
              ? normalizeOptionalText(parsed.data.invoiceAddressLine2)
              : null,
            invoiceAddressLine3: parsed.data.differentInvoiceAddress
              ? normalizeOptionalText(parsed.data.invoiceAddressLine3)
              : null,
            invoiceTown: parsed.data.differentInvoiceAddress
              ? normalizeOptionalText(parsed.data.invoiceTown)
              : null,
            invoicePostcode: parsed.data.differentInvoiceAddress
              ? normalizeOptionalText(parsed.data.invoicePostcode)
              : null,
            companyType: parsed.data.companyType,
            companyNumber: normalizeOptionalText(parsed.data.companyNumber),
            directorName: normalizeOptionalText(parsed.data.directorName),
            businessType: parsed.data.businessType
          }
        }
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
    return buildAccountCreationError(error);
  }
}
