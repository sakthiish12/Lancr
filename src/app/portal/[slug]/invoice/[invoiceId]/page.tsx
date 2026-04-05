import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { Zap, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import PayButton from './PayButton'
import type { Currency } from '@/types'

interface Props {
  params: Promise<{ slug: string; invoiceId: string }>
  searchParams: Promise<{ success?: string; cancelled?: string }>
}

type Tenant = {
  id: string
  name: string
  business_name: string | null
  email: string
  portal_slug: string
  gst_registered: boolean
  gst_number: string | null
  address: string | null
}

export default async function InvoicePayPage({ params, searchParams }: Props) {
  const { slug, invoiceId } = await params
  const { success, cancelled } = await searchParams

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name, business_name, email, portal_slug, gst_registered, gst_number, address')
    .eq('portal_slug', slug)
    .single()

  if (!tenant) notFound()

  const t = tenant as Tenant

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, client:clients(*), line_items:invoice_line_items(*)')
    .eq('id', invoiceId)
    .eq('tenant_id', t.id)
    .single()

  if (!invoice) notFound()

  const isPaid = invoice.status === 'paid'
  const currency = invoice.currency as Currency
  const lineItems = (invoice.line_items ?? []) as Array<{
    id: string
    description: string
    quantity: number
    unit_price_cents: number
    tax_rate: number
    amount_cents: number
  }>
  const client = invoice.client as { name: string; company: string | null } | null
  const displayName = t.business_name ?? t.name

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">{displayName}</span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-5">
        {/* Success banner */}
        {(success || isPaid) && (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Payment received — thank you!</p>
              {invoice.paid_at && (
                <p className="text-xs text-green-600 mt-0.5">Paid on {formatDate(invoice.paid_at)}</p>
              )}
            </div>
          </div>
        )}

        {/* Cancelled notice */}
        {cancelled && !isPaid && (
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
            <p className="text-sm text-yellow-800">Payment was cancelled. You can try again below.</p>
          </div>
        )}

        {/* Invoice header card */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Invoice from {displayName}</p>
              <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
              {client && (
                <p className="text-sm text-gray-500 mt-1">
                  To: {client.name}{client.company ? ` · ${client.company}` : ''}
                </p>
              )}
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isPaid
                ? 'bg-green-100 text-green-700'
                : 'bg-violet-100 text-violet-700'
            }`}>
              {isPaid ? 'Paid' : 'Payment due'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
            {invoice.due_date && (
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Due date</p>
                <p className="font-medium text-gray-900">{formatDate(invoice.due_date)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Currency</p>
              <p className="font-medium text-gray-900">{currency}</p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Description', 'Qty', 'Unit Price', 'Amount'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${h === 'Description' ? 'text-left' : 'text-right'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-400">No items</td>
                </tr>
              ) : lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {formatCurrency(item.unit_price_cents, currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(item.amount_cents, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
            <div className="ml-auto w-60 space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(invoice.subtotal_cents, currency)}</span>
              </div>
              {invoice.tax_cents > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax</span>
                  <span>{formatCurrency(invoice.tax_cents, currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                <span>Total due</span>
                <span>{formatCurrency(invoice.total_cents, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pay button — only if unpaid */}
        {!isPaid && (
          <PayButton
            invoiceId={invoice.id}
            totalFormatted={formatCurrency(invoice.total_cents, currency)}
          />
        )}

        {/* GST note */}
        {t.gst_registered && t.gst_number && (
          <p className="text-center text-xs text-gray-400">
            GST Reg No: {t.gst_number}
          </p>
        )}

        <p className="text-center text-xs text-gray-400 pb-6">
          Powered by <span className="font-semibold text-violet-500">Lancr</span> · Secure payments via Stripe
        </p>
      </main>
    </div>
  )
}
