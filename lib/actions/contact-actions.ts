"use server";

import { ActionResponse } from "@/lib/actions/action-response";
import { canSendEmail, getContactNotificationEmail, sendContactEmails } from "@/lib/email";
import { contactSchema } from "@/lib/validations/contact";

export async function submitContactFormAction(input: unknown): Promise<ActionResponse> {
  const parsed = contactSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please review the contact form and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors
    };
  }

  if (!canSendEmail()) {
    return {
      success: false,
      error: "Contact email is not configured yet. Add your Resend or SMTP settings first."
    };
  }

  if (!getContactNotificationEmail()) {
    return {
      success: false,
      error: "Set CONTACT_NOTIFICATION_EMAIL or ADMIN_NOTIFICATION_EMAIL to receive contact messages."
    };
  }

  try {
    await sendContactEmails(parsed.data);

    return {
      success: true,
      message: "Message sent successfully. We'll get back to you soon."
    };
  } catch (error) {
    console.error("[email] Failed to send contact emails", error);

    return {
      success: false,
      error: "Unable to send your message right now. Please try again."
    };
  }
}