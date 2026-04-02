'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileCheck, Send, ArrowRight } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { updateQuoteStatusAction, createInvoiceFromQuoteAction } from '../../actions'
import { QUOTE_STATUSES } from '@/lib/constants'
import type { Quote, QuoteLineItem } from '@/types'

interface Props {
  quote: Quote
}

export function QuoteDetail({ quote }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const statusInfo = QUOTE_STATUSES[quote.status]
  const lineItems = (quote.line_items ?? []) as QuoteLineItem[]

  function markAs(status: 'sent' | 'approved') {
    startTransition(async () => {
      const result = await updateQuoteStatusAction(quote.id, status)
      if ('error' in result) {
        alert(result.error)
      } else {
        router.refresh()
      }
    })
  }

  function convertToInvoice() {
    startTransition(async () => {
      const result = await createInvoiceFromQuoteAction(quote.id)
      if ('error' in result) {
        alert(result.error)
      } else if ('id' in result && result.id) {
        router.push(`/dashboard/invoices/${result.id}`)
      }
    })
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/dashboard/quotes" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 block">
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back to Quotes
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{quote.title}</h1>
            <Badge variant={statusInfo.color as 'gray' | 'blue' | 'green' | 'red' | 'orange'} size="md">
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1 font-mono">{quote.quote_number}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {quote.status === 'draft' && (
            <Button variant="outline" size="sm" onClick={() => markAs('sent')} loading={isPending}>
              <Send className="h-4 w-4" />
              Mark as Sent
            </Button>
          )}
          {quote.status === 'sent' && (
            <Button variant="outline" size="sm" onClick={() => markAs('approved')} loading={isPending}>
              <FileCheck className="h-4 w-4" />
              Mark as Approved
            </Button>
          )}
          {(quote.status === 'approved' || quote.status === 'sent') && (
            <Button size="sm" onClick={convertToInvoice} loading={isPending}>
              <ArrowRight className="h-4 w-4" />
              Convert to Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Client</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{quote.client?.name ?? '—'}</p>
          {quote.client?.company && <p className="text-xs text-gray-500">{quote.client.company}</p>}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Currency</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{quote.currency}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Valid Until</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {quote.valid_until ? formatDate(quote.valid_until) : '—'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{formatDate(quote.created_at)}</p>
        </div>
      </div>

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
                    {formatCurrency(item.unit_price_cents, quote.currency)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">{item.tax_rate}%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(item.amount_cents, quote.currency)}
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
              <span>{formatCurrency(quote.subtotal_cents, quote.currency)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <span>{formatCurrency(quote.tax_cents, quote.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-1.5 text-base font-bold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(quote.total_cents, quote.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {quote.notes && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Notes</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
        </div>
      )}
    </div>
  )
}
