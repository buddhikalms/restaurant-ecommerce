import { z } from "zod";

export const wholesaleCompanyTypes = [
  "Limited company",
  "Sole Trader",
  "Partnership",
  "Charity Organisation",
] as const;

export const wholesaleBusinessTypes = [
  "Cafe",
  "Care home",
  "Restaurant",
  "Shop",
  "Hospitality",
  "Other",
] as const;

export const loginSchema = z.object({
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters")
});

const customerRegisterBaseSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  phone: z.string().trim().min(7, "Phone is required"),
  businessName: z
    .string()
    .trim()
    .max(120, "Business name must be 120 characters or fewer")
    .optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm your password")
});

const wholesaleRegisterBaseSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  mobileNumber: z.string().trim().min(7, "Mobile number is required"),
  telephoneNumber: z.string().trim().min(7, "Telephone number is required"),
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
  tradingName: z.string().trim().max(120, "Trading name must be 120 characters or fewer").optional(),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  companyType: z.string().trim().min(1, "Select company type"),
  companyNumber: z.string().trim().max(40, "Company registration number must be 40 characters or fewer").optional(),
  directorName: z.string().trim().max(120, "Director name must be 120 characters or fewer").optional(),
  businessType: z.string().trim().min(1, "Select business type"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm your password")
});

export const customerRegisterSchema = customerRegisterBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  }
);

export const wholesaleRegisterSchema = wholesaleRegisterBaseSchema.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "Passwords do not match"
    });
  }

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
