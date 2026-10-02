import type { Order } from "@/lib/types";
import { formatCents } from "@/lib/format";

interface EmailItem {
  product_name: string;
  quantity: number;
  unit_price_cents: number;
}

interface SendOrderConfirmationParams {
  to: string;
  order: Order;
  items: EmailItem[];
}

export async function sendOrderConfirmationEmail({
  to,
  order,
  items,
}: SendOrderConfirmationParams): Promise<{ skipped?: boolean }> {
  const domain = process.env.MAILGUN_DOMAIN;
  const apiKey = process.env.MAILGUN_API_KEY;
  const from =
    process.env.MAILGUN_FROM ?? "PhoneDeck <no-reply@yourdomain.mailgun.org>";

  if (!domain || !apiKey) {
    console.warn("Mailgun not configured; skipping confirmation email.");
    return { skipped: true };
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(
            item.product_name
          )} &times; ${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">
            ${formatCents(item.unit_price_cents * item.quantity)}
          </td>
        </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;">
      <h2 style="margin:0 0 16px;">Thanks for your order, ${escapeHtml(
        order.customer_name
      )}!</h2>
      <p style="color:#444;">Your order <strong>#${order.id.slice(
        0,
        8
      )}</strong> has been confirmed and is being prepared for shipment.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${rows}
        <tr>
          <td style="padding:8px;">Subtotal</td>
          <td style="padding:8px;text-align:right;">${formatCents(
            order.subtotal_cents
          )}</td>
        </tr>
        <tr>
          <td style="padding:8px;">Shipping</td>
          <td style="padding:8px;text-align:right;">${formatCents(
            order.shipping_cents
          )}</td>
        </tr>
        <tr>
          <td style="padding:8px;font-weight:bold;">Total</td>
          <td style="padding:8px;text-align:right;font-weight:bold;">${formatCents(
            order.total_cents
          )}</td>
        </tr>
      </table>
      <p style="color:#444;">Shipping to:</p>
      <p style="color:#444;margin-top:0;">
        ${escapeHtml(order.customer_name)}<br />
        ${escapeHtml(order.address_line1)}${
    order.address_line2 ? `<br />${escapeHtml(order.address_line2)}` : ""
  }<br />
        ${escapeHtml(order.city)}${
    order.state ? `, ${escapeHtml(order.state)}` : ""
  } ${escapeHtml(order.postal_code ?? "")}<br />
        ${escapeHtml(order.country)}
      </p>
      <p style="color:#666;font-size:12px;">This is an automated email — please do not reply directly.</p>
    </div>
  `;

  const form = new FormData();
  form.append("from", from);
  form.append("to", to);
  form.append("subject", `Order confirmation #${order.id.slice(0, 8)}`);
  form.append("html", html);

  const response = await fetch(
    `https://api.mailgun.net/v3/${domain}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mailgun error ${response.status}: ${text}`);
  }

  return {};
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
