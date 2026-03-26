import nodemailer from "nodemailer";
import { Resend } from "resend";

import { env } from "@/lib/env";
import { type PricingMode } from "@/lib/user-roles";
import { formatCurrency, formatDate } from "@/lib/utils";

type OrderEmailItem = {
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type OrderEmailPayload = {
  pricingMode: PricingMode;
  orderNumber: string;
  status: string;
  createdAt: Date | string;
  total: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    businessName?: string | null;
  };
  shippingAddress: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderEmailItem[];
  notes?: string | null;
};

function formatAddress(address: OrderEmailPayload["shippingAddress"]) {
  return [address.line1, address.line2, `${address.city}, ${address.state} ${address.postalCode}`, address.country]
    .filter(Boolean)
    .join(", ");
}

function buildItemsTable(items: OrderEmailItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${item.productName}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0;">${item.productSku}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.unitPrice)}</td>
          <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `
    )
    .join("");
}

function createEmailHtml(title: string, intro: string, payload: OrderEmailPayload) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f8fafc; padding: 32px;">
      <div style="max-width: 720px; margin: 0 auto; background: white; border-radius: 20px; padding: 32px; border: 1px solid #e2e8f0;">
        <p style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #92400e; margin: 0 0 8px;">Harvest Wholesale</p>
        <h1 style="margin: 0; font-size: 28px; color: #0f172a;">${title}</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.7; margin-top: 16px;">${intro}</p>

        <div style="display: grid; gap: 12px; margin-top: 24px; padding: 20px; border-radius: 16px; background: #fff7ed;">
          <p style="margin: 0;"><strong>Order number:</strong> ${payload.orderNumber}</p>
          <p style="margin: 0;"><strong>Status:</strong> ${payload.status}</p>
          <p style="margin: 0;"><strong>Date:</strong> ${formatDate(payload.createdAt)}</p>
          <p style="margin: 0;"><strong>Customer:</strong> ${payload.customer.name} (${payload.customer.email})</p>
          <p style="margin: 0;"><strong>Business:</strong> ${payload.customer.businessName ?? "N/A"}</p>
          <p style="margin: 0;"><strong>Phone:</strong> ${payload.customer.phone}</p>
          <p style="margin: 0;"><strong>Shipping address:</strong> ${formatAddress(payload.shippingAddress)}</p>
        </div>

        <table style="width: 100%; margin-top: 28px; border-collapse: collapse;">
          <thead>
            <tr style="text-align: left; color: #475569;">
              <th style="padding-bottom: 12px;">Item</th>
              <th style="padding-bottom: 12px;">SKU</th>
              <th style="padding-bottom: 12px; text-align: center;">Qty</th>
              <th style="padding-bottom: 12px; text-align: right;">Unit</th>
              <th style="padding-bottom: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${buildItemsTable(payload.items)}
          </tbody>
        </table>

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; font-size: 18px;"><strong>Order total:</strong> ${formatCurrency(payload.total)}</p>
          ${
            payload.notes
              ? `<p style="margin: 16px 0 0; color: #475569;"><strong>Notes:</strong> ${payload.notes}</p>`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

function createTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: env.SMTP_SECURE === "true",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const from = env.EMAIL_FROM || "Harvest Wholesale <no-reply@example.com>";

  if (env.RESEND_API_KEY) {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from,
      to,
      subject,
      html
    });
    return;
  }

  const transporter = createTransporter();

  if (transporter) {
    await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
    return;
  }

  console.warn(`[email] Email provider not configured. Skipping email to ${to}: ${subject}`);
}

export async function sendOrderEmails(payload: OrderEmailPayload) {
  const customerHtml = createEmailHtml(
    payload.pricingMode === "wholesale" ? "Your wholesale order has been received" : "Your order has been received",
    payload.pricingMode === "wholesale"
      ? "Thanks for placing your wholesale order with Harvest Wholesale. Our team is reviewing your items and will keep you updated as the order moves through fulfillment."
      : "Thanks for placing your order with Harvest Wholesale. Our team is reviewing your items and will keep you updated as the order moves through fulfillment.",
    payload
  );

  const adminHtml = createEmailHtml(
    payload.pricingMode === "wholesale" ? "New wholesale order received" : "New retail order received",
    payload.pricingMode === "wholesale"
      ? "A new wholesale order has been placed and is ready for review in the admin dashboard."
      : "A new retail order has been placed and is ready for review in the admin dashboard.",
    payload
  );

  await Promise.all([
    sendMail({
      to: payload.customer.email,
      subject: `Order confirmation ${payload.orderNumber}`,
      html: customerHtml
    }),
    env.ADMIN_NOTIFICATION_EMAIL
      ? sendMail({
          to: env.ADMIN_NOTIFICATION_EMAIL,
          subject: `${payload.pricingMode === "wholesale" ? "New wholesale" : "New retail"} order ${payload.orderNumber}`,
          html: adminHtml
        })
      : Promise.resolve()
  ]);
}

