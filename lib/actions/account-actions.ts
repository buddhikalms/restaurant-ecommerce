"use server";

import { Prisma } from "prisma-generated-client-v2";
import { revalidatePath } from "next/cache";

import { unstable_update } from "@/auth";
import { type ActionResponse } from "@/lib/actions/action-response";
import {
  requireCustomerUser,
  requireRetailUser,
  requireWholesaleUser,
} from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getAccountBasePathForRole } from "@/lib/user-roles";
import {
  customerAccountSettingsSchema,
  defaultAddressSettingsSchema,
  wholesaleBusinessSettingsSchema,
  wholesaleContactSettingsSchema,
} from "@/lib/validations/account";

function normalizeOptionalText(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function splitName(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];

  return {
    firstName: parts[0] ?? "Wholesale",
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : "Buyer",
  };
}

async function getWholesaleProfileFallback(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      phone: true,
      businessName: true,
      addresses: {
        where: {
          isDefault: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
        select: {
          line1: true,
          line2: true,
          city: true,
          postalCode: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const fallbackName = splitName(user.name);
  const defaultAddress = user.addresses[0];

  return {
    userId,
    firstName: fallbackName.firstName,
    lastName: fallbackName.lastName,
    mobileNumber: user.phone ?? "",
    telephoneNumber: user.phone ?? "",
    tradingName: normalizeOptionalText(user.businessName),
    deliveryAddressLine1: defaultAddress?.line1 ?? "",
    deliveryAddressLine2: normalizeOptionalText(defaultAddress?.line2),
    deliveryAddressLine3: null,
    deliveryTown: defaultAddress?.city ?? "",
    deliveryPostcode: defaultAddress?.postalCode ?? "",
    differentInvoiceAddress: false,
    invoiceAddressLine1: null,
    invoiceAddressLine2: null,
    invoiceAddressLine3: null,
    invoiceTown: null,
    invoicePostcode: null,
    companyType: "",
    companyNumber: null,
    directorName: null,
    businessType: "",
  };
}

function buildAccountUpdateError(error: unknown): ActionResponse {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return {
      success: false,
      error: "That email address is already in use by another account.",
    };
  }

  return {
    success: false,
    error: "We couldn't save your changes right now. Please try again.",
  };
}

function revalidateAccountPaths(role: "CUSTOMER" | "WHOLESALE_CUSTOMER") {
  const basePath = getAccountBasePathForRole(role);

  revalidatePath(basePath);
  revalidatePath(`${basePath}/settings`);
  revalidatePath(`${basePath}/orders`);
  revalidatePath("/checkout");
}

export async function updateCustomerProfileAction(
  input: unknown,
): Promise<ActionResponse> {
  const user = await requireRetailUser();
  const parsed = customerAccountSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your profile details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        businessName: normalizeOptionalText(parsed.data.businessName),
      },
      select: {
        name: true,
        email: true,
        businessName: true,
      },
    });

    await unstable_update({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        businessName: updatedUser.businessName,
      },
    });

    revalidateAccountPaths("CUSTOMER");

    return {
      success: true,
      message: "Your profile details have been updated.",
    };
  } catch (error) {
    return buildAccountUpdateError(error);
  }
}

export async function updateDefaultAddressAction(
  input: unknown,
): Promise<ActionResponse> {
  const sessionUser = await requireCustomerUser();
  const parsed = defaultAddressSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your address details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        role: true,
        name: true,
        phone: true,
        businessName: true,
        wholesaleProfile: {
          select: {
            mobileNumber: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "We couldn't find your account. Please sign in again.",
      };
    }

    const phone = user.phone ?? user.wholesaleProfile?.mobileNumber ?? null;

    if (!phone) {
      return {
        success: false,
        error: "Add a phone number in your profile details before saving an address.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const existingDefaultAddress = await tx.address.findFirst({
        where: {
          userId: user.id,
          isDefault: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
        },
      });

      await tx.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });

      const addressData = {
        label:
          user.role === "WHOLESALE_CUSTOMER"
            ? "Default checkout address"
            : "Default shipping address",
        contactName: user.name,
        businessName: user.businessName,
        line1: parsed.data.line1,
        line2: normalizeOptionalText(parsed.data.line2),
        city: parsed.data.city,
        state: parsed.data.state,
        postalCode: parsed.data.postalCode,
        country: parsed.data.country,
        phone,
        isDefault: true,
      };

      if (existingDefaultAddress) {
        await tx.address.update({
          where: { id: existingDefaultAddress.id },
          data: addressData,
        });

        return;
      }

      await tx.address.create({
        data: {
          userId: user.id,
          ...addressData,
        },
      });
    });

    revalidateAccountPaths(
      sessionUser.role === "WHOLESALE_CUSTOMER"
        ? "WHOLESALE_CUSTOMER"
        : "CUSTOMER",
    );

    return {
      success: true,
      message: "Your default address has been saved.",
    };
  } catch (error) {
    return buildAccountUpdateError(error);
  }
}

export async function updateWholesaleContactAction(
  input: unknown,
): Promise<ActionResponse> {
  const user = await requireWholesaleUser();
  const parsed = wholesaleContactSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your contact details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();

  try {
    const fallbackProfile = await getWholesaleProfileFallback(user.id);

    if (!fallbackProfile) {
      return {
        success: false,
        error: "We couldn't find your wholesale account. Please sign in again.",
      };
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: fullName,
          email: parsed.data.email,
          phone: parsed.data.mobileNumber,
          businessName: normalizeOptionalText(parsed.data.tradingName),
        },
      });

      await tx.wholesaleProfile.upsert({
        where: { userId: user.id },
        create: {
          ...fallbackProfile,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          mobileNumber: parsed.data.mobileNumber,
          telephoneNumber: parsed.data.telephoneNumber,
          tradingName: normalizeOptionalText(parsed.data.tradingName),
        },
        update: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          mobileNumber: parsed.data.mobileNumber,
          telephoneNumber: parsed.data.telephoneNumber,
          tradingName: normalizeOptionalText(parsed.data.tradingName),
        },
      });

      return tx.user.findUniqueOrThrow({
        where: { id: user.id },
        select: {
          name: true,
          email: true,
          businessName: true,
        },
      });
    });

    await unstable_update({
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        businessName: updatedUser.businessName,
      },
    });

    revalidateAccountPaths("WHOLESALE_CUSTOMER");

    return {
      success: true,
      message: "Your wholesale contact details have been updated.",
    };
  } catch (error) {
    return buildAccountUpdateError(error);
  }
}

export async function updateWholesaleBusinessProfileAction(
  input: unknown,
): Promise<ActionResponse> {
  const user = await requireWholesaleUser();
  const parsed = wholesaleBusinessSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review your business details and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const fallbackProfile = await getWholesaleProfileFallback(user.id);

    if (!fallbackProfile) {
      return {
        success: false,
        error: "We couldn't find your wholesale account. Please sign in again.",
      };
    }

    await prisma.wholesaleProfile.upsert({
      where: { userId: user.id },
      create: {
        ...fallbackProfile,
        deliveryAddressLine1: parsed.data.deliveryAddressLine1,
        deliveryAddressLine2: normalizeOptionalText(
          parsed.data.deliveryAddressLine2,
        ),
        deliveryAddressLine3: normalizeOptionalText(
          parsed.data.deliveryAddressLine3,
        ),
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
        businessType: parsed.data.businessType,
      },
      update: {
        deliveryAddressLine1: parsed.data.deliveryAddressLine1,
        deliveryAddressLine2: normalizeOptionalText(
          parsed.data.deliveryAddressLine2,
        ),
        deliveryAddressLine3: normalizeOptionalText(
          parsed.data.deliveryAddressLine3,
        ),
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
        businessType: parsed.data.businessType,
      },
    });

    revalidateAccountPaths("WHOLESALE_CUSTOMER");

    return {
      success: true,
      message: "Your wholesale business profile has been updated.",
    };
  } catch (error) {
    return buildAccountUpdateError(error);
  }
}
