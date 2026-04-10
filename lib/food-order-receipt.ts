import { companyDetails } from "@/lib/company-details";
import { formatCurrency, formatDate } from "@/lib/utils";

type FoodReceiptPayload = {
  orderNumber: string;
  status: string;
  createdAt: Date | string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  fulfillmentType: "DELIVERY" | "PICKUP";
  kitchenName: string;
  customer: {
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  address: {
    recipientName: string;
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
    deliveryInstructions?: string | null;
  };
  items: Array<{
    foodItemName: string;
    foodItemSlug: string;
    foodCategoryName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    selectedOptions: string[];
  }>;
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

function formatAddress(payload: FoodReceiptPayload["address"]) {
  return [
    payload.recipientName,
    payload.line1,
    payload.line2,
    `${payload.city}, ${payload.state} ${payload.postalCode}`,
    payload.country,
    payload.phone,
    payload.deliveryInstructions ? `Instructions: ${payload.deliveryInstructions}` : null,
  ]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join("<br />");
}

function buildFoodItemRows(items: FoodReceiptPayload["items"]) {
  return items
    .map((item) => {
      const options = item.selectedOptions.length
        ? `<div class="receipt-item-meta">${item.selectedOptions
            .map((entry) => escapeHtml(entry))
            .join("<br />")}</div>`
        : "";

      return `
        <tr>
          <td>
            <strong>${escapeHtml(item.foodItemName)}</strong>
            <div class="receipt-item-meta">${escapeHtml(item.foodCategoryName)} | ${escapeHtml(item.foodItemSlug)}</div>
            ${options}
          </td>
          <td class="receipt-center">${item.quantity}</td>
          <td class="receipt-right">${formatCurrency(item.unitPrice)}</td>
          <td class="receipt-right">${formatCurrency(item.lineTotal)}</td>
        </tr>
      `;
    })
    .join("");
}

export function getFoodOrderReceiptFilename(orderNumber: string) {
  const safeOrderNumber = orderNumber.replace(/[^a-zA-Z0-9-_]+/g, "-");
  return `food-receipt-${safeOrderNumber}.html`;
}

export function buildFoodOrderReceiptHtml(payload: FoodReceiptPayload) {
  const notes = payload.notes?.trim() ? escapeHtml(payload.notes).replace(/\n/g, "<br />") : "";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(payload.orderNumber)} food receipt</title>
    <style>
      * { box-sizing: border-box; }
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
        border: 1px solid rgba(47,45,41,0.08);
        border-radius: 18px;
        padding: 28px;
      }
      .receipt-grid {
        display: grid;
        gap: 14px;
        margin-top: 22px;
      }
      @media (min-width: 720px) {
        .receipt-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
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
      .receipt-panel {
        border: 1px solid rgba(47,45,41,0.08);
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
      th, td {
        padding: 12px 0;
        border-bottom: 1px solid rgba(47,45,41,0.08);
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
      .receipt-item-meta {
        margin-top: 4px;
        color: #6b665f;
        font-size: 12px;
        line-height: 1.6;
      }
      .receipt-right { text-align: right; }
      .receipt-center { text-align: center; }
      .receipt-summary {
        margin-top: 22px;
        margin-left: auto;
        max-width: 320px;
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
      .receipt-summary-row strong { color: #2f2d29; }
      .receipt-total {
        border-top: 1px solid rgba(47,45,41,0.08);
        margin-top: 4px;
        padding-top: 10px;
      }
      .receipt-notes {
        margin-top: 24px;
        border: 1px solid rgba(47,45,41,0.08);
        border-radius: 14px;
        padding: 16px;
        background: #ffffff;
      }
    </style>
  </head>
  <body>
    <main class="receipt-shell">
      <p class="receipt-eyebrow">${escapeHtml(companyDetails.brandName)}</p>
      <h1 class="receipt-title">Food receipt for ${escapeHtml(payload.orderNumber)}</h1>
      <p class="receipt-copy">This receipt confirms your ${payload.fulfillmentType === "PICKUP" ? "pickup" : "delivery"} order from ${escapeHtml(payload.kitchenName)}.</p>

      <section class="receipt-grid">
        <div class="receipt-panel">
          <p class="receipt-panel-title">Order details</p>
          <p class="receipt-panel-copy">
            <strong>Order number:</strong> ${escapeHtml(payload.orderNumber)}<br />
            <strong>Status:</strong> ${escapeHtml(payload.status.replace(/_/g, " "))}<br />
            <strong>Date:</strong> ${escapeHtml(formatDate(payload.createdAt))}<br />
            <strong>Items:</strong> ${payload.itemCount}<br />
            <strong>Method:</strong> ${payload.fulfillmentType === "PICKUP" ? "Pickup" : "Delivery"}
          </p>
        </div>
        <div class="receipt-panel">
          <p class="receipt-panel-title">Customer</p>
          <p class="receipt-panel-copy">
            <strong>Name:</strong> ${escapeHtml(payload.customer.name)}<br />
            <strong>Email:</strong> ${escapeHtml(payload.customer.email?.trim() || "Not available")}<br />
            <strong>Phone:</strong> ${escapeHtml(payload.customer.phone?.trim() || payload.address.phone)}
          </p>
        </div>
        <div class="receipt-panel">
          <p class="receipt-panel-title">${payload.fulfillmentType === "PICKUP" ? "Pickup location" : "Delivery address"}</p>
          <p class="receipt-panel-copy">${formatAddress(payload.address)}</p>
        </div>
        <div class="receipt-panel">
          <p class="receipt-panel-title">Kitchen</p>
          <p class="receipt-panel-copy">
            <strong>${escapeHtml(payload.kitchenName)}</strong><br />
            ${escapeHtml(companyDetails.email)}
          </p>
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="receipt-center">Qty</th>
            <th class="receipt-right">Unit</th>
            <th class="receipt-right">Line total</th>
          </tr>
        </thead>
        <tbody>
          ${buildFoodItemRows(payload.items)}
        </tbody>
      </table>

      <section class="receipt-summary">
        <div class="receipt-summary-row">
          <span>Subtotal</span>
          <span>${formatCurrency(payload.subtotal)}</span>
        </div>
        <div class="receipt-summary-row">
          <span>${payload.fulfillmentType === "PICKUP" ? "Pickup fee" : "Delivery fee"}</span>
          <span>${formatCurrency(payload.deliveryFee)}</span>
        </div>
        <div class="receipt-summary-row receipt-total">
          <strong>Total</strong>
          <strong>${formatCurrency(payload.total)}</strong>
        </div>
      </section>

      ${notes ? `<section class="receipt-notes"><p class="receipt-panel-title">Notes</p><p class="receipt-panel-copy">${notes}</p></section>` : ""}
    </main>
  </body>
</html>`;
}
