import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120, "Name must be 120 characters or fewer"),
  email: z.email("Enter a valid email address").trim().toLowerCase(),
  phone: z.string().trim().max(40, "Phone must be 40 characters or fewer").optional(),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(160, "Subject must be 160 characters or fewer"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be 2000 characters or fewer")
});

export type ContactInput = z.infer<typeof contactSchema>;