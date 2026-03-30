import { z } from "zod";

import { wholesaleBusinessTypes, wholesaleCompanyTypes } from "@/lib/validations/auth";

export const customerAccountSettingsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  phone: z.string().trim().min(7, "Phone is required"),
  businessName: z
    .string()
    .trim()
    .max(120, "Business name must be 120 characters or fewer")
    .optional()
});

export const defaultAddressSettingsSchema = z.object({
  line1: z.string().trim().min(3, "Address line 1 is required"),
  line2: z.string().trim().max(120, "Line 2 must be 120 characters or fewer").optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State or province is required"),
  postalCode: z.string().trim().min(3, "Postal code is required"),
  country: z.string().trim().min(2, "Country is required")
});

export const wholesaleContactSettingsSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  mobileNumber: z.string().trim().min(7, "Mobile number is required"),
  telephoneNumber: z.string().trim().min(7, "Telephone number is required"),
  tradingName: z
    .string()
    .trim()
    .max(120, "Trading name must be 120 characters or fewer")
    .optional()
});

export const wholesaleBusinessSettingsSchema = z
  .object({
    deliveryAddressLine1: z.string().trim().min(3, "Delivery address is required"),
    deliveryAddressLine2: z.string().trim().max(120, "Line 2 must be 120 characters or fewer").optional(),
    deliveryAddressLine3: z.string().trim().max(120, "Line 3 must be 120 characters or fewer").optional(),
    deliveryTown: z.string().trim().min(2, "Delivery town is required"),
    deliveryPostcode: z.string().trim().min(3, "Delivery postcode is required"),
    differentInvoiceAddress: z.boolean().default(false),
    invoiceAddressLine1: z.string().trim().max(120, "Invoice address must be 120 characters or fewer").optional(),
    invoiceAddressLine2: z.string().trim().max(120, "Line 2 must be 120 characters or fewer").optional(),
    invoiceAddressLine3: z.string().trim().max(120, "Line 3 must be 120 characters or fewer").optional(),
    invoiceTown: z.string().trim().max(80, "Invoice town must be 80 characters or fewer").optional(),
    invoicePostcode: z.string().trim().max(20, "Invoice postcode must be 20 characters or fewer").optional(),
    companyType: z.string().trim().min(1, "Select company type"),
    companyNumber: z
      .string()
      .trim()
      .max(40, "Company registration number must be 40 characters or fewer")
      .optional(),
    directorName: z.string().trim().max(120, "Director name must be 120 characters or fewer").optional(),
    businessType: z.string().trim().min(1, "Select business type")
  })
  .superRefine((data, ctx) => {
    if (!wholesaleCompanyTypes.includes(data.companyType as (typeof wholesaleCompanyTypes)[number])) {
      ctx.addIssue({
        code: "custom",
        path: ["companyType"],
        message: "Select company type"
      });
    }

    if (!wholesaleBusinessTypes.includes(data.businessType as (typeof wholesaleBusinessTypes)[number])) {
      ctx.addIssue({
        code: "custom",
        path: ["businessType"],
        message: "Select business type"
      });
    }

    if (data.companyType === "Limited company") {
      if (!data.companyNumber?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["companyNumber"],
          message: "Company registration number is required for limited companies"
        });
      }

      if (!data.directorName?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["directorName"],
          message: "Director name is required for limited companies"
        });
      }
    }

    if (data.differentInvoiceAddress) {
      if (!data.invoiceAddressLine1?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["invoiceAddressLine1"],
          message: "Invoice address is required"
        });
      }

      if (!data.invoiceTown?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["invoiceTown"],
          message: "Invoice town is required"
        });
      }

      if (!data.invoicePostcode?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["invoicePostcode"],
          message: "Invoice postcode is required"
        });
      }
    }
  });

export type CustomerAccountSettingsInput = z.infer<typeof customerAccountSettingsSchema>;
export type DefaultAddressSettingsInput = z.infer<typeof defaultAddressSettingsSchema>;
export type WholesaleContactSettingsInput = z.infer<typeof wholesaleContactSettingsSchema>;
export type WholesaleBusinessSettingsInput = z.infer<typeof wholesaleBusinessSettingsSchema>;
