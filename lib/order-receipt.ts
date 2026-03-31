import { companyDetails } from "@/lib/company-details";
import { type PricingMode } from "@/lib/user-roles";
import { formatCurrency, formatDate } from "@/lib/utils";

type ReceiptItem = {
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

type ReceiptAddress = {
  contactName: string;
  businessName?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
};

type OrderReceiptPayload = {
  pricingMode: PricingMode;
  orderNumber: string;
  status: string;
  createdAt: Date | string;
  subtotal: number;
  total: number;
  itemCount: number;
  customer: {
    name: string;
    email?: string | null;
    businessName?: string | null;
  };
  shippingAddress: ReceiptAddress;
  items: ReceiptItem[];
  notes?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatStatus(value: string) {
  return value.replace(/_/g, " ");
}

function formatAddress(address: ReceiptAddress) {
  return [
    address.contactName,
    address.businessName,
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.postalCode}`,
    address.country,
    address.phone,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join("<br />");
}

function formatCompanyDetails() {
  return [companyDetails.legalName, companyDetails.email, ...companyDetails.addressLines]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join("<br />");
}

function buildItemRows(items: ReceiptItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.productName)}</td>
          <td>${escapeHtml(item.productSku)}</td>
          <td class="receipt-center">${item.quantity}</td>
          <td class="receipt-right">${formatCurrency(item.unitPrice)}</td>
          <td class="receipt-right">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `
    )
    .join("");
}

export function getOrderReceiptFilename(orderNumber: string) {
  const safeOrderNumber = orderNumber.replace(/[^a-zA-Z0-9-_]+/g, "-");
  return `receipt-${safeOrderNumber}.html`;
}

export function buildOrderReceiptHtml(payload: OrderReceiptPayload) {
  const title = payload.pricingMode === "wholesale" ? "Wholesale receipt" : "Order receipt";
  const customerEmail = payload.customer.email?.trim() ? payload.customer.email : "Not available";
  const customerBusiness = payload.customer.businessName?.trim()
    ? payload.customer.businessName
    : payload.shippingAddress.businessName?.trim()
      ? payload.shippingAddress.businessName
      : "Not provided";
  const notes = payload.notes?.trim() ? escapeHtml(payload.notes).replace(/\n/g, "<br />") : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(payload.orderNumber)} receipt</title>
    <style>
      :root {
        color-scheme: light;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 32px;
        background: #faf7f2;
        color: #2f2d29;
        font-family: Inter, Poppins, "Segoe UI", sans-serif;
      }

      .receipt-shell {
        max-width: 860px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid rgba(47, 45, 41, 0.08);
        border-radius: 18px;
        padding: 28px;
      }

      .receipt-header {
        display: grid;
        gap: 18px;
      }

      @media (min-width: 720px) {
        .receipt-header {
          grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
          align-items: start;
        }
      }

      .receipt-eyebrow {
        margin: 0;
        color: #9e5846;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .receipt-title {
        margin: 10px 0 0;
        font-size: 28px;
        line-height: 1.2;
      }

      .receipt-copy {
        margin: 10px 0 0;
        color: #6b665f;
        font-size: 14px;
        line-height: 1.7;
      }

      .receipt-grid {
        display: grid;
        gap: 14px;
        margin-top: 22px;
      }

      @media (min-width: 720px) {
        .receipt-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      .receipt-panel {
        border: 1px solid rgba(47, 45, 41, 0.08);
        border-radius: 14px;
        background: #f8f4ee;
        padding: 16px;
      }

      .receipt-panel-title {
        margin: 0;
        color: #9e5846;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .receipt-panel-copy {
        margin: 10px 0 0;
        font-size: 14px;
        line-height: 1.7;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 24px;
      }

      th,
      td {
        padding: 12px 0;
        border-bottom: 1px solid rgba(47, 45, 41, 0.08);
        font-size: 14px;
        vertical-align: top;
      }

      th {
        color: #6b665f;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        text-align: left;
      }

      .receipt-right {
        text-align: right;
      }

      .receipt-center {
        text-align: center;
      }

      .receipt-summary {
        margin-top: 22px;
        margin-left: auto;
        max-width: 280px;
      }

      .receipt-summary-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
        font-size: 14px;
        color: #6b665f;
      }

      .receipt-summary-row strong {
        color: #2f2d29;
      }

      .receipt-total {
        border-top: 1px solid rgba(47, 45, 41, 0.08);
        margin-top: 4px;
        padding-top: 10px;
      }

      .receipt-notes {
        margin-top: 24px;
        border: 1px solid rgba(47, 45, 41, 0.08);
        border-radius: 14px;
        padding: 16px;
        background: #ffffff;
      }

      .receipt-footer {
        margin-top: 24px;
        color: #6b665f;
        font-size: 12px;
        line-height: 1.6;
      }

      @media print {
        body {
          background: #ffffff;
          padding: 0;
        }

        .receipt-shell {
          border: 0;
          border-radius: 0;
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <main class="receipt-shell">
      <section class="receipt-header">
        <div>
          <p class="receipt-eyebrow">${escapeHtml(companyDetails.brandName)}</p>
          <h1 class="receipt-title">${escapeHtml(title)} for ${escapeHtml(payload.orderNumber)}</h1>
          <p class="receipt-copy">Keep this copy for your records. It includes the order summary, delivery details, and purchased items.</p>
        </div>
        <div class="receipt-panel">
          <p class="receipt-panel-title">Company details</p>
          <p class="receipt-panel-copy">${formatCompanyDetails()}</p>
        </div>
      </section>

      <section class="receipt-grid">
        <div class="receipt-panel">
          <p class="receipt-panel-title">Order details</p>
          <p class="receipt-panel-copy">
            <strong>Order number:</strong> ${escapeHtml(payload.orderNumber)}<br />
            <strong>Status:</strong> ${escapeHtml(formatStatus(payload.status))}<br />
            <strong>Date:</strong> ${escapeHtml(formatDate(payload.createdAt))}<br />
            <strong>Items:</strong> ${payload.itemCount}
          </p>
        </div>
        <div class="receipt-panel">
          <p class="receipt-panel-title">Customer</p>
          <p class="receipt-panel-copy">
            <strong>Name:</strong> ${escapeHtml(payload.customer.name)}<br />
            <strong>Email:</strong> ${escapeHtml(customerEmail)}<br />
            <strong>Business:</strong> ${escapeHtml(customerBusiness)}
          </p>
        </div>
        <div class="receipt-panel">
          <p class="receipt-panel-title">Shipping address</p>
          <p class="receipt-panel-copy">${formatAddress(payload.shippingAddress)}</p>
        </div>
        <div class="receipt-panel">
          <p class="receipt-panel-title">Order type</p>
          <p class="receipt-panel-copy">
            <strong>Pricing mode:</strong> ${payload.pricingMode === "wholesale" ? "Wholesale" : "Retail"}<br />
            <strong>Generated:</strong> ${escapeHtml(formatDate(new Date()))}
          </p>
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>SKU</th>
            <th class="receipt-center">Qty</th>
            <th class="receipt-right">Unit</th>
            <th class="receipt-right">Line total</th>
          </tr>
        </thead>
        <tbody>
          ${buildItemRows(payload.items)}
        </tbody>
      </table>

      <section class="receipt-summary">
        <div class="receipt-summary-row">
          <span>Subtotal</span>
          <span>${formatCurrency(payload.subtotal)}</span>
        </div>
        <div class="receipt-summary-row receipt-total">
          <strong>Total</strong>
          <strong>${formatCurrency(payload.total)}</strong>
        </div>
      </section>

      ${notes ? `<section class="receipt-notes"><p class="receipt-panel-title">Notes</p><p class="receipt-panel-copy">${notes}</p></section>` : ""}

      <p class="receipt-footer">This receipt was downloaded from your account dashboard. If you have any questions, contact the ${escapeHtml(companyDetails.brandName)} team with your order number.</p>
    </main>
  </body>
</html>`;
}
