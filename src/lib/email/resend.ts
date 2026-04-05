import { Resend } from 'resend'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import type { Invoice, Quote, Tenant, Client } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'WorkInvoice <invoices@workinvoice.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? ''

// ─── Invoice email ─────────────────────────────────────────────────────────

export async function sendInvoiceEmail({
  invoice,
  tenant,
  client,
  payUrl,
}: {
  invoice: Invoice
  tenant: Tenant & { portal_slug?: string }
  client: Client
  payUrl?: string
}) {
  const total = formatCurrency(invoice.total_cents, invoice.currency)
  const due = invoice.due_date ? formatDate(invoice.due_date) : 'on receipt'
  const pdfUrl = `${APP_URL}/api/pdf/invoice/${invoice.id}`
  const portalUrl = payUrl ?? (tenant.portal_slug ? `${APP_URL}/portal/${tenant.portal_slug}/invoice/${invoice.id}` : null)

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;color:#111827">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <!-- Header -->
    <div style="background:#7c3aed;padding:32px 40px">
      <p style="color:#ede9fe;font-size:13px;font-weight:600;letter-spacing:0.05em;margin:0 0 4px">INVOICE</p>
      <p style="color:#fff;font-size:24px;font-weight:700;margin:0">${invoice.invoice_number}</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px">
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Hi ${client.name},</p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
        Please find your invoice from <strong>${tenant.business_name ?? tenant.name}</strong> below.
      </p>

      <!-- Amount box -->
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:20px 24px;margin:0 0 28px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#6b7280;font-size:13px">Invoice Number</span>
          <span style="color:#111827;font-size:13px;font-weight:600">${invoice.invoice_number}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#6b7280;font-size:13px">Amount Due</span>
          <span style="color:#7c3aed;font-size:18px;font-weight:700">${total}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#6b7280;font-size:13px">Due Date</span>
          <span style="color:#111827;font-size:13px;font-weight:600">${due}</span>
        </div>
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:0 0 28px">
        ${portalUrl ? `
        <a href="${portalUrl}" style="background:#7c3aed;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:700;display:inline-block;margin-bottom:12px">
          Pay Now →
        </a>
        <br>` : ''}
        <a href="${pdfUrl}" style="color:#7c3aed;text-decoration:none;font-size:14px;font-weight:500">
          Download PDF
        </a>
      </div>

      ${invoice.notes ? `
      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin:0 0 24px">
        <p style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px">Notes</p>
        <p style="color:#374151;font-size:14px;margin:0;white-space:pre-wrap">${invoice.notes}</p>
      </div>` : ''}

      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0">
        If you have any questions, please reply to this email or contact us at
        <a href="mailto:${tenant.email}" style="color:#7c3aed">${tenant.email}</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center">
        Sent by ${tenant.business_name ?? tenant.name} via WorkInvoice
        ${tenant.gst_registered && tenant.gst_number ? `· GST Reg No: ${tenant.gst_number}` : ''}
      </p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: client.email,
    subject: `Invoice ${invoice.invoice_number} from ${tenant.business_name ?? tenant.name} — ${total}`,
    html,
    replyTo: tenant.email,
  })
}

// ─── Quote email ───────────────────────────────────────────────────────────

export async function sendQuoteEmail({
  quote,
  tenant,
  client,
}: {
  quote: Quote
  tenant: Tenant
  client: Client
}) {
  const total = formatCurrency(quote.total_cents, quote.currency)
  const validUntil = quote.valid_until ? formatDate(quote.valid_until) : null
  const pdfUrl = `${APP_URL}/api/pdf/quote/${quote.id}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;color:#111827">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <!-- Header -->
    <div style="background:#7c3aed;padding:32px 40px">
      <p style="color:#ede9fe;font-size:13px;font-weight:600;letter-spacing:0.05em;margin:0 0 4px">PROPOSAL</p>
      <p style="color:#fff;font-size:24px;font-weight:700;margin:0">${quote.title}</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 40px">
      <p style="color:#6b7280;font-size:14px;margin:0 0 24px">Hi ${client.name},</p>
      <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 24px">
        <strong>${tenant.business_name ?? tenant.name}</strong> has sent you a project proposal.
        Please review and get back to us at your earliest convenience.
      </p>

      <!-- Amount box -->
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:20px 24px;margin:0 0 28px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px">
          <span style="color:#6b7280;font-size:13px">Quote Number</span>
          <span style="color:#111827;font-size:13px;font-weight:600">${quote.quote_number}</span>
        </div>
        <div style="display:flex;justify-content:space-between;${validUntil ? 'margin-bottom:8px' : ''}">
          <span style="color:#6b7280;font-size:13px">Total Value</span>
          <span style="color:#7c3aed;font-size:18px;font-weight:700">${total}</span>
        </div>
        ${validUntil ? `
        <div style="display:flex;justify-content:space-between">
          <span style="color:#6b7280;font-size:13px">Valid Until</span>
          <span style="color:#111827;font-size:13px;font-weight:600">${validUntil}</span>
        </div>` : ''}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin:0 0 28px">
        <a href="${pdfUrl}" style="background:#7c3aed;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;display:inline-block">
          View Proposal PDF
        </a>
      </div>

      ${quote.notes ? `
      <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin:0 0 24px">
        <p style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px">Notes</p>
        <p style="color:#374151;font-size:14px;margin:0;white-space:pre-wrap">${quote.notes}</p>
      </div>` : ''}

      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0">
        To accept or discuss this proposal, reply to this email or contact us at
        <a href="mailto:${tenant.email}" style="color:#7c3aed">${tenant.email}</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb">
      <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center">
        Sent by ${tenant.business_name ?? tenant.name} via WorkInvoice
      </p>
    </div>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM,
    to: client.email,
    subject: `Proposal from ${tenant.business_name ?? tenant.name}: ${quote.title}`,
    html,
    replyTo: tenant.email,
  })
}
