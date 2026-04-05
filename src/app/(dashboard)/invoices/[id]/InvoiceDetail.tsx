'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle, Download, Mail, Bell, RefreshCw } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate, formatDateTime } from '@/lib/utils/date'
import { updateInvoiceStatusAction, sendInvoiceEmailAction, sendPaymentReminderAction } from '../../actions'
import { INVOICE_STATUSES } from '@/lib/constants'
import type { Invoice, InvoiceLineItem } from '@/types'

interface Props {
  invoice: Invoice
}

export function InvoiceDetail({ invoice }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const statusInfo = INVOICE_STATUSES[invoice.status]
  const lineItems = (invoice.line_items ?? []) as InvoiceLineItem[]

  function emailClient() {
    startTransition(async () => {
      const result = await sendInvoiceEmailAction(invoice.id)
      if ('error' in result) {
        alert(result.error)
      } else {
        alert('Invoice emailed to ' + (invoice.client?.email ?? 'client') + ' ✓')
        router.refresh()
      }
    })
  }

  function sendReminder() {
    if (!confirm(`Send a payment reminder to ${invoice.client?.email ?? 'client'}?`)) return
    startTransition(async () => {
      const result = await sendPaymentReminderAction(invoice.id)
      if ('error' in result) {
        alert(result.error)
      } else {
        alert('Reminder sent ✓')
      }
    })
  }

  function markAs(status: 'sent' | 'paid') {
    startTransition(async () => {
      const result = await updateInvoiceStatusAction(invoice.id, status)
      if ('error' in result) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/invoices" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 block">
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to Invoices
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <Badge variant={statusInfo.color as 'gray' | 'blue' | 'green' | 'red' | 'purple'} size="md">
              {statusInfo.label}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a href={`/api/pdf/invoice/${invoice.id}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </a>
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <Button variant="outline" size="sm" onClick={emailClient} loading={isPending}>
              <Mail className="h-4 w-4" />
              Email Client
            </Button>
          )}
          {invoice.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={() => markAs('sent')} loading={isPending}>
              <Send className="h-4 w-4" />
              Mark as Sent
            </Button>
          )}
          {(invoice.status === 'sent' || invoice.status === 'viewed' || invoice.status === 'overdue') && (
            <>
              <Button variant="outline" size="sm" onClick={sendReminder} loading={isPending}>
                <Bell className="h-4 w-4" />
                Send Reminder
              </Button>
              <Button size="sm" onClick={() => markAs('paid')} loading={isPending}>
                <CheckCircle className="h-4 w-4" />
                Mark as Paid
              </Button>
            </>
          )}
          {invoice.recurring_interval && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
              <RefreshCw className="h-3 w-3" />
              {invoice.recurring_interval}
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Client</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{invoice.client?.name ?? '—'}</p>
          {invoice.client?.company && <p className="text-xs text-gray-500">{invoice.client.company}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Currency</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{invoice.currency}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Due Date</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {invoice.due_date ? formatDate(invoice.due_date) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(invoice.created_at)}</p>
        </div>
      </div>

      {/* Paid info */}
      {invoice.status === 'paid' && invoice.paid_at && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">
            Payment received on {formatDateTime(invoice.paid_at)}
            {invoice.payment_method && ` via ${invoice.payment_method.replace('_', ' ')}`}
          </p>
        </div>
      )}

      {/* Line Items */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Description', 'Qty', 'Unit Price', 'Tax %', 'Amount'].map((h) => (
                <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 ${h === 'Description' ? 'text-left' : 'text-right'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lineItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No line items.</td>
              </tr>
            ) : (
              lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {formatCurrency(item.unit_price_cents, invoice.currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{item.tax_rate}%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(item.amount_cents, invoice.currency)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4">
          <div className="ml-auto w-64 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal_cents, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <span>{formatCurrency(invoice.tax_cents, invoice.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1.5 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(invoice.total_cents, invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      )}
    </div>
  )
}
