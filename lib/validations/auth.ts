import { z } from "zod";

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
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  businessName: z.string().trim().min(2, "Business name must be at least 2 characters"),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  phone: z.string().trim().min(7, "Phone is required"),
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

export const wholesaleRegisterSchema = wholesaleRegisterBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  }
);

